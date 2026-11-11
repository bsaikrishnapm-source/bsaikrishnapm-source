# Validation record — 2026-11-10 (v0.2.0)

## Executed

- `python3 -m unittest discover -s tests -v`: **50 tests passed** (Python 3.13).
- `node tests/parity.cjs`: **passed**. 546 valid and 96 invalid generated projects, 60 baseline-protection cases and a 28-step API lifecycle produced identical results in the Python app and the browser demo engine, including evidence text, alert fingerprints, sort order, error outcomes and alert lifecycle states.
- `python3 scripts/verify.py` from the repository root: **7/7 verification groups passed** (now includes the parity check).
- `python3 -m py_compile *.py` and `node --check static/app.js static/sentinel-browser.js`: passed.
- CLI analysis of `examples/atlas.json` at `2026-09-29`: regenerated [atlas-assessment.json](examples/atlas-assessment.json) (now includes the `plan` curve and corrected dependency evidence).
- `node tests/browser.cjs` with Playwright and Chromium: **15 browser workflow checks passed**, 10 against the local server and 5 against the no-install demo opened from disk.
- Visually inspected desktop (1440px) and mobile (390px) renders, including the drift chart. Fixed label collisions between the review and target markers and added a text halo where the gap label crosses the plan line.
- Chart colors (plan `#8b7fd1`, recorded actual `#008a66`) passed a palette check for lightness, chroma, color-vision-deficiency separation and 3:1 contrast against the panel surface.

Coverage added in this version: exact plan curve; dependency evidence wording; synthetic checkpoints; list/object type checks; acknowledgement timestamps and their reset on reopening; review-date stamping of edits; project deletion and the one-project minimum; compact history API; migration of an existing database; missing-field API errors; chart hover and keyboard readout; demo persistence across reload, reset and absence of page errors.

Earlier coverage remains: progress weighting; healthy/risk cases; original versus added scope; date slippage; completed work; missing owners; future records; unavailable forecasts; invalid counts/status/weights; dependency validation; baseline protection; mocked model citation validation/fallback; persistent acknowledgement; reopening; automatic resolution; import atomicity; task/evidence updates; adding scope; HTTP operations; origin/host checks; private-file isolation; watched-file handling; monitoring without a browser.

## Synthetic scenario evidence

| Project | Expected baseline progress | Actual baseline progress | Current-scope progress | Active signals |
| --- | --- | --- | --- | --- |
| Atlas Partner API | 69.9% | 35.5% | 28.4% | 13 |
| Pulse Analytics Refresh | 50.0% | 50.0% | 50.0% | 0 |

Synthetic checkpoints for Atlas show the gap widening from −1.0 to 5.0, 17.7 and 34.4 points behind plan over four weekly reviews. Pulse stays on plan. These values are reproducible fixture outputs, not customer impact or model accuracy.

## Outstanding

The [live demo](https://bsaikrishnapm-source.github.io/bsaikrishnapm-source/projects/project-sentinel/static/) is served from GitHub Pages after merge; its hosted load should be spot-checked once published. A full keyboard/screen-reader accessibility audit, cross-browser coverage and old-laptop verification remain pending.

The [desktop screenshot](assets/dashboard.jpg), [demo screenshot](assets/live-demo.jpg) and [mobile check](assets/mobile-check.jpg) are actual renders using synthetic data.

To reproduce browser checks, install development dependencies with `npm install`, then `npx playwright install chromium`, and run `npm run test:browser`. The test starts an isolated temporary server. `BROWSER_EXECUTABLE` and `PLAYWRIGHT_MODULE` may override the local test environment.

Real Ollama inference has not been run. Model adapter tests use mocked responses; they do not establish reasoning quality, prompt-injection resistance or prediction accuracy.

No laptop deployment, external project connector, email/Slack delivery, multi-user test, independent security review or usability study has been performed.
