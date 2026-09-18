# Five PM Portfolio Projects

These are buildable project blueprints, not claims of completed work. Each project should end with a product decision supported by evidence—not a collection of templates.

Use the suggested repository names below. Copy the relevant project section into that repository's README, then replace planning language with what you actually did. No production application or deep coding is required.

## 1. Activation Drop-off Audit

**Suggested repo:** `activation-dropoff-audit`

**One-line description:** Diagnose where users abandon a five-step onboarding funnel and propose one measurable intervention.

**Demonstrates:** Metric definition, data quality judgment, segmentation, analysis, and experiment design.

**Scope:** Use 200–500 synthetic user records for a fictional scheduling product. Track signup, calendar connection, availability setup, booking-page publication, and first booking. Compare two acquisition channels. A spreadsheet is sufficient; a notebook is optional.

### Repository contents

| File / folder | What to include |
| --- | --- |
| `README.md` | Problem, dataset caveat, three findings, recommended change, and limitations |
| `data/onboarding-events.csv` | Synthetic user IDs, event names, timestamps, and acquisition channels |
| `data/DATA_DICTIONARY.md` | Field definitions, how the data was generated, and known limitations |
| `analysis/funnel-analysis.md` | Conversion denominators, observation window, segment comparisons, and calculations |
| `assets/` | Exported funnel and segment charts |
| `specs/tracking-plan.md` | Event triggers, required properties, duplicate handling, and validation checks |
| `experiments/calendar-connect-test.md` | Hypothesis, proposed change, primary metric, guardrails, and decision rule |

**Decision to make:** Which onboarding step deserves the first experiment, and what evidence would justify expanding it?

**Definition of done:** A reproducible funnel, one segment insight, and one experiment recommendation. Explicitly distinguish observed association from causation; do not claim that a proposed experiment improved conversion.

**Realistic time:** One weekend, about 8–12 focused hours.

## 2. Roadmap Trade-off Lab

**Suggested repo:** `roadmap-tradeoff-lab`

**One-line description:** Choose a quarterly roadmap for a fictional B2B workflow product under a fixed delivery budget.

**Demonstrates:** Prioritization, commercial reasoning, dependency management, and communicating difficult trade-offs.

**Scope:** Compare eight opportunities against an assumed 12 team-week capacity. Include one reliability obligation, one dependency, and conflicting requests from two customer segments. Use spreadsheet formulas; no coding is needed.

### Repository contents

| File / folder | What to include |
| --- | --- |
| `README.md` | Business context, capacity constraint, chosen roadmap, and rationale |
| `inputs/opportunities.csv` | Eight problems with reach, impact, confidence, effort, and evidence references |
| `inputs/assumptions.md` | Fictional customer context, estimates, and uncertainty ranges |
| `prioritization/scoring-model.md` | Scoring formula, units, definitions, and why scores do not decide everything |
| `prioritization/sensitivity-analysis.md` | How the ranking changes when effort or confidence changes |
| `roadmap/now-next-later.md` | Sequencing, dependencies, and capacity allocation |
| `decisions/decision-log.md` | Selected and rejected options, explicit overrides, and reconsideration triggers |
| `communications/stakeholder-update.md` | A one-page explanation of the roadmap and the requests deferred |

**Decision to make:** What gets funded, what gets deferred, and which assumptions could reverse that choice?

**Definition of done:** A roadmap that fits the stated capacity and explains at least two rejected alternatives. Treat estimates as assumptions, not engineering commitments.

**Realistic time:** One weekend, about 6–10 focused hours.

## 3. AI Support Copilot Evaluation

**Suggested repo:** `ai-support-copilot-eval`

**One-line description:** Evaluate whether an AI assistant can draft accurate support replies from a small, fictional help center.

**Demonstrates:** AI product judgment, evaluation design, failure analysis, human-in-the-loop design, and release criteria.

**Scope:** Write five fictional policy articles and 30 test questions. Include ambiguous questions, unsupported requests, conflicting instructions, and cases that require escalation. Compare two prompt versions manually in an AI interface and score the outputs in a spreadsheet.

### Repository contents

| File / folder | What to include |
| --- | --- |
| `README.md` | Use case, intended users, evaluation method, limitations, and ship/no-ship recommendation |
| `knowledge-base/` | Five short, versioned fictional support policies |
| `eval/test-cases.csv` | Questions, reference answers, source policies, case types, and expected escalation |
| `eval/rubric.md` | Scoring rules for correctness, grounding, completeness, and escalation |
| `prompts/` | The two exact prompt versions used |
| `results/scored-outputs.csv` | Actual outputs, model/version where available, run date, scores, and failure notes |
| `decisions/release-gates.md` | Predefined quality thresholds, critical-failure blockers, and human review requirements |
| `decisions/recommendation.md` | Results by case type, unresolved risks, and the next evaluation step |

**Decision to make:** Should this remain a prototype, enter an agent-assist pilot, or be stopped until specific failures are fixed?

