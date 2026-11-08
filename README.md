# Telco Customer Churn – Retention Analysis

NOVA SBE · Data Visualization for Business Analytics · Datathon 2026 (Challenge: Telecommunications Customer Retention & Commercial Strategy)

This repository holds the dataset and the Python code behind the team's executive dashboard and board presentation. One script reproduces every number shown in the deck.

**Board question:** Which customer segments are most at risk of churn, what drives their risk, and where should the company focus its retention investment?

## Contents

| Path | What it is |
|---|---|
| `data/WA_Fn-UseC_-Telco-Customer-Churn.csv` | Telco Customer Churn dataset (IBM sample data), as linked in the assignment: <https://www.kaggle.com/datasets/blastchar/telco-customer-churn> – 7,043 customers × 21 columns |
| `analysis.py` | All computations, in nine sections (see below) |
| `outputs/` | Tables produced by the script (the same tables the dashboard reads) and `summary.md` with all results in plain text |

## Run it

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python analysis.py
```

## What the script computes

1. **Data** – load, check IDs, handle the 11 blank `TotalCharges` (customers with tenure 0; the column is not used in the model).
2. **Headline KPIs** – churn share (26.5%), monthly revenue lost with churners (30.5% of revenue), annual revenue of current customers.
3. **Churn drivers** – churn by contract, tenure band and internet product; fiber vs DSL churn at the same monthly bill.
4. **Decision tree** – `DecisionTreeClassifier(max_depth=3, min_samples_leaf=100)` on all 19 customer attributes. Every customer is assigned the segment of the tree leaf it falls into; the four 1-/2-year contract leaves are merged into one low-risk segment. Result: 5 segments (`outputs/tree_leaves.csv`, `outputs/decision_tree.txt`).
5. **Churn score** – logistic regression (one-hot encoding, standardised, L2 with C = 0.1), out-of-fold predictions from 5-fold stratified cross-validation (seed 42). AUC 0.843.
6. **Revenue at risk** – per current customer: churn score × monthly bill × 12; summed per segment ($816K in total, $486K in the two fiber segments).
7. **Capacity curve** – share of revenue at risk reached when contacting the top N customers, ranked by revenue at risk vs. by churn score vs. at random.
8. **Business case** – top 1,600 customers; phase 1 (fiber customers) and phase 2 (others); investment, revenue saved, net gain and break-even keep rate.
9. **Offer evidence** – churn with vs. without tech support, online security, backup and device protection, and by payment method, for each customer group; adjusted odds ratios that hold contract, internet product, payment, tenure and bill constant.

## Assumptions and limitations

- The data is **one snapshot** with no dates. "Churned" is the share who left in that snapshot, not a monthly rate.
- The churn score is the model's probability of being a leaver in that snapshot. Using it as a 12-month probability is an approximation; the pilot will calibrate it.
- Business-case inputs that are **not** from the data: the offer keeps 20% of the contacted customers who would otherwise leave; a personal contact costs $30.
- The offer evidence shows **correlations, not causes**. Customers who buy tech support may differ in other ways; the adjusted odds ratios reduce, but do not remove, this bias. The pilot with a control group tests the effect.
- Small differences to the dashboard (< 0.1% on revenue at risk, ±1 customer per segment in the top 1,600) come from re-fitting the model.

## Use of AI tools

Analysis code and documentation were drafted with the help of Claude (Anthropic) and reviewed by the team.
