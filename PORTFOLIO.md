# Product Portfolio

Eight decision-focused case studies with browser demos and local monitoring software covering enterprise SaaS, AI workflows, product delivery and analytics.

**[Start here: open the product demos without coding](START_HERE.md)**

| Project | Read first | Decision | Evidence |
| --- | --- | --- | --- |
| Ticket routing | [Case study](https://github.com/bsaikrishnapm-source/ticket-routing) | Keep a proposed auto-routing policy out of production | 20 synthetic labeled cases; high-confidence errors and an urgent miss |
| Workflow adoption | [Case study](https://github.com/bsaikrishnapm-source/workflow-adoption) | Test guided connector setup before broader onboarding redesign | 40 synthetic account journeys; segment-level drop-offs |
| Roadmap investment | [Case study](https://github.com/bsaikrishnapm-source/enterprise-roadmap) | Fund auditability, connector recovery, and routing assistance | Eight scored opportunities; dependencies and fixed capacity |

## Project Sentinel — new flagship

Built from my idea for a PM early warning system after kickoff: [Project Sentinel](projects/project-sentinel) compares delivery with its original baseline and suggests evidence-linked next steps. It includes project creation, task/evidence editors, risk checks, persistent alerts, automatic scans and optional local AI briefing. **39 Python tests and 10 real-browser workflow checks passed.** [Product brief](projects/project-sentinel/PRODUCT.md) · [Screenshot](projects/project-sentinel/assets/dashboard.jpg) · [Laptop setup](projects/project-sentinel/LAPTOP_SETUP.md).

## API platform launch planning

[API Launch Readiness Console](projects/api-launch-readiness) adds a release-management case study: seven editable gates, dependency-aware evaluation, critical blockers, scenario comparison through presets, and a decision CSV. Includes a [product brief](projects/api-launch-readiness/PRODUCT.md), [decision log](projects/api-launch-readiness/DECISIONS.md), and [validation record](projects/api-launch-readiness/VALIDATION.md).

## AI product prototypes

- [Permission Aware Retrieval](https://github.com/bsaikrishnapm-source/permission-aware-retrieval): five fictional documents, eight labeled queries, a working retrieval policy, and product requirements.
- [Agent Action Approvals](https://github.com/bsaikrishnapm-source/agent-action-approvals): ten policy scenarios, a working state-decision simulator, and approval requirements.
- [AI Cost Quality Lab](https://github.com/bsaikrishnapm-source/ai-cost-quality-lab): three populated variants, an executable cost model, and sensitivity analysis.

These broaden the portfolio into retrieval governance, agent action controls, and AI unit economics. Each script uses only Python's standard library and runs independently.

## Read this portfolio in ten minutes

1. Read each project’s recommendation and limitations.
2. Open its supporting product artifacts to inspect the trade-offs.
3. Clone the project repository and follow its README run instructions to reproduce its analysis.

## Evidence and authorship

Prepared with AI assistance as independent portfolio demonstrations. All datasets and business inputs were deliberately constructed for these scenarios. No interviews, customer deployments, model API calls, or business-impact experiments were performed. The ticket-routing scores are hypothetical classifier inputs, not measured model outputs. The original analyses verify calculations and decision rules without calling AI models. Project Sentinel adds an optional local-model adapter; its tests used mocked responses and no real-model inference result is claimed.

No employment details or employer performance percentages are used as portfolio evidence.

## Delivery status

The original implementation pass delivered six browser demos, six case studies, supporting product documents, synthetic datasets, Python baseline analyses and 45 new Node decision tests. Each demo has a walkthrough and validation record. UI rendering and accessibility checks remain unperformed here. Proposed experiments and production services remain explicitly separate from delivered local behavior.

## Repository structure

The original six projects live in the separate repositories linked above. The seventh, API Launch Readiness Console, is a self-contained project under `projects/api-launch-readiness` in this repository. Each project runs independently. Project Sentinel is the eighth case study, under `projects/project-sentinel`, and runs as a local Python server.


