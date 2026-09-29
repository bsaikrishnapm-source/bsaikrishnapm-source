# Project data contract

Use [examples/pulse.json](examples/pulse.json) as the smallest complete example, or export a project from the UI. Project, task and decision IDs use 1–100 letters, digits, underscores or hyphens. Dates are `YYYY-MM-DD`; amounts are numeric USD in this version.

| Field | Meaning |
| --- | --- |
| `id`, `name`, `owner`, `objective` | Stable project key and user-facing context |
| `baseline.start_date`, `baseline.target_date` | Original project window |
| `baseline.budget`, `baseline.scope_points` | Approved cost and original effort; both positive |
| `spent` | Current cumulative spend |
| `team` | Owner names and `weekly_capacity` in effort points |
| `quality` | Nonnegative integer `open_critical`, `open_high`, `total_tests`, `failed_tests` |
| `decisions` | Unique `id`, `title`, `owner`, `due_date`, `status` (`open`/`decided`) |
| `tasks` | Between 1 and 500 uniquely identified work items |

Every task has `id`, `title`, `owner` (team member or empty), `points`, `baseline_points`, `baseline_start`, `baseline_due`, `due_date`, `progress`, `status`, `updated_at`, `completed_at`, `blocked_since`, and `depends_on` (task IDs).

`points` is current estimated effort. `baseline_points` preserves the original effort; new scope has zero baseline points. Baseline points must sum to the project's original scope. Baseline tasks cannot be deleted from a later import for the same project ID. Added-scope tasks may be removed by import.

`status` is `todo`, `in_progress`, `blocked`, or `done`. Todo requires zero progress; done requires 100% and a completion date. Other statuses must have progress below 100. Dependencies must exist and must not form cycles. Future or stale update dates are surfaced as evidence warnings.

Imports replace the current actuals for an existing ID and reject changes to its project baseline or original task dates/points. A new ID creates a separate project. Maximum workspace size is 20 projects; uploaded JSON is limited to 1 MB. Back up the database before major changes.

No Jira or Asana field mapping is implied. An integration must explicitly map its semantics to this contract, including timezone, points, ownership, completion and baseline history.