**Definition of done:** Two prompt versions evaluated on the same cases, a failure taxonomy, and a justified release recommendation. Reserve some cases for a final check rather than tuning on every case. A small test set is not proof of production safety.

**Realistic time:** Two weekends, about 12–18 focused hours.

**Data boundary:** Use fictional policies and questions. Do not upload customer conversations, credentials, or confidential company material.

## 4. Self-Serve Onboarding Spec

**Suggested repo:** `self-serve-onboarding-spec`

**One-line description:** Design and specify a short onboarding flow that helps a small-business user publish their first booking page.

**Demonstrates:** Problem framing, scope control, spec-writing, interaction design, usability testing, and engineering handoff.

**Scope:** Prototype one persona's core journey in Figma or another familiar design tool. Limit the flow to five core screens, with empty, error, and recovery states documented alongside them.

### Repository contents

| File / folder | What to include |
| --- | --- |
| `README.md` | User problem, prototype link, scope, and the key product decision |
| `discovery/problem-brief.md` | Target user, job to be done, current workaround, and evidence versus assumptions |
| `specs/PRD.md` | Goals, non-goals, requirements, constraints, risks, and open questions |
| `specs/screen-spec.md` | Screen-by-screen behavior, validation, accessibility notes, and state transitions |
| `specs/acceptance-criteria.md` | Testable Given/When/Then scenarios, including failure and recovery |
| `specs/measurement-plan.md` | Activation definition, time-to-value, events, and guardrail metrics |
| `prototype/` | Exported screen images plus a Markdown link to the clickable prototype |
| `research/usability-notes.md` | Task script, consented anonymized observations, severity, and resulting changes |
| `decisions/scope-cuts.md` | What was removed from the first release and why |

**Decision to make:** What is the minimum flow that gets users to first value without hiding essential setup?

**Definition of done:** A clickable core journey and an implementation-ready spec. Aim for three informal usability sessions if participants are available; otherwise label a self-review as a heuristic review, not user research.

**Realistic time:** One to two weeks, about 10–16 focused hours, plus participant scheduling.

## 5. Competitive Opportunity Brief

**Suggested repo:** `competitive-opportunity-brief`

**One-line description:** Compare three products serving one user job and identify a narrow opportunity worth validating.

**Demonstrates:** Market research, evidence synthesis, positioning, commercial judgment, and validation planning.

**Scope:** Pick a familiar category such as appointment scheduling. Compare three products for one segment—such as solo service providers—against the same workflow. Use current public documentation and hands-on observations where available.

### Repository contents

| File / folder | What to include |
| --- | --- |
| `README.md` | User segment, comparison scope, opportunity hypothesis, and recommendation |
| `research/source-log.md` | Source URLs, access dates, relevant claims, and evidence limitations |
| `research/comparison-matrix.csv` | Comparable workflow steps, pricing context, friction, and supporting sources |
| `research/workflow-teardowns.md` | The same task assessed across all three products |
| `strategy/opportunity-brief.md` | Unmet need, alternatives, differentiation, and reasons not to pursue it |
| `strategy/positioning.md` | Target user, problem, category, benefit, and supporting evidence |
| `validation/interview-guide.md` | Non-leading questions about current behavior and willingness to change |
| `validation/test-plan.md` | A low-cost test, success threshold, stopping rule, and next decision |

**Decision to make:** Which user problem warrants further discovery—and what finding would invalidate the opportunity?

**Definition of done:** One sourced opportunity hypothesis and a realistic validation plan. A missing competitor feature is not automatically customer demand; label inference separately from evidence.

**Realistic time:** One to two weekends, about 8–14 focused hours.

## Reusable README structure for each project

Copy this outline into an individual project repository when you begin:

```markdown
# [Project name]

[One sentence explaining the user problem and project scope.]

> Status: [Planned / In progress / Complete]
> Project type: [Independent case study / Prototype / Real project shared with permission]
> Data: [Synthetic / Public, with source / Consented and anonymized]
> My role: [Your contribution]
> Time spent: [Actual time]

## Problem and decision

[Who has the problem, why it matters, and the decision this work supports.]

## Evidence

[Sources, observations, analysis, and limitations. Link to supporting files.]

## Options and trade-offs

[Alternatives considered, constraints, and why an option was selected.]

## Recommendation

[The decision, rationale, and conditions that would change it.]

## Artifacts

- [Artifact title](relative/path/to/file.md)
- [Prototype or analysis link]

## Outcome and next step

[What actually happened. Separate observed results from expected benefits.]
[Next test, success criterion, or unresolved question.]
```

## Publishing checklist

- Replace personal placeholders with accurate details and retain only skills you can substantiate.
- Keep every case study clearly labeled as independent, synthetic, or real work shared with permission.
- Publish actual artifacts before describing a project as complete.
- Once each repo exists, replace the profile's blueprint link with its repository URL.
- Use these five intended repository names consistently; the profile currently links here to avoid broken links.
- The README callouts are not GitHub's native pinned repositories. Pin completed repositories separately through your profile controls.
- Start with one complete case study. A defensible recommendation is stronger evidence than five empty repositories.
