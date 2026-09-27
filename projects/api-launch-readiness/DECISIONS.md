# Decision log

| Decision | Rationale | Alternative and trade-off |
| --- | --- | --- |
| Critical gates override score | Tenant isolation and rollback cannot be traded against completed documentation | A single weighted average is simpler but masks blockers |
| Dependencies affect effective pass | A pilot sign-off relies on prerequisites, even if its reported status is pass | Flat checklists are easier to maintain but hide inconsistent evidence |
| Separate pilot from full review | Incomplete noncritical documentation should remain visible | Binary go/no-go loses sequencing detail; actual pilot approval still needs a human |
| Require owner and evidence note | Make accountability and the reason for a pass inspectable | Free text cannot authenticate evidence; a real service needs trusted references |
| Local-only storage | Allows reviewers to run it without credentials or a backend | No collaboration, durable audit history, or authenticated authority |
| Export the complete gate table | Preserve the reasoning as well as the headline recommendation | CSV is editable and is not an immutable audit log |

Weights, criticality and default threshold are illustrative. They must be validated for a specific integration, not adopted as a universal release policy.
