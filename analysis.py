"""
Telco customer churn - retention analysis for the DVBA 2026 Datathon.

Reproduces every number shown in the team's executive dashboard / presentation:

  1. Data loading and cleaning
  2. Headline KPIs (churn rate, revenue lost, revenue at risk)
  3. Churn drivers (contract, tenure, internet product)
  4. Decision-tree segmentation (5 customer groups)
  5. Churn scoring (cross-validated logistic regression, AUC)
  6. Revenue at risk per customer and per segment
  7. Capacity curve (value ranking vs. score ranking vs. random)
  8. Business case (top-N programme, phase 1 / phase 2, break-even)
  9. Offer evidence (why each segment gets its offer)

Run:  python analysis.py
All tables are written to ./outputs, a readable summary to ./outputs/summary.md.
"""

from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier, export_text

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data" / "WA_Fn-UseC_-Telco-Customer-Churn.csv"
OUT = ROOT / "outputs"
OUT.mkdir(exist_ok=True)

SEED = 42

# Business-case assumptions (not from the data - the pilot will measure them)
TOP_N = 1600            # customers on the call list
SAVE_RATE = 0.20        # share of would-be leavers the offer keeps
COST_PER_CONTACT = 30   # USD per personal contact (agent time + offer)

summary: list[str] = []


def log(line: str = "") -> None:
    print(line)
    summary.append(line)


def pct(x: float, digits: int = 1) -> str:
    return f"{100 * x:.{digits}f}%"


def usd(x: float) -> str:
    return f"${x:,.0f}"


# ---------------------------------------------------------------------------
# 1. Data loading and cleaning
# ---------------------------------------------------------------------------
raw = pd.read_csv(DATA)
df = raw.copy()
# 11 customers with tenure 0 have a blank TotalCharges (they have not been billed yet).
df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
df["churned"] = (df["Churn"] == "Yes").astype(int)

log("# Telco churn analysis - results")
log()
log("## 1. Data")
log(f"- Rows: {len(df):,} customers, {df.shape[1] - 1} original columns")
log(f"- Unique customer IDs: {df['customerID'].nunique():,}")
log(f"- Blank TotalCharges: {df['TotalCharges'].isna().sum()} (all tenure 0) - "
    "TotalCharges is not used in the model (it is ~ tenure x MonthlyCharges)")

# ---------------------------------------------------------------------------
# 2. Headline KPIs
# ---------------------------------------------------------------------------
churners = df[df.churned == 1]
current = df[df.churned == 0]
churn_rate = df.churned.mean()
lost_monthly = churners.MonthlyCharges.sum()
total_monthly = df.MonthlyCharges.sum()

log()
log("## 2. Headline KPIs")
log(f"- Churned: {len(churners):,} of {len(df):,} = {pct(churn_rate)} (one snapshot, not a monthly rate)")
log(f"- Still customers: {len(current):,}")
log(f"- Monthly revenue lost with churners: {usd(lost_monthly)} = {pct(lost_monthly / total_monthly)} of all monthly revenue")
log(f"- Avg monthly bill: churners ${churners.MonthlyCharges.mean():.2f} vs stayers ${current.MonthlyCharges.mean():.2f}")
log(f"- Annual revenue of current customers: {usd(current.MonthlyCharges.sum() * 12)}")

# ---------------------------------------------------------------------------
# 3. Churn drivers
# ---------------------------------------------------------------------------
df["tenure_band"] = pd.cut(df.tenure, [-1, 12, 24, 48, 72],
                           labels=["0–12 months", "13–24 months", "25–48 months", "49–72 months"])
drivers = pd.concat([
    df.groupby("Contract").churned.agg(["mean", "size"]).assign(factor="Contract"),
    df.groupby("tenure_band", observed=True).churned.agg(["mean", "size"]).assign(factor="Tenure"),
    df.groupby("InternetService").churned.agg(["mean", "size"]).assign(factor="Internet product"),
]).reset_index(names="group").rename(columns={"mean": "churn_rate", "size": "customers"})
drivers = drivers[["factor", "group", "churn_rate", "customers"]]
drivers.to_csv(OUT / "drivers.csv", index=False)

