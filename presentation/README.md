# Board presentation (v3)

### ▶ [Open the live preview](https://htmlpreview.github.io/?https://github.com/verazoll/dvba-telco-churn/blob/main/presentation/index.html)

Always shows the current version on `main`. After you push a change, reload the preview (it can take up to a minute to update).

**To edit:** click a file below (e.g. `index.html`), then the pencil icon ✏️ at the top right of the file, change the text, and click **Commit changes**.

Interactive HTML version of the board briefing "Telco Churn – Retention Priorities". It runs in any modern browser, with no claude.ai and no install.

## Open and present

1. Download or clone the repo, then double-click `presentation/index.html` (Chrome or Edge works best).
2. Press **F** for full screen.
3. Navigate:
   - **→** or **Space**: next click step or slide
   - **←**: one step back
   - The buttons at the bottom jump to a section.
   - **S** opens the hidden summary slide (Q&A).

Every slide builds up click by click, and the transitions (morphs) only play when you move forward with **→**.

Fonts: the slides use *Source Serif 4* from Google Fonts when online, and fall back to Georgia offline. Everything else works offline.

## Files

| File | What it holds | Edit it for |
|---|---|---|
| `index.html` | All slide text: headlines, kicker lines, cards, footnotes, appendix | wording and numbers in text |
| `deck.js` | Slide order, click steps, transitions and all charts (d3) | per-step headlines (`H5`, `H6` arrays), chart labels, slide order (`ORDER`) |
| `style.css` | Layout, colours and fonts | look and spacing |
| `data.js` | The five data tables the charts read (generated from the analysis outputs) | nothing by hand – see below |
| `d3.min.js` | d3 v7.9 charting library (ISC licence, `d3-LICENSE.txt`) | – |

### Where to find a slide

Each slide is a `<section class="page" id="pN">` in `index.html`. The headline of each slide sits at the top of `index.html`, in the `.htitle` block (`<div class="ht" data-p="N">`).

| Slide | id | | Slide | id |
|---|---|---|---|---|
| Cover | `p0` | | What we offer | `p14` |
| The problem | `p2` | | Business case | `p19` |
| Why it matters (HBR quote) | `p1` | | Decision | `p15` |
| What's at stake | `p18` | | Thank you | `p8` |
| Approach | `p3` | | Appendix 1.1 Decision tree | `p9` |
| Whom to contact | `p6` | | Appendix 1.3–1.5 | `p16`, `p17`, `p12` |
| Where to act | `p5` | | Appendix 2 / 3 | `p10`, `p7` |

Slides with click steps (`p5`, `p6`, `p19`) change their headline per step; those texts live in `deck.js` (`H5`, `H6`). Numbers shown as `—` in `index.html` are filled in from the data when the page loads.

### Updating the data

`data.js` holds the CSV tables `kpis`, `segments`, `tree`, `capacity` (capacity curve) and `customers` as text. To refresh it after re-running `analysis.py`, rebuild it from `outputs/` with:

```bash
python - <<'EOF'
import json
src = {'kpis':'kpis','segments':'segments','tree':'tree','capacity':'capacity_curve','customers':'customers'}
d = {k: open(f'outputs/{v}.csv', encoding='utf-8').read() for k, v in src.items()}
open('presentation/data.js', 'w', encoding='utf-8').write('window.DECK_CSV=' + json.dumps(d, ensure_ascii=False) + ';\n')
EOF
```

Note: the version in this folder uses the exact tables behind the presented deck ($816.4K revenue at risk). A re-fit of the model gives slightly different decimals (see the main README).

## Origin

Exported from the team's claude.ai dashboard (v3). The only change is a small stand-in for the claude.ai data layer at the top of `index.html` (`window.dash`), so the deck runs on its own.
