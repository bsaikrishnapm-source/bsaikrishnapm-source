# Sai Krishna Banda
**Product Management · Enterprise AI · API Platforms**

I turn complex workflows into clear product decisions—and build working prototypes to test the assumptions behind them.

Explore my work in delivery monitoring, AI evaluation, and platform readiness. Each project connects a user problem with product requirements, explicit trade-offs, and inspectable evidence.

[LinkedIn](https://www.linkedin.com/in/saibanda) · [Email](mailto:bsaikrishna.pm@gmail.com) · [All nine projects](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/blob/main/PORTFOLIO.md) · [Five-minute review](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/blob/main/REVIEWER_GUIDE.md)

## Selected work

### 01 / Project Sentinel
**Help product managers spot delivery risk after kickoff.**

A local dashboard that compares ongoing work with the original project baseline. It brings progress, scope, dependencies, spending, and overdue decisions into one review.

**Product judgment:** Keep the original commitment visible. Connect each alert to evidence, an accountable owner, and a next step. Track acknowledgement separately from resolution.

[![Project Sentinel dashboard with synthetic project data](https://raw.githubusercontent.com/bsaikrishnapm-source/bsaikrishnapm-source/main/projects/project-sentinel/assets/dashboard.jpg)](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/tree/main/projects/project-sentinel)

[Explore Sentinel](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/tree/main/projects/project-sentinel) · [Product brief](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/blob/main/projects/project-sentinel/PRODUCT.md) · [Run locally](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/blob/main/projects/project-sentinel/LAPTOP_SETUP.md) · [Validation](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/blob/main/projects/project-sentinel/VALIDATION.md)

### 02 / AgentTrace
**Make AI agent release reviews more reproducible.**

Compare recorded baseline and candidate runs across success, cost, latency, and customer segments. Inspect tool-policy violations, save evaluation thresholds, and export a review memo.

**Product judgment:** Evaluate segment regressions and unauthorized actions alongside aggregate performance. Require sufficient evidence and keep the release decision with a person.

[Explore AgentTrace](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/tree/main/projects/agenttrace) · [Product brief](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/blob/main/projects/agenttrace/PRODUCT.md) · [Data contract](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/blob/main/projects/agenttrace/DATA_CONTRACT.md) · [Validation](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/blob/main/projects/agenttrace/VALIDATION.md)

### 03 / API Launch Readiness
**Make release blockers and missing evidence visible.**

An interactive console for reviewing release gates, dependencies, accountable teams, and supporting evidence before a go/no-go decision.

**Product judgment:** A reported pass needs evidence. Critical blockers and unresolved dependencies must remain visible in the release recommendation.

[Explore the console](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/tree/main/projects/api-launch-readiness) · [Product brief](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/blob/main/projects/api-launch-readiness/PRODUCT.md) · [Decision log](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/blob/main/projects/api-launch-readiness/DECISIONS.md) · [Validation](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/blob/main/projects/api-launch-readiness/VALIDATION.md)

## Explore by product question

| Product question | Project |
| --- | --- |
| Which AI approach balances quality, latency, and cost? | [AI Cost Quality Lab](https://github.com/bsaikrishnapm-source/ai-cost-quality-lab) |
| Where should the next onboarding experiment focus? | [Workflow Adoption](https://github.com/bsaikrishnapm-source/workflow-adoption) |
| What should we prioritize within limited capacity? | [Enterprise Roadmap](https://github.com/bsaikrishnapm-source/enterprise-roadmap) |
| Which evidence may an assistant use? | [Permission-Aware Retrieval](https://github.com/bsaikrishnapm-source/permission-aware-retrieval) |
| When should an agent action require approval? | [Agent Action Approvals](https://github.com/bsaikrishnapm-source/agent-action-approvals) |
| Where should automation stop and escalation begin? | [Ticket Routing](https://github.com/bsaikrishnapm-source/ticket-routing) |

## How I work

**Frame the problem → define the outcome → compare trade-offs → build → evaluate.**

The portfolio demonstrates requirements, prioritization, success metrics, release criteria, and experiment design. Product briefs explain the choices; runnable implementations make the assumptions easier to challenge.

**Try a project:** Follow the [local demo guide](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/blob/main/START_HERE.md). Core demos need no API key. These GitHub links open source and documentation; the applications run on your computer.

<details>
<summary><strong>Implementation evidence and verification</strong></summary>

| Project | Recorded checks | Remaining checks |
| --- | --- | --- |
| Project Sentinel | 39 Python tests; 10 browser workflow checks | Full accessibility, cross-browser, and live-model evaluation |
| AgentTrace | 18 engine tests; three CLI scenarios; DOM interaction checks, including policy import/export | Real-browser layout and downloads |
| API Launch Readiness | 12 engine tests | Browser workflows and accessibility |

With Python 3.10+ and Node.js 20+, run `python3 scripts/verify.py` from the repository root to reproduce the core checks for these three projects. Browser checks are separate.

[Verification scope](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/blob/main/CONTRIBUTING.md) · [GitHub Actions](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/actions/workflows/verify.yml) · [Development roadmap](https://github.com/bsaikrishnapm-source/bsaikrishnapm-source/blob/main/ROADMAP.md)

</details>

---

**About the portfolio:** Independent, AI-assisted projects using synthetic examples. Test results describe implementation behavior, not customer outcomes or production readiness. User research and production integrations remain future work. Sentinel's optional local AI adapter has been tested with mocked responses; AgentTrace evaluates recorded runs without executing an AI model.
