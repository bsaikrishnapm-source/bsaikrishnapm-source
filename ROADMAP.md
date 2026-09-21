# Enterprise AI Portfolio — Product Roadmap

[Open the six demos](START_HERE.md) · [Profile](README.md) · [GitHub Projects board](https://github.com/users/bsaikrishnapm-source/projects/1)

## Product goal

Make enterprise product decisions inspectable: what evidence an assistant may use, which actions need approval, when automation should stop, and what to fund within limited capacity.

All six repositories now include a local browser interface, decision engine, behavioral tests, walkthrough and validation report. Original Python analyses remain available. All records and model assumptions are synthetic.

## Implemented demos

| Product | Implemented experience | New decision tests |
| --- | --- | --- |
| [Evidence Review](https://github.com/bsaikrishnapm-source/permission-aware-retrieval) | Structured conflicts, version precedence, simulated citation access rechecks and in-memory audit | 8 |
| [Approval Inbox](https://github.com/bsaikrishnapm-source/agent-action-approvals) | Exact payload binding, review states, expiry, manager threshold and local replay handling | 8 |
| [AI Economics](https://github.com/bsaikrishnapm-source/ai-cost-quality-lab) | Configurable quality/cost/latency comparison, snapshots and CSV results | 7 |
| [Triage Console](https://github.com/bsaikrishnapm-source/ticket-routing) | Urgency-keyword override, threshold comparison, per-ticket reasons and local confirmed assignments | 7 |
| [Activation Analytics](https://github.com/bsaikrishnapm-source/workflow-adoption) | Event validation, deduplication, observation exclusions and segmented activation | 8 |
| [Investment Planner](https://github.com/bsaikrishnapm-source/enterprise-roadmap) | Capacity constraints, dependency checks, include/defer rationale and sensitivity comparison | 7 |

**45 new decision tests passed.** All six original Python entry points also passed their baseline checks. Browser rendering/accessibility have not been verified here; each VALIDATION.md lists remaining manual checks.

## Backlog status — three completed, six open

| Issue | Status | Remaining boundary |
| --- | --- | --- |
| [Configurable AI assumptions](https://github.com/bsaikrishnapm-source/ai-cost-quality-lab/issues/1) | Completed | Fictional inputs; no real-model benchmark |
| [Onboarding event validation](https://github.com/bsaikrishnapm-source/workflow-adoption/issues/1) | Completed | No A/B experiment or causal finding |
| [Roadmap rationale](https://github.com/bsaikrishnapm-source/enterprise-roadmap/issues/1) | Completed | Estimates are synthetic, not negotiated commitments |
| [Evidence access rechecks](https://github.com/bsaikrishnapm-source/permission-aware-retrieval/issues/1) | Partial; open | Simulated browser checks exist; authenticated server authorization remains |
| [Conflicting policy handling](https://github.com/bsaikrishnapm-source/permission-aware-retrieval/issues/2) | Partial; open | Structured rule and tests exist; dedicated conflict recall/false-positive evaluation remains |
| [Semantic retrieval evaluation](https://github.com/bsaikrishnapm-source/permission-aware-retrieval/issues/3) | Not implemented; open | No semantic engine or frozen independent evaluation has been run |
| [Evidence review and audit](https://github.com/bsaikrishnapm-source/permission-aware-retrieval/issues/4) | Partial; open | Local UI/audit exists; browser/accessibility verification and protected audit service remain |
| [Exact-action approvals](https://github.com/bsaikrishnapm-source/agent-action-approvals/issues/1) | Partial; open | Payload and expiry simulation exists; authenticated authority and durable atomic execution remain |
| [Urgency override](https://github.com/bsaikrishnapm-source/ticket-routing/issues/1) | Partial; open | Keyword policy exists; independent labeling and representative evaluation remain |

## Next decisions

1. Complete manual desktop, narrow-screen and keyboard walkthroughs before claiming UI validation.
2. Establish authenticated backend identity and transaction boundaries before introducing protected data or real actions.
3. Freeze independently reviewed evaluation cases before tuning semantic retrieval or hazard recognition.
4. Decide whether to host the demos as public sites. They currently open locally from downloaded repository files.

Production capabilities require their own architecture, integrations, operational ownership and validation; a client-side demo is not a security service.

## Delivery working agreement

- Todo/Backlog: Not started, or explicitly documented remaining scope.
- In Progress: Implementation actually underway.
- In Review: Code ready with acceptance evidence pending.
- Done: All declared acceptance criteria and verification satisfied.

Close issues only when their declared scope is met. Partial demo implementations keep the corresponding production/validation gaps visible. Use Priority, Repository, Horizon and Evidence link as planning fields; do not invent deadlines or measured business impact.

## Definition of done

A change has an understandable user outcome, reproducible verification, documented failure cases, updated run instructions and explicit evidence boundaries. Current validation reports do not claim completed visual, accessibility or independent security reviews.

## Board status

The user's last screenshot showed the four retrieval issues on the board in Todo. Repository code and issue status have been updated through the GitHub connection. Native board fields and membership were not edited; they may need to be synchronized with the table above.
