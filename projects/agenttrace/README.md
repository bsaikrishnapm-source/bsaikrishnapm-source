# AgentTrace
### Review an AI agent change through evidence, risk and customer impact.

**A working evaluation workbench by Sai Krishna Banda.** Compare baseline and candidate agent runs on the same cases, inspect executed tool actions against a supplied policy, and export a product review memo.

An agent can become cheaper and faster while failing an important customer segment. AgentTrace makes those trade-offs visible before a human release decision.

## Open the application

1. Download this repository using **Code → Download ZIP** and extract it.
2. Open `projects/agenttrace/index.html` in a modern browser.
3. Select a scenario, inspect its findings and expand a case to see the evidence.

No installation, API key, server or model download is required for the dashboard. The GitHub page displays source code; it is not a hosted live demo. Data stays in browser memory and resets when the page reloads. Export the dataset before closing if you need a copy.

## Try these decisions

| Scenario | Expected review | What to notice |
| --- | --- | --- |
| Faster, cheaper — but unsafe | HOLD | Billing success falls to 75%; a refund lacks approval and an account deletion uses an unauthorized tool |
| All configured checks pass | READY FOR HUMAN REVIEW | 24 paired cases pass the configured thresholds; this does not establish production readiness |
| Missing evaluation coverage | INSUFFICIENT EVIDENCE | Only three cases have paired observations; missing runs cannot manufacture a pass |

## Working features

- Compare paired task success, nearest-rank p95 latency and mean cost.
- Check each declared segment, so an aggregate average cannot conceal a failing group.
- Inspect executed tool calls for missing approvals and unauthorized tools.
- Adjust sample-size, success, regression, latency and cost gates.
- Import recorded evaluation runs as JSON with validation and helpful rejection errors.
- Export the loaded dataset and a Markdown review memo containing the active policy and findings.
- Run the same evaluator from the command line for repeatable review.

## Tests and command-line review

Requires Node.js 20+ for tests and CLI; there are no npm dependencies.

```sh
cd projects/agenttrace
node --test tests/engine.test.js
node cli.js examples/risky.json > review.md
```

CLI exit codes: `0` ready for human review, `2` hold or insufficient evidence, `1` invalid input. An optional second argument specifies a policy JSON file. Export the dataset in the UI or use the bundled examples as an import template.

[Product decisions](PRODUCT.md) · [Data contract](DATA_CONTRACT.md) · [Validation](VALIDATION.md)

## What this demonstrates

Product framing, evaluation strategy, release criteria, segment analysis, evidence inspection and an explicit human decision boundary. This complements Project Sentinel's delivery monitoring: AgentTrace examines recorded AI-agent behavior before rollout.

## Boundaries and authorship

Independent, AI-assisted portfolio implementation using synthetic samples. This application evaluates imported traces deterministically; it does not call an LLM or execute an agent. Task success labels must come from human review or a separate trusted evaluator. Tool permission contracts and approval records are supplied by the importer and are not cryptographically verified. No statistical significance, causal inference, production enforcement, real customer research or measured business results are claimed. Thresholds are illustrative and must be agreed before reviewing a real candidate. No complete security or cross-browser audit has been performed.

[Back to the portfolio](../../README.md)