log()
log("## 3. Churn drivers (share who left)")
for _, r in drivers.iterrows():
    log(f"- {r.factor} · {r.group}: {pct(r.churn_rate)} (n={r.customers:,})")

# Fiber vs DSL at the same monthly bill - price alone does not explain fiber churn
df["bill_band"] = pd.cut(df.MonthlyCharges, [0, 70, 80, 90, 100, 120])
same_bill = (df[df.InternetService != "No"]
             .pivot_table(index="bill_band", columns="InternetService", values="churned",
                          aggfunc="mean", observed=True))
same_bill.to_csv(OUT / "fiber_vs_dsl_same_bill.csv")
log()
log("Fiber vs DSL churn at the same monthly bill:")
for band, r in same_bill.iterrows():
    dsl = "n/a" if pd.isna(r.get("DSL")) else pct(r["DSL"], 0)
    log(f"- ${band.left:.0f}–{band.right:.0f}: fiber {pct(r['Fiber optic'], 0)} vs DSL {dsl}")

# ---------------------------------------------------------------------------
# 4. Decision-tree segmentation
# ---------------------------------------------------------------------------
features = raw.drop(columns=["customerID", "Churn", "TotalCharges"])
X = pd.get_dummies(features, drop_first=False).astype(float)
y = df.churned.values

tree = DecisionTreeClassifier(max_depth=3, min_samples_leaf=100, random_state=SEED).fit(X, y)
(OUT / "decision_tree.txt").write_text(export_text(tree, feature_names=list(X.columns), show_weights=True))



def leaf_paths(t: DecisionTreeClassifier, names: list[str]) -> dict[int, list[tuple[str, str, float]]]:
    """For every leaf of the fitted tree: the list of (feature, '<=' or '>', threshold) splits leading to it."""
    s, paths = t.tree_, {}

    def walk(node: int, path: list) -> None:
        if s.children_left[node] == -1:
            paths[node] = path
            return
        f, thr = names[s.feature[node]], s.threshold[node]
        walk(s.children_left[node], path + [(f, "<=", thr)])
        walk(s.children_right[node], path + [(f, ">", thr)])

    walk(0, [])
    return paths


def leaf_label(path: list[tuple[str, str, float]]) -> str:
    """Turn a leaf's split path into the segment name used in the deck."""
    conds = {(f, op): thr for f, op, thr in path}
    if ("Contract_Month-to-month", "<=") in conds:
        # All 1-/2-year contract leaves have low churn (<25%) -> merged into one segment
        return "1- or 2-year contract"
    internet = "Fiber" if ("InternetService_Fiber optic", ">") in conds else "DSL/no internet"
    tenure = next(thr for (f, op), thr in conds.items() if f == "tenure")
    # tenure is whole months, so a split at 5.5 means "≤5" vs ">5"
    band = f"≤{int(tenure)} months" if ("tenure", "<=") in conds else f">{int(tenure)} months"
    return f"Month-to-month · {internet} · {band}"


paths = leaf_paths(tree, list(X.columns))
leaf_to_segment = {leaf: leaf_label(p) for leaf, p in paths.items()}
# Each customer gets the segment of the tree leaf it falls into
df["segment"] = pd.Series(tree.apply(X), index=df.index).map(leaf_to_segment)
tree_leaves = pd.DataFrame([{"leaf": leaf, "rule": " AND ".join(f"{f} {op} {thr:.2f}" for f, op, thr in p),
                             "segment": leaf_to_segment[leaf],
                             "customers": int((tree.apply(X) == leaf).sum()),
                             "churn_rate": round(y[tree.apply(X) == leaf].mean(), 4)}
                            for leaf, p in paths.items()])
tree_leaves.to_csv(OUT / "tree_leaves.csv", index=False)

