# Product brief — evidence before rollout

## Problem and user

Hypothesis: a platform PM coordinating an API integration release can struggle to distinguish completed checklists from launch-blocking gaps. The proposed user coordinates engineering, security, operations, and developer experience. This hypothesis has not been validated with interviews.

Job to be done: “When several teams report readiness, help me understand what blocks the release, why it blocks, and who can resolve it.”

## MVP scope

Seven predefined gates; editable status, accountable team and evidence note; dependency-aware evaluation; configurable readiness threshold; three synthetic scenarios; downloadable decision record. No automatic deployment, backend, persistence, or external integrations.

## Acceptance criteria

| Requirement | Observable behavior |
| --- | --- |
| Prevent critical failures being averaged away | Any unresolved critical gate returns HOLD even with threshold zero |
| Require ownership and evidence | Blank team or evidence prevents an effective pass |
| Surface prerequisite failures | Pilot acceptance cannot pass until its access and retry dependencies clear |
| Support controlled rollout discussions | Noncritical gaps with score at/above threshold return PILOT ONLY |
| Keep release authority explicit | All gates passing returns READY FOR REVIEW, not an automatic approval |
| Reject invalid evaluation | Out-of-range thresholds and cyclic or missing dependencies fail explicitly |
| Avoid stale exports | Invalid input clears the current result and disables export |
| Preserve rationale | CSV includes status, effective pass, owner, evidence, reasons and decision |

## Measurement plan — proposed, not achieved

Primary usability measure: can a participant correctly identify the critical blocker and accountable team without assistance? Secondary: time to explain the pilot dependency, successful export, and whether they mistake the recommendation for deployment authorization. Record raw observations from three initial sessions; do not generalize from that small convenience sample.

Production outcome hypotheses include fewer late launch surprises and faster release reviews. Neither has been measured. Before a production experiment, define a baseline and independently classify release complexity; a prototype session cannot demonstrate operational impact.

## Rollout proposal

1. Local prototype usability checks with fictional evidence.
2. Engineering and security review of gate completeness and authority boundaries.
3. Read-only integration pilot with authenticated owners and immutable evidence references.
4. Consider workflow integration only after retention, authorization, auditability and rollback ownership are agreed.

## Risks

Checklist incompleteness can create false confidence. Self-reported evidence can be stale or wrong. Arbitrary weights may encourage score gaming. Use hard blockers, show evidence provenance, and treat the score as navigation aid. A real service needs independently enforced release controls.
