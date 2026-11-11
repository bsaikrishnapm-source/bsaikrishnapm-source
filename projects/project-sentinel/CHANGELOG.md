# Release notes

## 0.2.0 — 2026-11-10

- **No-install live demo.** The same dashboard now runs on GitHub Pages or from a downloaded `static/index.html`, using `static/sentinel-browser.js`, a port of the Python engine, store and API. A parity test keeps both implementations identical.
- **Drift over time chart.** Exact planned-progress curve versus recorded assessments, with the current gap labeled, hover and keyboard readouts, and an accessible data table. New workspaces include synthetic earlier checkpoints for the sample projects.
- **Delete project** with confirmation; the workspace always keeps at least one project.
- **Acknowledgements are timestamped**, and the timestamp clears when changed evidence reopens the alert.
- **Fixes:** dependency alerts no longer say "Task reported blocked" for tasks that are not blocked, and name why each prerequisite is a risk. Edits are stamped with the review date, so a past review date no longer creates false "newer than review date" alerts. Totals no longer vary in the last digit between Python 3.11 and 3.12+. Team and decision lists are type-checked.
- API routing moved from `app.py` to `api.py`, which both the server and the parity test use. `/api/history` returns compact entries.

Upgrade note: existing databases are migrated in place. Dependency alerts get new evidence text, so an acknowledged dependency alert reopens once.

## 0.1.0 — 2026-09-29

First functional local MVP of Project Sentinel, based on Sai Krishna Banda's idea for proactive PM monitoring.

Delivered: immutable baselines, dated progress comparison, explicit risk detectors, persistent alert lifecycle, browser dashboard and editing forms, project creation/import/export, scheduled local checks, watched JSON ingestion, one-shot CLI, optional local AI briefing with fallback, 39 automated Python tests, and 10 passing browser workflow checks.

Known gaps: full accessibility/cross-browser and old-laptop QA, actual local-model verification, direct external integrations, outbound notifications, authenticated shared access, approved rebaseline workflow and real-user validation.
