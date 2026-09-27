# API Launch Readiness Console

### Can this integration ship safely—and who owns the remaining gaps?

A platform PM has seven reported release gates and a deadline. A readiness average looks reassuring, but a failed tenant-isolation check and an untested rollback must stop the launch. This prototype makes that decision explicit.

**Independent portfolio case study by Sai Krishna Banda. All scenarios and evidence are synthetic.**

## The product decision

Critical failures override the readiness score. A gate counts as clear only when its status is pass, an accountable team and evidence note are present, and its dependencies are clear. The output is a recommendation for human review, never release authorization.

| Scenario | Default result | Why |
| --- | --- | --- |
| Blocked release | HOLD · 40% | Access checks fail, rollback evidence is missing, and pilot acceptance depends on unresolved access checks |
| Pilot candidate | PILOT ONLY · 90% | Critical gates clear; partner documentation is still incomplete |
| Ready for review | READY FOR REVIEW · 100% | Every configured gate clears; an accountable human still decides |

Readiness is a weighted checklist score, **not a probability of success or a risk estimate**. Weights and the 85% threshold are illustrative product assumptions.

## Try it in two minutes

1. Download this repository using **Code → Download ZIP** and extract it.
2. Open `projects/api-launch-readiness/demo/index.html` in a browser. Keep its neighboring files together.
3. Load **Pilot candidate**, then raise minimum readiness to **95**. The recommendation changes to HOLD.
4. Load **Ready for review** and delete the access-check evidence note. Observe the critical blocker and dependent pilot gate.
5. Export the decision CSV to inspect every gate and its rationale.

No dependencies, server, API keys, or account are required for the demo. GitHub displays HTML source; this is not a hosted application. Edits reset on reload or scenario change.

## Product artifacts

- [Product brief](PRODUCT.md): user problem, scope, acceptance criteria, and proposed measurement.
- [Decision log](DECISIONS.md): rationale and rejected alternatives.
- [Validation](VALIDATION.md): completed checks and remaining verification.
- [Engine](demo/engine.js): dependency-aware decision rules and CSV export.
- [Tests](test_engine.cjs): executable failure cases.

## Run the tests

With Node.js 18 or newer, from this project folder:

```sh
node --test test_engine.cjs
```

## Boundaries

This is a client-side simulation with user-entered evidence notes. It does not verify evidence authenticity, identity, authorization, service health, or gate completeness. It does not connect to GitHub Actions, production APIs, customer systems, or deployment controls. Adding a note satisfies a demo input rule; it does not establish that the check was performed.

## Contribution and next iteration

The portfolio demonstrates problem framing, release policy, acceptance criteria, prioritization, and technical implementation developed with AI assistance. No customer interviews, real launch decisions, or measured business improvements are claimed.

Next: observe three platform PMs completing the blocked-release task; record where they misunderstand dependencies or mistake a recommendation for approval. Use those findings to revise the experience before designing authenticated evidence integrations.

[Back to Sai's portfolio](../../README.md)
