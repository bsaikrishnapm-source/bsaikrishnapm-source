# Product brief — an early warning system after kickoff

## Product insight

The user's idea: a PM should know when an ongoing project is going wrong compared with expectations, and receive useful alerts or suggestions. The problem is not just visualizing a task list. It is turning changes into decisions while enough time remains to act.

Primary user: a PM or product owner coordinating a cross-functional delivery project. Discovery assumptions below are hypotheses, not completed user research.

## Jobs to be done

| After kickoff | PM question | Product response |
| --- | --- | --- |
| A due date changes | What commitment did we originally make? | Preserve baseline and surface slippage |
| New work appears | What does this do to the agreed scope? | Separate current from baseline points |
| A dependency stalls | Who is blocked, and who must resolve it? | Show prerequisite IDs, owners and next steps |
| Teams report “in progress” | Are we actually keeping pace? | Compare weighted reported progress with the dated plan |
| Costs accumulate | Are we spending faster than delivering? | Budget-to-progress signal with explicit limitations |
| Defects or decisions remain open | What prevents a responsible release decision? | Quality and decision-latency signals |
| Updates are old | Can I trust this report? | Highlight stale evidence instead of hiding uncertainty |

## MVP decisions

- Make the baseline immutable for an existing project ID. This prevents silent resetting of the plan, at the cost of a separate workflow for approved rebaselines.
- Use deterministic checks for facts and optional AI for interpretation. A model must not determine whether a reported due date is overdue.
- Require explicit human edits. Suggestions do not change commitments, assign work or message colleagues.
- Keep the first deployment local and single-user, with SQLite persistence, to make it usable on a personal laptop without cloud costs.
- Show evidence before recommendations. Correlation is not a root-cause diagnosis.

## Acceptance criteria delivered

1. A PM can create a project baseline without writing JSON.
2. Updating task status/progress changes health and alerts immediately.
3. Adding scope preserves the baseline and can trigger a scope-change signal.
4. Updating spend, quality, capacity and decisions reruns the assessment.
5. Acknowledgement persists after restart, does not lower health severity, and reopens after evidence changes.
6. A condition that clears becomes resolved; recurrence becomes open again.
7. Invalid data does not replace the last valid project.
8. The background monitor works without an open browser.
9. An optional AI briefing cannot bypass the detectors or mutate project state.
10. Every recommendation has an accountable owner and supporting alert evidence.

## Metrics to validate with actual users

Proposed pilot: ask three PMs to find the most important risk, identify its evidence and owner, update one task, and explain why a risk remains after acknowledgement. Record task success, confusion, time-to-decision and whether the proposed next step is useful. No results have been collected yet.

Later outcomes to measure: actionable-alert precision judged by users, alert-to-review time, ignored-alert rate, stale-data coverage, and whether interventions prevent surprise changes. Do not claim schedule savings or delivery improvements from synthetic fixtures.

## Next decisions

- Confirm the laptop OS and resources; install the app and run a real-browser walkthrough.
- Validate detection thresholds against a real project and identify alert fatigue.
- Add one authenticated project-system connector before broad integration coverage.
- Design authorization, data retention, backups and approved notification destinations before shared deployment.
