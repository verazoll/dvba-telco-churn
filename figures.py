"""
Report figures on a white background, drawn from the tables that analysis.py writes.

Run after analysis.py:  python figures.py
Writes PNGs (300 dpi) to ./outputs/figures.
"""

from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.ticker import FuncFormatter, PercentFormatter

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "outputs"
FIG = OUT / "figures"
FIG.mkdir(exist_ok=True)

# Colours taken from the dashboard, adjusted for white paper
NAVY = "#0B1628"
ORANGE = "#D9732E"   # act first / revenue at risk
CORAL = "#E0554F"    # churn / loss
BLUE = "#1F86B5"     # our ranking / contacted customers
GREEN = "#2E8B57"    # gain / kept
GREY = "#9AA3B2"
LIGHT = "#D7DCE4"

plt.rcParams.update({
    "font.family": "Arial", "font.size": 7.5, "axes.titlesize": 8.5, "axes.titleweight": "bold",
    "axes.titlelocation": "left", "axes.edgecolor": GREY, "axes.labelcolor": NAVY, "text.color": NAVY,
    "xtick.color": NAVY, "ytick.color": NAVY, "axes.spines.top": False, "axes.spines.right": False,
    "figure.dpi": 300, "savefig.dpi": 300, "savefig.bbox": "tight", "savefig.pad_inches": 0.04,
})

SHORT = {
    "Month-to-month · Fiber · ≤15 months": ("New fiber", "month-to-month · ≤15 months"),
    "Month-to-month · Fiber · >15 months": ("Established fiber", "month-to-month · >15 months"),
    "Month-to-month · DSL/no internet · ≤5 months": ("New DSL / basic", "month-to-month · ≤5 months"),
    "Month-to-month · DSL/no internet · >5 months": ("Established DSL / basic", "month-to-month · >5 months"),
    "1- or 2-year contract": ("Contract customers", "1- or 2-year contract"),
}
WIDE = (6.4, 2.2)    # inches, one figure per step, full text width on A4
usd_k = FuncFormatter(lambda v, _: f"${v / 1000:,.0f}K")

seg = pd.read_csv(OUT / "segments.csv")
kpis = pd.read_csv(OUT / "kpis.csv").iloc[0]
cap = pd.read_csv(OUT / "capacity_curve.csv")
bc = pd.read_csv(OUT / "business_case.csv")
ev = pd.read_csv(OUT / "offer_evidence_by_segment.csv")

# Segment numbers as in the dashboard: 1 = most revenue at risk
NUM = {s: i + 1 for i, s in enumerate(seg.sort_values("revenue_at_risk_12m", ascending=False).segment)}


def badge(ax, x, y, n, color, size=7):
    """Numbered circle like the dashboard's segment markers."""
    ax.text(x, y, str(n), ha="center", va="center", fontsize=size, fontweight="bold", color="white",
            bbox=dict(boxstyle="circle,pad=0.25", fc=color, ec="none"), zorder=5, clip_on=False)

# ---------------------------------------------------------------------------
# Figure 1 - share who left per decision-tree segment
# ---------------------------------------------------------------------------
s = seg.sort_values("actual_churn_rate")
fig, ax = plt.subplots(figsize=WIDE)
colors = [CORAL if r > kpis.churn_rate else LIGHT for r in s.actual_churn_rate]
bars = ax.barh(range(len(s)), s.actual_churn_rate, color=colors, height=0.62)
ax.set_yticks(range(len(s)))
ax.set_yticklabels([f"{SHORT[x][0]} (n={n:,})\n{SHORT[x][1]}" for x, n in zip(s.segment, s.n_all)], fontsize=6.8)
ax.tick_params(axis="y", pad=16)
for i, x in enumerate(s.segment):
    badge(ax, -0.022, i, NUM[x], ORANGE if "Fiber" in x else GREY, size=6.5)
for i, (rate, n) in enumerate(zip(s.actual_churn_rate, s.n_all)):
    ax.text(rate + 0.012, i, f"{rate:.0%}", va="center", fontweight="bold", fontsize=7.5)
ax.axvline(kpis.churn_rate, color=NAVY, lw=0.8, ls=(0, (3, 2)))
ax.text(kpis.churn_rate, len(s) - 0.45, f" average {kpis.churn_rate:.0%}", fontsize=6.3, va="bottom")
ax.xaxis.set_major_formatter(PercentFormatter(1, decimals=0))
ax.set_xlim(0, 0.9)
ax.set_xlabel("Share of customers who left")
ax.set_title("Five groups found by the decision tree", pad=10)
fig.savefig(FIG / "fig1_segments.png")
plt.close(fig)

