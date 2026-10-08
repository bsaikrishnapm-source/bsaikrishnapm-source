# Working on this portfolio

Each project is independent. Start with its README, PRODUCT.md, and VALIDATION.md before changing behavior.

## Verify a change

Install Python 3.10+ and Node.js 20+, then run from the repository root:

```sh
python3 scripts/verify.py
```

On Windows use `py -3 scripts/verify.py`. Core checks need no third-party packages or API keys. Sentinel's HTTP tests create temporary databases and bind a local test server.

The runner checks:
- Project Sentinel's Python engine, storage, monitoring, and HTTP workflows.
- AgentTrace's Node decision engine.
- API Launch Readiness's Node decision engine.
- AgentTrace's clean, risky, and sparse CLI outputs and expected exit codes.

A HOLD or INSUFFICIENT EVIDENCE scenario intentionally exits 2; the runner verifies that result rather than treating it as a crashed test.

The GitHub Actions workflow uses the same command on pushes to main and pull requests. Consult its actual run status; the presence of the workflow is not evidence that a run passed.

## Browser changes

Run the affected project's browser checks where available and inspect layout and keyboard interaction. Instructions and outstanding checks are in each project's VALIDATION.md. The root runner does not install or run browser tooling and does not replace those checks.

## Product changes

Describe the user's problem, intended behavior, evidence, and trade-off. Update examples and product documentation when rules or data contracts change. Add regression coverage for meaningful behavior changes. Keep synthetic data clearly labeled and never commit credentials or private customer records.

For Project Sentinel, preserve the original baseline and the documented alert lifecycle. For AgentTrace, retain segment coverage checks, policy blockers, and the human review boundary.

## Pull request checklist

- Explain the user-visible result and key trade-off.
- Record the checks actually run and their results.
- Document incomplete validation and remaining limitations.
- Keep setup instructions, examples, and data contracts consistent.