m2m = df.Contract == "Month-to-month"
fib = df.InternetService == "Fiber optic"
seg = df.segment
nodes = [  # inner nodes are unions of the tree's leaf segments
    ("all", "", "All customers", df.index == df.index),
    ("m2m", "all", "Month-to-month", seg.str.startswith("Month-to-month")),
    ("long", "all", "1- or 2-year contract", seg == "1- or 2-year contract"),
    ("fib", "m2m", "Fiber optic", seg.str.contains("· Fiber ·")),
    ("nofib", "m2m", "DSL / no internet", seg.str.contains("DSL/no internet")),
    ("fib_new", "fib", "Tenure ≤ 15 months", seg == "Month-to-month · Fiber · ≤15 months"),
    ("fib_old", "fib", "Tenure > 15 months", seg == "Month-to-month · Fiber · >15 months"),
    ("nofib_new", "nofib", "Tenure ≤ 5 months", seg == "Month-to-month · DSL/no internet · ≤5 months"),
    ("nofib_old", "nofib", "Tenure > 5 months", seg == "Month-to-month · DSL/no internet · >5 months"),
]
tree_tbl = pd.DataFrame([{"node": n, "parent": p, "label": l, "customers": int(mask.sum()),
                          "churn_rate": round(df.churned[mask].mean(), 4)} for n, p, l, mask in nodes])
tree_tbl.to_csv(OUT / "tree.csv", index=False)

log()
log("## 4. Decision-tree segments (depth 3, min. 100 customers per leaf, all 19 attributes)")
log("Tree leaves (full tree in outputs/decision_tree.txt):")
for _, r in tree_leaves.iterrows():
    log(f"- Leaf {r.leaf}: {r.rule} -> {r.segment} ({pct(r.churn_rate)} left, n={r.customers:,})")
log("Segments after merging the contract leaves:")
for _, r in tree_tbl.iterrows():
    log(f"- {r.label} ({r.node}): {pct(r.churn_rate)} left, n={r.customers:,}")

# ---------------------------------------------------------------------------
# 5. Churn scoring - out-of-fold logistic regression
# ---------------------------------------------------------------------------
model = make_pipeline(StandardScaler(), LogisticRegression(C=0.1, max_iter=5000))
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)
# Out-of-fold: every customer is scored by a model that never saw that customer.
df["churn_score"] = cross_val_predict(model, X, y, cv=cv, method="predict_proba")[:, 1]
auc = roc_auc_score(y, df.churn_score)

log()
log("## 5. Churn score")
log(f"- Logistic regression (one-hot, standardised, L2 C=0.1), 5-fold stratified CV, seed {SEED}")
log(f"- Cross-validated AUC: {auc:.3f}")

# ---------------------------------------------------------------------------
# 6. Revenue at risk
# ---------------------------------------------------------------------------
df["revenue_at_risk_12m"] = df.churn_score * df.MonthlyCharges * 12
cur = df[df.churned == 0].copy()
rar_total = cur.revenue_at_risk_12m.sum()

seg_order = ["1- or 2-year contract",
             "Month-to-month · DSL/no internet · >5 months",
             "Month-to-month · DSL/no internet · ≤5 months",
             "Month-to-month · Fiber · >15 months",
             "Month-to-month · Fiber · ≤15 months"]
segments = (cur.groupby("segment")
            .agg(customers=("customerID", "size"), avg_churn_score=("churn_score", "mean"),
                 avg_monthly_charges=("MonthlyCharges", "mean"),
                 revenue_at_risk_12m=("revenue_at_risk_12m", "sum"))
            .join(df.groupby("segment").agg(n_all=("customerID", "size"), actual_churn_rate=("churned", "mean")))
            .reindex(seg_order).reset_index())
segments.to_csv(OUT / "segments.csv", index=False)

log()
log("## 6. Revenue at risk (current customers, next 12 months = churn score x monthly bill x 12)")
log(f"- Total: {usd(rar_total)} = {pct(rar_total / (cur.MonthlyCharges.sum() * 12))} of current annual revenue")
for _, r in segments.iterrows():
    log(f"- {r.segment}: {r.customers:,} current customers, avg score {pct(r.avg_churn_score, 0)}, "
        f"{usd(r.revenue_at_risk_12m)} at risk (historic churn {pct(r.actual_churn_rate, 0)})")
fiber_rar = segments[segments.segment.str.contains("Fiber")].revenue_at_risk_12m.sum()
log(f"- Both fiber groups: {usd(fiber_rar)} of {usd(rar_total)}")

