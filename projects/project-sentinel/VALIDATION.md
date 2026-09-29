# Validation record — 2026-09-29

## Executed

- `python3 -m unittest discover -s tests -v`: **39 tests passed**.
- `python3 -m py_compile *.py`: passed.
- `node --check static/app.js`: passed.
- CLI analysis of `examples/atlas.json` at `2026-09-29`: generated [atlas-assessment.json](examples/atlas-assessment.json).
- Started the actual HTTP server and exercised API workflows in integration tests.
- `node tests/browser.cjs` with Playwright 1.62.1 and Chromium 153: **10 browser workflow checks passed**.
- Visually inspected real desktop (1440px) and mobile (390px) screenshots. Fixed a mobile overflow caused by an accessible table header escaping its scroll region.

Coverage: progress weighting; healthy/risk cases; original versus added scope; date slippage; completed work; missing owners; future records; unavailable forecasts; invalid counts/status/weights; dependency validation; baseline protection; mocked model citation validation/fallback; persistent acknowledgement; reopening; automatic resolution; import atomicity; task/evidence updates; adding scope; HTTP operations; origin/host checks; private-file isolation; watched-file handling; monitoring without a browser.

## Synthetic scenario evidence

| Project | Expected baseline progress | Actual baseline progress | Current-scope progress | Active signals |
| --- | --- | --- | --- | --- |
| Atlas Partner API | 69.9% | 35.5% | 28.4% | 13 |
| Pulse Analytics Refresh | 50.0% | 50.0% | 50.0% | 0 |

These values are reproducible fixture outputs, not customer impact or model accuracy.

## Outstanding

Browser checks cover initial assessment, acknowledgement/filtering, task completion, evidence updates/resolved alerts, project switching, project creation, scope addition, JSON/Markdown downloads, invalid baseline imports, 390px overflow, a keyboard focus step and absence of JavaScript page errors. A full keyboard/screen-reader accessibility audit, cross-browser coverage and old-laptop verification remain pending.

The [desktop screenshot](assets/dashboard.jpg) and [mobile check](assets/mobile-check.jpg) are actual renders using synthetic data.

To reproduce browser checks, install development dependencies with `npm install`, then `npx playwright install chromium`, and run `npm run test:browser`. The test starts an isolated temporary server. `BROWSER_EXECUTABLE` and `PLAYWRIGHT_MODULE` may override the local test environment.

Real Ollama inference has not been run. Model adapter tests use mocked responses; they do not establish reasoning quality, prompt-injection resistance or prediction accuracy.

No laptop deployment, external project connector, email/Slack delivery, multi-user test, independent security review or usability study has been performed.
