# Start here — six interactive PM product demos

These independent prototypes demonstrate product decisions through working local browser experiences. Each repository also retains its original Python analysis and product documents.

## Open a demo without coding

1. Open a repository from the table below.
2. Select the green **Code** button, then **Download ZIP**.
3. Extract the ZIP.
4. Open the extracted **demo/index.html** file in your browser.

Keep the demo folder's files together. No API key, account, terminal or software installation is needed to use the demo. GitHub itself displays the HTML source; it does not host these interfaces as live websites.

| Product | Repository | Workflow to try |
| --- | --- | --- |
| Evidence Review | [Permission-Aware Retrieval](https://github.com/bsaikrishnapm-source/permission-aware-retrieval) | Retrieve → revoke access → reopen a source; compare structured conflicting policies |
| Approval Inbox | [Agent Action Approvals](https://github.com/bsaikrishnapm-source/agent-action-approvals) | Submit → approve → simulate execution → retry; test changed payload and expiry |
| AI Economics | [AI Cost Quality Lab](https://github.com/bsaikrishnapm-source/ai-cost-quality-lab) | Adjust volume, cost and quality gates; inspect eligibility and export CSV |
| Triage Console | [Ticket Routing](https://github.com/bsaikrishnapm-source/ticket-routing) | Compare urgency override with baseline; inspect T18 and confirm a queue |
| Activation Analytics | [Workflow Adoption](https://github.com/bsaikrishnapm-source/workflow-adoption) | Validate events, inject duplicates and missing signup, compare eligible cohort funnels |
| Investment Planner | [Enterprise Roadmap](https://github.com/bsaikrishnapm-source/enterprise-roadmap) | Change capacity, reserve and estimates; inspect selection/deferral explanations |

## What reviewers can inspect

Each repository includes a **DEMO_GUIDE.md** explaining the workflow, architecture and trade-offs, **VALIDATION.md** recording actual checks, and **test_demo.cjs** with executable decision tests.

**Verification:** 45 new Node behavioral tests passed across the six decision engines. All six original Python entry points completed against their original baselines. Browser script syntax was checked. The local interfaces have not been visually or accessibility-tested in this environment; validation reports keep those manual checks open.

## Scope

All examples are synthetic. Approvals, roles, evidence permissions, ticket assignments and audit records are local simulations. No customer systems, payments, real-model APIs or private data are connected. State resets on refresh; explicit evidence downloads are retained by your browser.

The Projects board is a delivery tracker. Adding an issue to it does not create a feature or launch a demo. Completed implementations and remaining production work are tracked in the [portfolio roadmap](ROADMAP.md).