customers = df[["customerID", "segment", "tenure", "MonthlyCharges", "churn_score", "revenue_at_risk_12m",
                "TechSupport", "OnlineSecurity", "PaymentMethod", "Churn"]].rename(
    columns={"MonthlyCharges": "monthly_charges", "TechSupport": "tech_support",
             "OnlineSecurity": "online_security", "PaymentMethod": "payment", "Churn": "churned"})
customers.round(4).to_csv(OUT / "customers.csv", index=False)

kpis = pd.DataFrame([{"customers": len(df), "churn_rate": round(churn_rate, 4), "auc": round(auc, 3),
                      "lost_monthly_revenue": round(lost_monthly, 2),
                      "revenue_at_risk_12m": round(rar_total), "current_customers": len(cur)}])
kpis.to_csv(OUT / "kpis.csv", index=False)

# ---------------------------------------------------------------------------
# 7. Capacity curve
# ---------------------------------------------------------------------------
n = len(cur)
by_value = cur.sort_values("revenue_at_risk_12m", ascending=False).revenue_at_risk_12m.cumsum().values / rar_total
by_score = cur.sort_values("churn_score", ascending=False).revenue_at_risk_12m.cumsum().values / rar_total
by_random = np.arange(1, n + 1) / n
steps = sorted(set(list(range(1, n + 1, 50)) + [n]))
capacity = pd.DataFrame({"customers_contacted": steps,
                         "share_by_value": by_value[np.array(steps) - 1].round(4),
                         "share_by_score": by_score[np.array(steps) - 1].round(4),
                         "share_random": by_random[np.array(steps) - 1].round(4)})
capacity.to_csv(OUT / "capacity_curve.csv", index=False)

share_top = by_value[TOP_N - 1]
log()
log("## 7. Capacity curve")
for k in (500, 1000, TOP_N, 2000):
    log(f"- Top {k:,} by revenue at risk reach {pct(by_value[k - 1])} of it "
        f"({by_value[k - 1] / (k / n):.1f}x random; by churn score only: {pct(by_score[k - 1])})")

# ---------------------------------------------------------------------------
# 8. Business case
# ---------------------------------------------------------------------------
top = cur.sort_values("revenue_at_risk_12m", ascending=False).head(TOP_N)
is_fiber = top.segment.str.contains("Fiber")
groups = {"Full programme (top 1,600)": top,
          "Phase 1: fiber customers in the top 1,600": top[is_fiber],
          "Phase 2: other customers in the top 1,600": top[~is_fiber]}
rows = []
for name, g in groups.items():
    rar = g.revenue_at_risk_12m.sum()
    cost = len(g) * COST_PER_CONTACT
    rows.append({"group": name, "customers": len(g),
                 "expected_leavers": round(g.churn_score.sum()),
                 "revenue_at_risk_12m": round(rar), "investment": cost,
                 "revenue_saved_at_20pct": round(rar * SAVE_RATE),
                 "net_gain_at_20pct": round(rar * SAVE_RATE - cost),
                 "break_even_keep_rate": round(cost / rar, 4),
                 "break_even_1_in": round(rar / cost, 1)})
business = pd.DataFrame(rows)
business.to_csv(OUT / "business_case.csv", index=False)
top.segment.value_counts().rename("customers").to_csv(OUT / "top_n_by_segment.csv")

log()
log(f"## 8. Business case (assumptions: keep {pct(SAVE_RATE, 0)} of would-be leavers, ${COST_PER_CONTACT} per contact)")
log(f"- Top {TOP_N:,} reach {usd(top.revenue_at_risk_12m.sum())} = {pct(share_top)} of revenue at risk")
log(f"- Fiber share of the revenue reached: {pct(top[is_fiber].revenue_at_risk_12m.sum() / top.revenue_at_risk_12m.sum(), 0)}")
for _, r in business.iterrows():
    log(f"- {r.group}: {r.customers:,} customers, ~{r.expected_leavers:,} expected leavers, "
        f"investment {usd(r.investment)}, saved {usd(r.revenue_saved_at_20pct)}, net {usd(r.net_gain_at_20pct)}, "
        f"break-even keep {pct(r.break_even_keep_rate)} (1 in {r.break_even_1_in}) of would-be leavers")
