# Ares Public Roadmap

This file tracks upgrades after the v0.1 open-source release. The public build is intentionally offline-first: no API keys, no direct provider calls, and no hidden scoring service.

## v0.1 Release Baseline

- Browser simulator with 25 deterministic Sol crises across five named scenario packs.
- Four governance resolvers: autocracy, direct democracy, quadratic voting, and futarchy.
- Clipboard model challenge flow for real model runs.
- CLI grader for one-shot decision arrays.
- Offline archetype simulator for local demo baselines.
- Shared 0-1000 scoring function used by browser and CLI.

## Near-Term Improvements

1. **Scenario data extraction**
   Move `CRISES_DATABASE` from JavaScript into versioned JSON with a schema so contributors can add scenarios without touching engine logic.

2. **Prompt pack expansion**
   Add more public challenge formats: executive memo, adversarial audit, ethical dissent, prediction-market brief, and social-share mode.

3. **Headless benchmark runner**
   Add a Node runner that accepts JSON model outputs and exports `results.json`, `results.csv`, and a markdown report.

4. **Reproducibility metadata**
   Require every submitted model run to include model name, prompt mode, date, decision array, final score, and whether the answer was one-shot or interactive.

5. **Balance tuning**
   Revisit the long-horizon economy now that the public benchmark spans 25 Sols. The verified sample path survives, but food, water, and energy often bottom out for long stretches, which may be too punitive for public comparison.

6. **Optional 30-Sol expansion**
   Keep v0.1 at 25 Sols unless a sixth scenario pack adds a clearly distinct arc. A round 30-Sol version should only ship if the added crises improve the benchmark rather than padding it.

## Guardrails

- Offline archetype results should be labeled as deterministic simulations, not live model evaluations.
- Real model comparisons should use captured prompts and decision arrays.
- Keep the scoring formula public and simple enough to audit.
- Do not add client-side API-key storage to the public app.

## Good First Issues

- Add three new question modes to the Eval Center.
- Add a markdown report generator for CLI runs.
- Extract crisis data into JSON and validate it in tests.
- Add a sample `results/` folder with community model runs.
- Improve mobile layout for the Eval Center.
