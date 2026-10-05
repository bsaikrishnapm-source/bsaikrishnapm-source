# Product brief: AgentTrace

## Problem and user

A PM reviewing an agent upgrade needs to know which customers benefit, which tasks regress, and whether lower costs hide unsafe tool use. Separate trace files and overall benchmark averages make that review difficult. This is a problem hypothesis informed by the portfolio use case, not validated customer research.

Primary user: a product manager working with engineering and evaluation owners on a support-agent release. Decision: hold a change, gather more evidence, or advance it to human release review.

## Scope and product choices

1. **Compare identical cases.** Baseline/candidate metrics use paired cases only. Missing runs are shown as missing evidence. All candidate actions are checked for safety, including unpaired runs.
2. **Safety is a hard gate.** Cost and speed cannot compensate for an executed unauthorized action. Attempted but blocked actions remain visible in traces but do not count as executed violations.
3. **Require coverage for every declared segment.** The sample includes account access, billing and knowledge lookup. Any declared segment can prevent a passing review. Undeclared population segments cannot be discovered automatically.
4. **Keep the decision with a person.** The best outcome is 'ready for human review'. There is no deploy button.
5. **Make assumptions portable.** Exported memos include policy and evidence. Exported datasets preserve case contracts and runs. Browser data is memory-only to avoid silently persisting customer traces.

## Acceptance criteria

- A candidate with a single executed unauthorized tool cannot pass.
- Missing pairs or insufficient overall/segment samples cannot pass.
- A failing segment must appear even when overall success meets its threshold.
- Invalid imports leave the previous valid assessment intact.
- An imported label cannot become executable HTML in the interface.
- Exports must reflect the currently applied policy and dataset.

## Discovery and evaluation plan

Interview five PM/evaluation-owner pairs about their latest agent release review. Observe a review with sanitized historical traces, compare time to find seeded regressions, and record which recommendations they dispute. Proposed measures: reviewer agreement, missed critical failures, time to produce a decision memo, and unnecessary holds. No target is presented as an achieved outcome.

## Trade-offs and next decisions

Descriptive metrics are easy to audit but do not estimate statistical confidence. Small sample gates are illustrative. Next priorities: validate the data contract with real trace exports, add confidence intervals and repeated runs, then investigate signed approval evidence and integrations. Model-based grading should only follow agreement on a calibrated evaluation rubric. Avoid adding integrations until an actual workflow and data owner are established.
