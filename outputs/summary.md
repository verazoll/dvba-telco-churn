# Telco churn analysis - results

## 1. Data
- Rows: 7,043 customers, 21 original columns
- Unique customer IDs: 7,043
- Blank TotalCharges: 11 (all tenure 0) - TotalCharges is not used in the model (it is ~ tenure x MonthlyCharges)

## 2. Headline KPIs
- Churned: 1,869 of 7,043 = 26.5% (one snapshot, not a monthly rate)
- Still customers: 5,174
- Monthly revenue lost with churners: $139,131 = 30.5% of all monthly revenue
- Avg monthly bill: churners $74.44 vs stayers $61.27
- Annual revenue of current customers: $3,803,829

## 3. Churn drivers (share who left)
- Contract · Month-to-month: 42.7% (n=3,875)
- Contract · One year: 11.3% (n=1,473)
- Contract · Two year: 2.8% (n=1,695)
- Tenure · 0–12 months: 47.4% (n=2,186)
- Tenure · 13–24 months: 28.7% (n=1,024)
- Tenure · 25–48 months: 20.4% (n=1,594)
- Tenure · 49–72 months: 9.5% (n=2,239)
- Internet product · DSL: 19.0% (n=2,421)
- Internet product · Fiber optic: 41.9% (n=3,096)
- Internet product · No: 7.4% (n=1,526)

Fiber vs DSL churn at the same monthly bill:
- $0–70: fiber 62% vs DSL 23%
- $70–80: fiber 55% vs DSL 10%
- $80–90: fiber 47% vs DSL 3%
- $90–100: fiber 40% vs DSL 2%
- $100–120: fiber 28% vs DSL n/a

## 4. Decision-tree segments (depth 3, min. 100 customers per leaf, all 19 attributes)
Tree leaves (full tree in outputs/decision_tree.txt):
- Leaf 3: Contract_Month-to-month <= 0.50 AND MonthlyCharges <= 93.67 AND Contract_One year <= 0.50 -> 1- or 2-year contract (1.4% left, n=1,315)
- Leaf 4: Contract_Month-to-month <= 0.50 AND MonthlyCharges <= 93.67 AND Contract_One year > 0.50 -> 1- or 2-year contract (7.2% left, n=1,075)
- Leaf 6: Contract_Month-to-month <= 0.50 AND MonthlyCharges > 93.67 AND Contract_Two year <= 0.50 -> 1- or 2-year contract (22.4% left, n=398)
- Leaf 7: Contract_Month-to-month <= 0.50 AND MonthlyCharges > 93.67 AND Contract_Two year > 0.50 -> 1- or 2-year contract (7.9% left, n=380)
- Leaf 10: Contract_Month-to-month > 0.50 AND InternetService_Fiber optic <= 0.50 AND tenure <= 5.50 -> Month-to-month · DSL/no internet · ≤5 months (41.7% left, n=743)
- Leaf 11: Contract_Month-to-month > 0.50 AND InternetService_Fiber optic <= 0.50 AND tenure > 5.50 -> Month-to-month · DSL/no internet · >5 months (18.2% left, n=1,004)
- Leaf 13: Contract_Month-to-month > 0.50 AND InternetService_Fiber optic > 0.50 AND tenure <= 15.50 -> Month-to-month · Fiber · ≤15 months (69.2% left, n=1,036)
- Leaf 14: Contract_Month-to-month > 0.50 AND InternetService_Fiber optic > 0.50 AND tenure > 15.50 -> Month-to-month · Fiber · >15 months (40.8% left, n=1,092)
Segments after merging the contract leaves:
- All customers (all): 26.5% left, n=7,043
- Month-to-month (m2m): 42.7% left, n=3,875
- 1- or 2-year contract (long): 6.8% left, n=3,168
- Fiber optic (fib): 54.6% left, n=2,128
- DSL / no internet (nofib): 28.2% left, n=1,747
- Tenure ≤ 15 months (fib_new): 69.2% left, n=1,036
- Tenure > 15 months (fib_old): 40.8% left, n=1,092
- Tenure ≤ 5 months (nofib_new): 41.7% left, n=743
- Tenure > 5 months (nofib_old): 18.2% left, n=1,004

## 5. Churn score
- Logistic regression (one-hot, standardised, L2 C=0.1), 5-fold stratified CV, seed 42
- Cross-validated AUC: 0.843

## 6. Revenue at risk (current customers, next 12 months = churn score x monthly bill x 12)
- Total: $816,380 = 21.5% of current annual revenue
- 1- or 2-year contract: 2,954 current customers, avg score 6%, $168,666 at risk (historic churn 7%)
- Month-to-month · DSL/no internet · >5 months: 821 current customers, avg score 22%, $102,578 at risk (historic churn 18%)
- Month-to-month · DSL/no internet · ≤5 months: 433 current customers, avg score 29%, $59,206 at risk (historic churn 42%)
- Month-to-month · Fiber · >15 months: 647 current customers, avg score 41%, $287,409 at risk (historic churn 41%)
- Month-to-month · Fiber · ≤15 months: 319 current customers, avg score 63%, $198,520 at risk (historic churn 69%)
- Both fiber groups: $485,929 of $816,380