log("Top 1,600 by segment:")
for s, k in top.segment.value_counts().items():
    log(f"- {s}: {k:,}")

# ---------------------------------------------------------------------------
# 9. Offer evidence - why each segment gets its offer
# ---------------------------------------------------------------------------
# Group definitions as in the dashboard's "Why these offers?" note
groups_ev = {
    "Month-to-month fiber": df[m2m & fib],
    "Month-to-month DSL": df[m2m & (df.InternetService == "DSL")],
    "1-/2-year contract with internet": df[~m2m & (df.InternetService != "No")],
}
ev_rows = []
for gname, g in groups_ev.items():
    for col, label in [("TechSupport", "Tech support"), ("OnlineSecurity", "Online security"),
                       ("OnlineBackup", "Online backup"), ("DeviceProtection", "Device protection")]:
        w, wo = g[g[col] == "Yes"], g[g[col] == "No"]
        ev_rows.append({"group": gname, "factor": label, "with": round(w.churned.mean(), 4), "n_with": len(w),
                        "without": round(wo.churned.mean(), 4), "n_without": len(wo),
                        "share_without_today": round((g[col] == "No").mean(), 4)})
    for pm in sorted(g.PaymentMethod.unique()):
        p = g[g.PaymentMethod == pm]
        ev_rows.append({"group": gname, "factor": f"Payment: {pm}", "with": round(p.churned.mean(), 4),
                        "n_with": len(p), "without": np.nan, "n_without": np.nan,
                        "share_without_today": np.nan})
evidence = pd.DataFrame(ev_rows)
evidence.to_csv(OUT / "offer_evidence.csv", index=False)

# Same comparison inside each of the five segments (internet customers only)
seg_rows = []
for s in seg_order:
    g = df[(df.segment == s) & (df.InternetService != "No")]
    for col in ("TechSupport", "OnlineSecurity"):
        seg_rows.append({"segment": s, "factor": col,
                         "churn_with": round(g[g[col] == "Yes"].churned.mean(), 4), "n_with": int((g[col] == "Yes").sum()),
                         "churn_without": round(g[g[col] == "No"].churned.mean(), 4), "n_without": int((g[col] == "No").sum())})
pd.DataFrame(seg_rows).to_csv(OUT / "offer_evidence_by_segment.csv", index=False)

# Adjusted view: does the gap survive once contract, tenure, internet product and bill are held constant?
inet = df[df.InternetService != "No"].copy()
adj = pd.get_dummies(inet[["Contract", "InternetService", "PaymentMethod"]], drop_first=True).astype(float)
adj["tenure"] = inet.tenure
adj["MonthlyCharges"] = inet.MonthlyCharges
adj["TechSupport"] = (inet.TechSupport == "Yes").astype(float)
adj["OnlineSecurity"] = (inet.OnlineSecurity == "Yes").astype(float)
lr = make_pipeline(StandardScaler(), LogisticRegression(C=1e6, max_iter=5000)).fit(adj, inet.churned)
coefs = lr[-1].coef_[0] / lr[0].scale_
odds = pd.Series(np.exp(coefs), index=adj.columns)
odds.rename("odds_ratio").to_csv(OUT / "adjusted_odds_ratios.csv")

log()
log("## 9. Offer evidence (share who left, with vs without)")
for _, r in evidence.iterrows():
    if pd.isna(r.without):
        log(f"- {r.group} · {r.factor}: {pct(r['with'], 0)} (n={r.n_with:,})")
    else:
        log(f"- {r.group} · {r.factor}: {pct(r['with'], 0)} with (n={r.n_with:,}) vs {pct(r.without, 0)} without "
            f"(n={int(r.n_without):,}); {pct(r.share_without_today, 0)} of the group do not have it")
log()
log("Adjusted odds ratios (internet customers; controls: contract, internet product, payment, tenure, bill):")
for k in ("TechSupport", "OnlineSecurity"):
    log(f"- {k}: odds ratio {odds[k]:.2f} -> about {pct(1 - odds[k], 0)} lower odds of leaving, other factors equal")

(OUT / "summary.md").write_text("\n".join(summary) + "\n", encoding="utf-8")
print(f"\nWrote tables and summary to {OUT}")
