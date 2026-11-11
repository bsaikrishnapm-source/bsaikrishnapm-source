# Try the portfolio

[Profile](README.md) · [All projects](PORTFOLIO.md) · [Roadmap](ROADMAP.md)

## Pick an experience

| Start here if you want to… | Project | Requirements |
| --- | --- | --- |
| Inspect project risk and update ongoing work | [Open Project Sentinel](https://bsaikrishnapm-source.github.io/bsaikrishnapm-source/projects/project-sentinel/static/) | A browser; no installation (Python 3.10+ for the full local app) |
| Compare AI agent run records | [Open AgentTrace](https://bsaikrishnapm-source.github.io/bsaikrishnapm-source/projects/agenttrace/) | A browser; no installation |
| Review release gates and dependencies | [Open API Launch Readiness](https://bsaikrishnapm-source.github.io/bsaikrishnapm-source/projects/api-launch-readiness/demo/) | A browser; no installation |

All three projects have live browser demos. Project Sentinel can also run on your computer with a local Python server for scheduled monitoring, SQLite storage and optional local AI. All bundled scenarios are synthetic.

## Download for local or offline use

For Project Sentinel or offline copies of the browser demos, open [this repository](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source), select **Code → Download ZIP**, and extract the archive. Keep each project's files together.

## Project Sentinel

**[Open Project Sentinel in your browser](https://bsaikrishnapm-source.github.io/bsaikrishnapm-source/projects/project-sentinel/static/).** Your edits stay in that browser; select **Reset demo data** to start over. For offline use, open `projects/project-sentinel/static/index.html` from the extracted folder.

To run the full local application:

1. Open a terminal in the extracted `projects/project-sentinel` folder.
2. Run `python3 app.py` on macOS/Linux or `py -3 app.py` on Windows.
3. Open **http://127.0.0.1:8765** in a browser on the same computer.

**Try this:** Inspect the Atlas sample and its drift chart, open an alert's evidence, acknowledge it, update the underlying work, and review the resulting alert state. Compare it with the healthy Pulse sample. Export a status brief.

Projects and alert history persist in local SQLite storage. Monitoring runs while the Python process and computer remain active. Stop the server with **Ctrl+C**.

[Detailed laptop setup](projects/project-sentinel/LAPTOP_SETUP.md) · [Screenshot](projects/project-sentinel/assets/dashboard.jpg) · [Validation](projects/project-sentinel/VALIDATION.md)

## AgentTrace

**[Open AgentTrace in your browser](https://bsaikrishnapm-source.github.io/bsaikrishnapm-source/projects/agenttrace/).** For offline use, open `projects/agenttrace/index.html` from the extracted folder.

**Try this:** Start with the risky candidate. Inspect Billing and the two tool-policy violations. Switch to the clean candidate, then the missing-coverage scenario. Adjust thresholds and export a review memo. Download the applied policy and dataset to reproduce the review in another session.

No server or API key is required. Dataset and policy changes reset on refresh unless exported. The optional CLI requires Node.js 20+; see the project README.

[Project overview](projects/agenttrace) · [Validation and browser checks still pending](projects/agenttrace/VALIDATION.md)

## API Launch Readiness

**[Open API Launch Readiness in your browser](https://bsaikrishnapm-source.github.io/bsaikrishnapm-source/projects/api-launch-readiness/demo/).** For offline use, open `projects/api-launch-readiness/demo/index.html`.

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
