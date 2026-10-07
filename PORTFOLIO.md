# Product portfolio

Nine independent projects exploring AI evaluation, delivery management, platform decisions, and product analytics.

[Profile](README.md) · [Run the demos](START_HERE.md) · [Roadmap](ROADMAP.md)

## Choose a project by the decision

| Project | Product question | Review first |
| --- | --- | --- |
| **[Project Sentinel](projects/project-sentinel)** | Where is delivery drifting from the kickoff baseline, and who should act? | [Product brief](projects/project-sentinel/PRODUCT.md) · [Dashboard](projects/project-sentinel/assets/dashboard.jpg) |
| **[AgentTrace](projects/agenttrace)** | Should an agent change advance to human release review? | [Product brief](projects/agenttrace/PRODUCT.md) · [Data contract](projects/agenttrace/DATA_CONTRACT.md) |
| [API Launch Readiness](projects/api-launch-readiness) | Is there enough evidence to advance a platform release? | [Product brief](projects/api-launch-readiness/PRODUCT.md) · [Decision log](projects/api-launch-readiness/DECISIONS.md) |
| [AI Cost Quality Lab](https://github.com/bsaikrishnapm-source/ai-cost-quality-lab) | Which approach meets quality and latency needs at an acceptable cost? | [Decision memo](https://github.com/bsaikrishnapm-source/ai-cost-quality-lab/blob/main/PRODUCT.md) |
| [Workflow Adoption](https://github.com/bsaikrishnapm-source/workflow-adoption) | Where should the next onboarding experiment focus? | [Experiment plan](https://github.com/bsaikrishnapm-source/workflow-adoption/blob/main/EXPERIMENT.md) |
| [Enterprise Roadmap](https://github.com/bsaikrishnapm-source/enterprise-roadmap) | What should the team fund within limited capacity? | Repository case study and interactive planner |
| [Permission-Aware Retrieval](https://github.com/bsaikrishnapm-source/permission-aware-retrieval) | Which evidence may an assistant use? | Repository requirements and evidence-review demo |
| [Agent Action Approvals](https://github.com/bsaikrishnapm-source/agent-action-approvals) | When should an action require human approval? | Repository requirements and approval simulator |
| [Ticket Routing](https://github.com/bsaikrishnapm-source/ticket-routing) | Where should automation stop and escalation begin? | Repository case study and triage demo |

## Implementation evidence

These are recorded checks from the implementation work, not fresh test runs or business outcomes.

| Project group | Recorded verification | Remaining verification |
| --- | --- | --- |
| Project Sentinel | 39 Python tests; 10 real-browser workflow checks; desktop and mobile screenshot inspection | Full accessibility audit, cross-browser coverage, laptop deployment, and real-model inference |
| AgentTrace | 18 Node engine tests; three CLI scenarios; DOM integration checks | Real-browser layout, downloads, and accessibility |
| API Launch Readiness | 12 automated engine tests | Browser rendering, exports, and accessibility |
| Original six standalone repositories | 45 Node decision tests; six Python baseline entry points | Browser rendering and accessibility |

Detailed records: [Sentinel](projects/project-sentinel/VALIDATION.md) · [AgentTrace](projects/agenttrace/VALIDATION.md) · [API Launch Readiness](projects/api-launch-readiness/VALIDATION.md). Each standalone repository also includes a validation record.

## Where the code lives

Project Sentinel, AgentTrace, and API Launch Readiness live in this repository's `projects/` directory. The other six projects live in the separate repositories linked above. Each runs independently.

Project Sentinel uses a local Python server and SQLite. AgentTrace and API Launch Readiness open as local browser files. The original six browser demos live under `demo/index.html` in their respective repositories.

## Evidence and authorship

These are independent, AI-assisted portfolio demonstrations using constructed data and assumptions. No customer interviews, business-impact experiments, or employer deployments are claimed. Ticket-routing scores are hypothetical classifier inputs, not measured model outputs.

Core evaluations use explicit rules. Project Sentinel offers an optional local-model adapter, tested with mocked responses; no successful live-model evaluation is claimed. AgentTrace evaluates imported run records and does not execute or independently grade an AI model.

The product briefs separate implemented behavior from proposed discovery, experiments, integrations, and production controls.