# ---------------------------------------------------------------------------
# Figure 2 - risk x bill, bubble = revenue at risk
# ---------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=WIDE)
size = seg.revenue_at_risk_12m / seg.revenue_at_risk_12m.max() * 900
fiber = seg.segment.str.contains("Fiber")
# Crosshair at the average of the five groups, top-right quadrant shaded = "act first" (as in the dashboard)
xm, ym = seg.avg_churn_score.mean(), seg.avg_monthly_charges.mean()
ax.axvline(xm, color=GREY, lw=0.8, ls=(0, (4, 3)), zorder=1)
ax.axhline(ym, color=GREY, lw=0.8, ls=(0, (4, 3)), zorder=1)
ax.axvspan(xm, 0.8, ymin=(ym - 20) / (105 - 20), ymax=1, color=ORANGE, alpha=0.08, lw=0, zorder=0)
ax.text(0.79, 102, "Act first", ha="right", va="top", color=ORANGE, fontweight="bold", fontsize=7)
fiber = (seg.avg_churn_score > xm) & (seg.avg_monthly_charges > ym)
ax.scatter(seg.avg_churn_score, seg.avg_monthly_charges, s=size, c=np.where(fiber, ORANGE, GREY),
           alpha=0.85, edgecolors="white", linewidths=0.8, zorder=3)
for _, r in seg.iterrows():
    ax.text(r.avg_churn_score, r.avg_monthly_charges, str(NUM[r.segment]), ha="center", va="center",
            color="white", fontweight="bold", fontsize=7, zorder=4)
offsets = {"Month-to-month · Fiber · >15 months": (-0.04, 0, "right"),
           "Month-to-month · Fiber · ≤15 months": (0.04, 0, "left"),
           "1- or 2-year contract": (0.05, -7, "left"),
           "Month-to-month · DSL/no internet · >5 months": (0.04, 4, "left"),
           "Month-to-month · DSL/no internet · ≤5 months": (0.05, -4, "left")}
for _, r in seg.iterrows():
    dx, dy, ha = offsets[r.segment]
    ax.text(r.avg_churn_score + dx, r.avg_monthly_charges + dy,
            f"{NUM[r.segment]} · {SHORT[r.segment][0]}\n${r.revenue_at_risk_12m / 1000:,.0f}K at risk",
            ha=ha, va="center", fontsize=6.3, fontweight="bold" if fiber[_] else "normal")
ax.xaxis.set_major_formatter(PercentFormatter(1, decimals=0))
ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f"${v:.0f}"))
ax.set_xlim(0, 0.8)
ax.set_ylim(20, 105)
ax.set_xlabel("Average churn risk (model score)")
ax.set_ylabel("Average monthly bill")
ax.set_title("Fiber groups combine high risk with high bills", pad=10)
fig.savefig(FIG / "fig2_risk_value.png")
plt.close(fig)

# ---------------------------------------------------------------------------
# Figure 3 - capacity curve
# ---------------------------------------------------------------------------
N = 1600
fig, ax = plt.subplots(figsize=WIDE)
ax.plot(cap.customers_contacted, cap.share_random, color=GREY, lw=1, ls=(0, (3, 2)), label="Random contacts")
ax.plot(cap.customers_contacted, cap.share_by_value, color=BLUE, lw=1.8, label="Ranked by revenue at risk")
share_n = np.interp(N, cap.customers_contacted, cap.share_by_value)
rand_n = N / cap.customers_contacted.max()
ax.vlines(N, 0, share_n, color=NAVY, lw=0.7, ls=":")
ax.plot([N], [share_n], "o", color=BLUE, ms=4, zorder=4)
ax.annotate(f"Top {N:,} reach {share_n:.0%}\n= {share_n / rand_n:.1f}× random", (N, share_n), (N + 1100, share_n - 0.18),
            fontsize=6.8, fontweight="bold", arrowprops=dict(arrowstyle="-", color=NAVY, lw=0.6))
ax.yaxis.set_major_formatter(PercentFormatter(1, decimals=0))
ax.xaxis.set_major_formatter(FuncFormatter(lambda v, _: f"{v:,.0f}"))
ax.set_xlim(0, cap.customers_contacted.max())
ax.set_ylim(0, 1.02)
ax.set_xlabel("Customers contacted (highest revenue at risk first)")
ax.set_ylabel("Share of revenue at risk reached")
ax.legend(frameon=False, loc="lower right", fontsize=6.5)
ax.set_title("A short call list reaches most of the money", pad=10)
fig.savefig(FIG / "fig3_capacity.png")
plt.close(fig)

