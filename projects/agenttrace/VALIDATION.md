# Validation record

Implementation check: 2026-10-05.

## Passed

- 18 Node behavioral tests in `tests/engine.test.js` passed.
- DOM integration runner `tests/dom.cjs` passed using jsdom: initial HOLD, attention filtering, clean/sparse scenarios, policy changes, invalid import retention, valid import, HTML-as-text escaping and both export triggers. File reads and download APIs are simulated in this runner; it does not establish actual browser download or layout behavior.
- Browser script syntax checks passed for engine.js, sample.js, app.js and the Playwright runner.
- Command-line checks: risky sample exits 2 with HOLD; clean sample exits 0 with READY FOR HUMAN REVIEW; sparse sample exits 2 with INSUFFICIENT EVIDENCE.
- Engine coverage includes unauthorized tools, missing approval, approved actions, blocked attempts, baseline violations, unpaired safety failures, segment regressions hidden by overall averages, incomplete evidence, sample-size gates, metric thresholds, nearest-rank p95, invalid inputs, duplicate identities and memo content.

## Browser checks pending

The Playwright runner is included as `tests/browser.cjs`. Chromium was not installed in the build environment, and both browser download attempts returned invalid ZIP archives. The runner could not launch; no real-browser pass, visual layout pass, screenshot, accessibility audit, or cross-browser result is claimed.

The runner exercises initial evaluation, case filtering, trace expansion, clean/sparse scenarios, policy editing, invalid/valid JSON imports, imported HTML rendered as text, memo/data exports and mobile overflow. It captures screenshots when run successfully.

To run it in an environment with browser downloads available:

```sh
npm install --no-save playwright
npx playwright install chromium
node tests/browser.cjs
```

Manual review: open index.html, repeat the three scenarios, use keyboard navigation on controls and disclosures, test imports/exports, and inspect at desktop and mobile widths. Keep any real customer data out of shared test artifacts.

To reproduce the DOM checks separately: `npm install --no-save jsdom`, then `node tests/dom.cjs`.

## Interpretation

These checks establish deterministic behavior on constructed cases. They do not establish model quality, production safety, statistical significance or customer value. Sample case contracts and outcome labels were authored for this project. No live AI models or external customer systems were used.

## Policy portability update — 2026-10-09

Added applied-policy JSON download, validated policy import, and default reset. DOM regression checks cover strict-policy application, form synchronization, rejected imports preserving the active policy, malformed JSON, missing/extra fields, invalid values, size limits, exporting applied values despite unsaved edits, and export/import round-trip.

These checks use jsdom with mocked file selection and download triggers. They inspect the generated Blob contents but do not establish real-browser download, layout, or accessibility behavior. A fresh Chromium download attempt again failed with an invalid ZIP response.

Update verification: the expanded DOM integration runner passed. The repository verification runner passed all 69 existing automated tests and all three CLI scenario checks. No real-browser pass is claimed for the new controls.
