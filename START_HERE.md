# Start here — interactive PM product demos

These independent prototypes demonstrate product decisions through working local browser experiences. Each repository also retains its original Python analysis and product documents.

## New: AgentTrace — AI agent evaluation

Download this profile repository as a ZIP, extract it, and open **projects/agenttrace/index.html**. Start with the unsafe candidate, inspect Billing and the two tool-policy violations, then switch to the clean and missing-coverage scenarios. Adjust review thresholds, import a JSON dataset or export the review memo. No server or API key is required. Data resets on reload.

[Project overview](projects/agenttrace) · [Validation](projects/agenttrace/VALIDATION.md)

## New: Project Sentinel — working PM monitoring software

1. Download this profile repository as a ZIP and extract it.
2. Open a terminal in `projects/project-sentinel`.
3. Run `python3 app.py` (Windows: `py -3 app.py`).
4. Open **http://127.0.0.1:8765** on that computer.

Create your baseline, update work, inspect alerts and export a status brief. The background monitor runs while the Python process is active. [Laptop setup](projects/project-sentinel/LAPTOP_SETUP.md) · [Screenshot](projects/project-sentinel/assets/dashboard.jpg) · [Validation](projects/project-sentinel/VALIDATION.md).

## Open the earlier browser demos without coding

1. Open a repository from the table below.
2. Select the green **Code** button, then **Download ZIP**.
3. Extract the ZIP.
4. Open the extracted **demo/index.html** file in your browser.

Keep the demo folder's files together. No API key, account, terminal or software installation is needed to use the demo. GitHub itself displays the HTML source; it does not host these interfaces as live websites.

| Product | Repository | Workflow to try |
| --- | --- | --- |
| Evidence Review | [Permission-Aware Retrieval](https://github.com/bsaikrishnapm-source/permission-aware-retrieval) | Retrieve → revoke access → reopen a source; compare structured conflicting policies |
| Approval Inbox | [Agent Action Approvals](https://github.com/bsaikrishnapm-source/agent-action-approvals) | Submit → approve → simulate execution → retry; test changed payload and expiry |
| AI Economics | [AI Cost Quality Lab](https://github.com/bsaikrishnapm-source/ai-cost-quality-lab) | Adjust volume, cost and quality gates; inspect eligibility and export CSV |
| Triage Console | [Ticket Routing](https://github.com/bsaikrishnapm-source/ticket-routing) | Compare urgency override with baseline; inspect T18 and confirm a queue |
| Activation Analytics | [Workflow Adoption](https://github.com/bsaikrishnapm-source/workflow-adoption) | Validate events, inject duplicates and missing signup, compare eligible cohort funnels |
| Investment Planner | [Enterprise Roadmap](https://github.com/bsaikrishnapm-source/enterprise-roadmap) | Change capacity, reserve and estimates; inspect selection/deferral explanations |

## New: API Launch Readiness Console

Download **this profile repository** as a ZIP, extract it, and open **projects/api-launch-readiness/demo/index.html**. Start with the blocked release, switch to Pilot candidate, then clear all gates. Remove an evidence note to see why a reported pass is insufficient. Export the current decision to CSV.

[Project overview](projects/api-launch-readiness) · [Validation](projects/api-launch-readiness/VALIDATION.md)

## What reviewers can inspect

Each repository includes a **DEMO_GUIDE.md** explaining the workflow, architecture and trade-offs, **VALIDATION.md** recording actual checks, and **test_demo.cjs** with executable decision tests.

**Original six-project verification:** 45 new Node behavioral tests passed across the six decision engines. All six original Python entry points completed against their original baselines. Browser script syntax was checked. The local interfaces have not been visually or accessibility-tested in this environment; validation reports keep those manual checks open.

## Scope

All examples are synthetic. Approvals, roles, evidence permissions, ticket assignments and audit records are local simulations. No customer systems, payments, real-model APIs or private data are connected. The earlier browser demos reset on refresh. Project Sentinel persists projects and alert states in local SQLite storage. Explicit downloads are retained by your browser.

The Projects board is a delivery tracker. Adding an issue to it does not create a feature or launch a demo. Completed implementations and remaining production work are tracked in the [portfolio roadmap](ROADMAP.md).
