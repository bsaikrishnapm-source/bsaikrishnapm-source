# Enterprise AI Portfolio — Product Roadmap

A decision-focused roadmap for six independent product management prototypes.

[Project board](https://github.com/users/bsaikrishnapm-source/projects/1) · [Portfolio overview](README.md) · [Case-study guide](PORTFOLIO.md)

## Product goal

Make enterprise AI decisions inspectable: what evidence may an assistant use, which actions require approval, when automation should stop, and which investment deserves limited capacity.

**Primary reviewer:** A hiring manager evaluating product judgment, technical fluency and delivery discipline.
**Demo users:** Knowledge workers, support agents, operations leads and product teams.
**Evidence boundary:** Synthetic scenarios and local Python prototypes. No customer adoption, production deployment or real-model performance is claimed.

## Current baseline

| Repository | Implemented baseline | Evidence |
| --- | --- | --- |
| [Permission-Aware Retrieval](https://github.com/bsaikrishnapm-source/permission-aware-retrieval) | Exact-topic policy filtering by tenant, role and active version | 5 documents and 8 labeled queries |
| [Agent Action Approvals](https://github.com/bsaikrishnapm-source/agent-action-approvals) | Read/refund decision simulation | 10 fictional scenarios |
| [AI Cost Quality Lab](https://github.com/bsaikrishnapm-source/ai-cost-quality-lab) | Cost, quality and latency scenario comparison | 3 hypothetical variants |
| [Ticket Routing](https://github.com/bsaikrishnapm-source/ticket-routing) | Confidence-threshold policy comparison | 20 synthetic tickets |
| [Workflow Adoption](https://github.com/bsaikrishnapm-source/workflow-adoption) | Segmented activation-funnel analysis | 40 synthetic accounts |
| [Enterprise Roadmap](https://github.com/bsaikrishnapm-source/enterprise-roadmap) | Dependency-aware capacity allocation | 8 opportunities; 256 candidate subsets |

## Now — specify controls before expanding automation

| Priority | Work item | Why it comes first |
| --- | --- | --- |
| P0 | [Recheck evidence access](https://github.com/bsaikrishnapm-source/permission-aware-retrieval/issues/1) | Permissions may change after retrieval |
| P0 | [Abstain on conflicting policies](https://github.com/bsaikrishnapm-source/permission-aware-retrieval/issues/2) | Relevant evidence may still disagree |
| P0 | [Bind approval to the exact action](https://github.com/bsaikrishnapm-source/agent-action-approvals/issues/1) | Approval must not authorize changed or replayed requests |
| P0 | [Override routing for urgent cases](https://github.com/bsaikrishnapm-source/ticket-routing/issues/1) | High confidence does not establish safe automation |

## Next — improve measurement and decision transparency

| Priority | Work item | Decision it supports |
| --- | --- | --- |
| P1 | [Frozen retrieval evaluation](https://github.com/bsaikrishnapm-source/permission-aware-retrieval/issues/3) | Does broader matching help without weakening access controls? |
| P1 | [Evidence review and audit design](https://github.com/bsaikrishnapm-source/permission-aware-retrieval/issues/4) | Can a user understand and challenge the outcome? |
| P1 | [Configurable AI cost assumptions](https://github.com/bsaikrishnapm-source/ai-cost-quality-lab/issues/1) | When does the pilot recommendation change? |
| P1 | [Onboarding event validation](https://github.com/bsaikrishnapm-source/workflow-adoption/issues/1) | Is the activation denominator trustworthy? |
| P1 | [Roadmap inclusion/exclusion rationale](https://github.com/bsaikrishnapm-source/enterprise-roadmap/issues/1) | Which assumptions drive the investment choice? |

## Later — demonstrate complete user workflows

Explore a visual evidence-review experience, an approval inbox and interactive scenario controls after their rules and failure states are specified. These are discovery directions, not delivered features or committed dates.

## Prioritization policy

P0 addresses an explicit unsafe or invalid decision path in a scenario. P1 improves evidence quality or transparency. Sequence dependencies before their dependent features. No fabricated revenue scores, customer demand or engineering estimates are used.

## Board working agreement

All nine linked issues are **proposed** and begin in **Backlog**.
- **Backlog:** Problem captured; implementation has not started.
- **Ready:** Scope, dependency and acceptance criteria reviewed.
- **In Progress:** Implementation actually underway.
- **In Review:** Code or artifact ready; acceptance evidence under review.
- **Done:** Acceptance criteria met and linked verification recorded.

Suggested fields: Status, Priority (P0/P1/P2), Horizon (Now/Next/Later), Repository, and Evidence link. Horizons indicate sequence, not deadlines.

## Definition of done

A change has an understandable user outcome, reproducible verification, documented failure cases, updated run instructions, and an explicit evidence boundary. Close its issue only after these conditions are met. Completed baseline artifacts do not make proposed extensions complete.

## Board setup status

The public board exists. This roadmap and the nine repository issues are prepared; adding them to the native board requires an authenticated Projects session. Creating an issue alone does not place it on the board.