# ---------------------------------------------------------------------------
# Figure 4 - business case: net gain by keep rate
# ---------------------------------------------------------------------------
keep = np.linspace(0, 0.30, 301)
fig, ax = plt.subplots(figsize=WIDE)
styles = [("Full programme (top 1,600)", BLUE, "Top 1,600 (all)"),
          ("Phase 1: fiber customers in the top 1,600", ORANGE, "Phase 1: 939 fiber customers")]
for name, col, label in styles:
    r = bc[bc.group == name].iloc[0]
    net = r.revenue_at_risk_12m * keep - r.investment
    ax.plot(keep, net, color=col, lw=1.6, label=label)
    ax.plot([r.break_even_keep_rate], [0], "o", color=col, ms=3.5, zorder=4)
    ax.text(r.break_even_keep_rate, -9000 if col == BLUE else 9000,
            f"break-even {r.break_even_keep_rate:.1%}", color=col, fontsize=6.2,
            ha="left" if col == BLUE else "right", va="center")
full = bc.iloc[0]
ax.axhline(0, color=NAVY, lw=0.6)
ax.axvline(0.20, color=GREY, lw=0.7, ls=":")
ax.plot([0.20], [full.net_gain_at_20pct], "o", color=BLUE, ms=4, zorder=4)
ax.annotate(f"Assumed 20%:\n+${full.net_gain_at_20pct / 1000:,.0f}K net", (0.20, full.net_gain_at_20pct),
            (0.215, full.net_gain_at_20pct - 55000), fontsize=6.8, fontweight="bold",
            arrowprops=dict(arrowstyle="-", color=NAVY, lw=0.6))
ax.xaxis.set_major_formatter(PercentFormatter(1, decimals=0))
ax.yaxis.set_major_formatter(usd_k)
ax.set_xlim(0, 0.30)
ax.set_xlabel("Share of would-be leavers we keep")
ax.set_ylabel("Net gain, 12 months")
ax.legend(frameon=False, loc="upper left", fontsize=6.5)
ax.set_title("The pilot pays off well below the assumed keep rate", pad=10)
fig.savefig(FIG / "fig4_business_case.png")
plt.close(fig)

# ---------------------------------------------------------------------------
# Figure 5 - offer evidence: churn with vs without tech support / online security
# ---------------------------------------------------------------------------
order = sorted(NUM, key=NUM.get)
fig, axes = plt.subplots(1, 2, figsize=(6.4, 2.1), sharey=True)
for ax, (factor, title) in zip(axes, [("TechSupport", "Tech support"), ("OnlineSecurity", "Online security")]):
    d = ev[ev.factor == factor].set_index("segment").loc[order]
    y = np.arange(len(order))[::-1]
    ax.hlines(y, d.churn_with, d.churn_without, color=LIGHT, lw=3, zorder=1)
    ax.scatter(d.churn_without, y, color=CORAL, s=22, zorder=3, label="without")
    ax.scatter(d.churn_with, y, color=GREEN, s=22, zorder=3, label="with")
    for yi, (w, wo) in zip(y, zip(d.churn_with, d.churn_without)):
        ax.text(wo + 0.02, yi, f"{wo:.0%}", va="center", color=CORAL, fontsize=6.5, fontweight="bold")
        ax.text(w - 0.02, yi, f"{w:.0%}", va="center", ha="right", color=GREEN, fontsize=6.5, fontweight="bold")
    ax.set_xlim(-0.05, 0.85)
    ax.xaxis.set_major_formatter(PercentFormatter(1, decimals=0))
    ax.set_title(f"Share who left – with vs. without {title.lower()}", fontsize=7.8)
    ax.set_xlabel("Share of customers who left (internet customers only)")
    ax.spines["left"].set_visible(False)
    ax.tick_params(axis="y", length=0)
axes[0].set_yticks(np.arange(len(order))[::-1])
axes[0].set_yticklabels([f"{NUM[x]} · {SHORT[x][0]}" for x in order])
axes[1].legend(frameon=False, loc="lower right", fontsize=6.5)
fig.tight_layout(w_pad=1.5)
fig.savefig(FIG / "fig5_offer_evidence.png")
plt.close(fig)

print(f"Wrote figures to {FIG}")
