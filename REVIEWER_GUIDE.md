# Review the portfolio in five minutes

[Profile](README.md) · [All nine projects](PORTFOLIO.md) · [Run a demo](START_HERE.md)

These independent projects connect product judgment with inspectable implementations. Choose a route below, read the decision, then inspect the evidence.

## Delivery and product ownership: Project Sentinel

**Problem hypothesis:** Teams can report activity while drifting from the plan agreed at kickoff.

**Product choice:** Keep the original baseline visible. An acknowledgement records review; the alert resolves only when its underlying condition clears. Changed evidence can reopen it.

**Inspect:** [Product brief](projects/project-sentinel/PRODUCT.md), [actual dashboard](projects/project-sentinel/assets/dashboard.jpg), and [validation record](projects/project-sentinel/VALIDATION.md).

**Try:** Acknowledge a risk, update the associated work, and inspect the alert history. Restart the local server to check persistence.

**Discuss:** How should a PM approve a legitimate baseline change? What alert volume would make the tool distracting? Which integration should follow a usability study?

## AI product management: AgentTrace

**Problem hypothesis:** Better aggregate cost and latency can hide a regression for one customer segment or an unauthorized action.

**Product choice:** Compare paired cases, check each declared segment, and treat executed tool-policy violations as blockers. The best verdict advances the candidate to human review.

**Inspect:** [Product brief](projects/agenttrace/PRODUCT.md), [data contract](projects/agenttrace/DATA_CONTRACT.md), and [validation record](projects/agenttrace/VALIDATION.md).

**Try:** Compare risky, clean, and missing-coverage scenarios. Inspect Billing and the tool traces, then export a review memo.

**Discuss:** Who supplies trusted success labels and approval evidence? What sample size is appropriate? How would repeated runs and statistical uncertainty change the release decision?

## Platform product management: API Launch Readiness

**Problem hypothesis:** A release can appear ready even when dependencies or evidence remain incomplete.

**Product choice:** Make ownership, evidence, dependencies, and critical blockers explicit before a go/no-go review.

**Inspect:** [Product brief](projects/api-launch-readiness/PRODUCT.md), [decision log](projects/api-launch-readiness/DECISIONS.md), and [validation record](projects/api-launch-readiness/VALIDATION.md).

**Try:** Compare the three presets, remove an evidence note, and inspect the resulting dependency explanation.

**Discuss:** Who owns gate definitions? Which gates should block every release? How would teams prevent stale evidence from becoming a checkbox exercise?

## Reproduce the core checks

From this repository's root, with Python 3.10+ and Node.js 20+:

```sh
python3 scripts/verify.py
```

Windows: `py -3 scripts/verify.py`.

The runner covers Sentinel's Python/HTTP tests, both JavaScript decision engines, and three AgentTrace CLI scenarios. It exits nonzero when any check fails. Browser tests remain separate. See [contributing](CONTRIBUTING.md) for the verification scope.

## Evidence boundary

Examples are synthetic and the implementations are AI-assisted. Tests establish behavior on constructed cases; they do not establish customer demand, measured business impact, model quality, or production readiness. Product briefs distinguish working behavior from proposed discovery and future integrations.
