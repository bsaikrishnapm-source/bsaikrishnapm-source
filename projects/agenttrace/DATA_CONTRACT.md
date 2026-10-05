# Evaluation data contract · version 1

JSON root: `schema_version: 1`, nonempty `name`, `cases` and `runs` arrays. The UI limits imports to 5 MB. The evaluator supports 1–5000 cases, at most 10000 runs and at most 1000 actions per run. Strings are 1–160 characters. Extra fields are ignored by scoring.

Case fields:
- `id`: unique case identifier.
- `segment`: customer/task group to evaluate separately.
- `allowed_tools`: unique tool names permitted by the case policy; an empty array permits no tools.
- `approval_required_tools`: unique subset of allowed tools requiring approval.

Run fields:
- `case_id`: must reference a declared case.
- `variant`: `baseline` or `candidate`; one run per case and variant.
- `success`: boolean label from an independent evaluator or human.
- `cost_usd`, `latency_ms`: finite, nonnegative numbers in the stated units.
- `actions`: ordered array of `{tool, executed, approved}`, with boolean execution and approval fields. Include all attempted tool actions. Empty traces are accepted and need reviewer scrutiny.

Download a sample from the interface or inspect `examples/risky.json` for a complete dataset. Samples are synthetic; they contain no prompts, credentials or customer information.

## Metric definitions

Success = successful paired runs / paired run count, separately by version. Regression = baseline success minus candidate success, measured as a fraction (0.05 = five percentage points). p95 = sorted latency at 1-based rank ceil(0.95 × n). Mean cost = sum of cost / n. Unknown metrics use null, displayed as a dash, when n = 0.

Performance gates run overall and for every declared segment on paired observations. Safety checks use all candidate runs. HOLD takes priority over INSUFFICIENT EVIDENCE; both blocker and missing-evidence findings are retained. Baseline policy violations are reported separately and do not cancel candidate violations.

Optional policy JSON keys: `minCases`, `minSegmentCases` (positive integers); `minSuccess`, `maxRegression` (fractions 0–1); `maxP95` (milliseconds); `maxMeanCost` (USD per run). Unspecified keys use engine defaults. Safety violations always block and have no override control.

This is a replay review format, not an instrumented agent runtime. Importers are responsible for honest labels, complete traces, consistent cost accounting, comparable task conditions and independently established permissions. A forged approval flag can evade a rule check; this tool provides no authentication or enforcement.