## 7. Capacity curve
- Top 500 by revenue at risk reach 39.8% of it (4.1x random; by churn score only: 38.1%)
- Top 1,000 by revenue at risk reach 63.7% of it (3.3x random; by churn score only: 60.7%)
- Top 1,600 by revenue at risk reach 79.9% of it (2.6x random; by churn score only: 77.5%)
- Top 2,000 by revenue at risk reach 86.9% of it (2.2x random; by churn score only: 84.2%)

## 8. Business case (assumptions: keep 20% of would-be leavers, $30 per contact)
- Top 1,600 reach $652,612 = 79.9% of revenue at risk
- Fiber share of the revenue reached: 74%
- Full programme (top 1,600): 1,600 customers, ~674 expected leavers, investment $48,000, saved $130,522, net $82,522, break-even keep 7.4% (1 in 13.6) of would-be leavers
- Phase 1: fiber customers in the top 1,600: 939 customers, ~462 expected leavers, investment $28,170, saved $96,443, net $68,273, break-even keep 5.8% (1 in 17.1) of would-be leavers
- Phase 2: other customers in the top 1,600: 661 customers, ~211 expected leavers, investment $19,830, saved $34,079, net $14,249, break-even keep 11.6% (1 in 8.6) of would-be leavers
Top 1,600 by segment:
- Month-to-month · Fiber · >15 months: 620
- Month-to-month · Fiber · ≤15 months: 319
- 1- or 2-year contract: 273
- Month-to-month · DSL/no internet · >5 months: 226
- Month-to-month · DSL/no internet · ≤5 months: 162

## 9. Offer evidence (share who left, with vs without)
- Month-to-month fiber · Tech support: 39% with (n=332) vs 58% without (n=1,796); 84% of the group do not have it
- Month-to-month fiber · Online security: 37% with (n=354) vs 58% without (n=1,774); 83% of the group do not have it
- Month-to-month fiber · Online backup: 47% with (n=692) vs 58% without (n=1,436); 67% of the group do not have it
- Month-to-month fiber · Device protection: 50% with (n=677) vs 57% without (n=1,451); 68% of the group do not have it
- Month-to-month fiber · Payment: Bank transfer (automatic): 46% (n=327)
- Month-to-month fiber · Payment: Credit card (automatic): 42% (n=293)
- Month-to-month fiber · Payment: Electronic check: 60% (n=1,307)
- Month-to-month fiber · Payment: Mailed check: 51% (n=201)
- Month-to-month DSL · Tech support: 23% with (n=339) vs 36% without (n=884); 72% of the group do not have it
- Month-to-month DSL · Online security: 22% with (n=366) vs 36% without (n=857); 70% of the group do not have it
- Month-to-month DSL · Online backup: 22% with (n=371) vs 37% without (n=852); 70% of the group do not have it
- Month-to-month DSL · Device protection: 28% with (n=280) vs 33% without (n=943); 77% of the group do not have it
- Month-to-month DSL · Payment: Bank transfer (automatic): 20% (n=197)
- Month-to-month DSL · Payment: Credit card (automatic): 27% (n=185)
- Month-to-month DSL · Payment: Electronic check: 41% (n=474)
- Month-to-month DSL · Payment: Mailed check: 31% (n=367)
- 1-/2-year contract with internet · Tech support: 8% with (n=1,373) vs 12% without (n=793); 37% of the group do not have it
- 1-/2-year contract with internet · Online security: 6% with (n=1,299) vs 14% without (n=867); 40% of the group do not have it
- 1-/2-year contract with internet · Online backup: 9% with (n=1,366) vs 10% without (n=800); 37% of the group do not have it
- 1-/2-year contract with internet · Device protection: 9% with (n=1,465) vs 10% without (n=701); 32% of the group do not have it
- 1-/2-year contract with internet · Payment: Bank transfer (automatic): 8% (n=688)
- 1-/2-year contract with internet · Payment: Credit card (automatic): 7% (n=713)
- 1-/2-year contract with internet · Payment: Electronic check: 16% (n=462)
- 1-/2-year contract with internet · Payment: Mailed check: 7% (n=303)

Adjusted odds ratios (internet customers; controls: contract, internet product, payment, tenure, bill):
- TechSupport: odds ratio 0.65 -> about 35% lower odds of leaving, other factors equal
- OnlineSecurity: odds ratio 0.60 -> about 40% lower odds of leaving, other factors equal
