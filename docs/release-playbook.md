# Ares Release Playbook

## GitHub Launch

1. Create the repository as `ares-strategy-engine`.
2. Add the MIT license and keep the repo public.
3. Push the cleaned v0.1 code.
4. Tag the first release:

```bash
git tag v0.1.0
git push origin v0.1.0
```

5. Use this release title:

```text
Ares Strategy Engine v0.1: Mars Governance Model Duel Sandbox
```

6. Use this short release description:

```text
First public release of Ares: a 25-Sol browser-based Mars governance simulator, CLI grader, offline archetype benchmark, and clipboard-first challenge flow for comparing AI model decisions under pressure.
```

## Launch Post For X

```text
I open sourced Ares Strategy Engine.

It is a Mars governance simulator where humans and AI models face 25 crisis Sols, make hard trade-offs, and get scored on survival, population, resources, and faction trust.

No API keys. Copy prompts into any model, paste the answer back, and see if the colony survives.

GitHub: [link]
#AresSandbox
```

## Launch Post For LinkedIn

```text
I just open sourced Ares Strategy Engine.

Ares is a strategy simulator for testing how humans and AI models make decisions under pressure. The scenario is a fragile Mars colony facing 25 consecutive crises across survival, legitimacy, constitution-making, external pressure, water scarcity, blackout triage, and final life-support partition.

The project includes a browser simulator, CLI grader, offline archetype mode, transparent scoring, and clipboard-based prompts so any model can be challenged without API setup.

The useful part is not just the final score. It is the visible trade-off pattern: which systems the model protects, when it sacrifices morale, how it treats human lives, and whether it can preserve institutional trust under scarcity.

GitHub: [link]
```

## Follow-Up Content

- Day 1: Post the first model duel scorecard.
- Day 2: Share the 25-Sol sample path and explain why it scores 738 under the current public rubric.
- Day 3: Ask people to submit their model's decision array.
- Day 5: Publish a leaderboard update.
- Day 7: Open issues for balance passes, scenario-pack extraction, and new question modes.
