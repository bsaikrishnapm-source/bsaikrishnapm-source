# Try the portfolio

[Profile](README.md) · [All projects](PORTFOLIO.md) · [Roadmap](ROADMAP.md)

## Pick an experience

| Start here if you want to… | Project | Requirements |
| --- | --- | --- |
| Inspect project risk and update ongoing work | [Project Sentinel](#project-sentinel) | Python 3.10+ and a browser |
| Compare AI agent run records | [AgentTrace](#agenttrace) | A browser |
| Review release gates and dependencies | [API Launch Readiness](#api-launch-readiness) | A browser |

These links lead to source code and documentation. The applications run on your computer; they are not hosted live demos.

## Download once

For the three projects above, open [this repository](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source), select **Code → Download ZIP**, and extract the archive. Keep each project's files together.

## Project Sentinel

1. Open a terminal in the extracted `projects/project-sentinel` folder.
2. Run `python3 app.py` on macOS/Linux or `py -3 app.py` on Windows.
3. Open **http://127.0.0.1:8765** in a browser on the same computer.

**Try this:** Inspect the Atlas sample, open an alert's evidence, acknowledge it, update the underlying work, and review the resulting alert state. Compare it with the healthy Pulse sample. Export a status brief.

Projects and alert history persist in local SQLite storage. Monitoring runs while the Python process and computer remain active. Stop the server with **Ctrl+C**.

[Detailed laptop setup](projects/project-sentinel/LAPTOP_SETUP.md) · [Screenshot](projects/project-sentinel/assets/dashboard.jpg) · [Validation](projects/project-sentinel/VALIDATION.md)

## AgentTrace

Open `projects/agenttrace/index.html` from the extracted folder.

**Try this:** Start with the risky candidate. Inspect Billing and the two tool-policy violations. Switch to the clean candidate, then the missing-coverage scenario. Adjust thresholds and export a review memo.

No server or API key is required. Dataset and policy changes reset on refresh unless exported. The optional CLI requires Node.js 20+; see the project README.

[Project overview](projects/agenttrace) · [Validation and browser checks still pending](projects/agenttrace/VALIDATION.md)

## API Launch Readiness

Open `projects/api-launch-readiness/demo/index.html`.

**Try this:** Compare the blocked, pilot, and ready scenarios. Remove an evidence note to inspect how a missing requirement affects the decision. Export a CSV decision record.

[Project overview](projects/api-launch-readiness) · [Validation](projects/api-launch-readiness/VALIDATION.md)

## Explore the other six demos

Download and extract each linked repository, then open its `demo/index.html`. No API key or terminal is needed for these browser demos.

| Project | Workflow to explore |
| --- | --- |
| [Permission-Aware Retrieval](https://github.com/bsaikrishnapm-source/permission-aware-retrieval) | Retrieve evidence, revoke access, and compare conflicting policies |
| [Agent Action Approvals](https://github.com/bsaikrishnapm-source/agent-action-approvals) | Submit, approve, simulate execution, then test changed payloads and expiry |
| [AI Cost Quality Lab](https://github.com/bsaikrishnapm-source/ai-cost-quality-lab) | Change cost and quality assumptions, compare eligibility, and export |
| [Ticket Routing](https://github.com/bsaikrishnapm-source/ticket-routing) | Compare urgency overrides, inspect ticket reasons, and confirm a queue |
| [Workflow Adoption](https://github.com/bsaikrishnapm-source/workflow-adoption) | Validate events and compare segmented activation funnels |
| [Enterprise Roadmap](https://github.com/bsaikrishnapm-source/enterprise-roadmap) | Change capacity and estimates, then inspect selection and deferral reasons |

Each standalone repository includes a walkthrough and validation record. These earlier browser demos reset on refresh.

## Scope

Bundled examples are synthetic. Core workflows do not connect to customer systems or call model APIs. Permissions, approvals, and assignments in the browser demos are simulations. Exported files are saved through your browser. See each project's validation record for tested behavior and remaining checks.
