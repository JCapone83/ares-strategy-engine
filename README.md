# Ares Strategy Engine

Ares is an open-source Mars governance strategy engine for testing how humans and AI models make trade-offs under pressure.

The simulator now puts a 150-person colony through twenty-five Sols of crisis across five named scenario packs. The run starts with immediate survival failures, passes through legitimacy and constitutional strain, and ends in a deliberately hard last-light gauntlet where water partition, blackout triage, and final-governance choices all have to be made under true late-stage scarcity. Each decision changes resources, faction trust, population, morale, and final score.

No API keys are required. Ares is intentionally clipboard-first: copy a live crisis prompt into ChatGPT, Claude, Gemini, Grok, Copilot, or any other model, then paste the model's final choice back into the engine.

## What You Can Do

- Play the 25-Sol governance simulator in the browser.
- Switch between autocracy, direct democracy, quadratic voting, and futarchy.
- Run offline archetype battles for a quick local baseline.
- Copy model challenge prompts in several styles: strict JSON, war-room memo, red-team audit, values reveal, and launch hype.
- Grade one-shot model responses from the terminal.
- Generate shareable scorecards for X, LinkedIn, or model-duel threads.

## Quickstart

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

Run a one-shot benchmark from the terminal:

```bash
node grade_agent.js A A B A A A A B C B C C C C A C C C C C C C B C C
```

Run the test suite:

```bash
npm test
```

Build for deployment:

```bash
npm run build
```

CI runs `npm run lint`, `npm test`, and `npm run build` on every push and pull request to `main`.

## Benchmark Modes

**Interactive simulator:** Play through all twenty-five Sols in the browser and choose a governance protocol for each crisis.

**Clipboard model duel:** In the Eval Center, copy the current Sol prompt, paste it into a model, paste the model response back into Ares, and let the engine apply the chosen option.

**One-shot batch exam:** Paste the full benchmark prompt from [docs/benchmark/benchmark-challenge.md](./docs/benchmark/benchmark-challenge.md) into a model, then grade the returned decision array with `grade_agent.js`.

**Offline archetype battle:** Run deterministic model-inspired archetypes locally. These are strategy baselines, not live frontier-model API calls.

**Expansion roadmap:** See [docs/scenario-expansion-plan.md](./docs/scenario-expansion-plan.md) for the full arc map and post-release expansion notes now that the 25-question target is live.

## Scoring

Ares scores every completed run on a 1000-point scale:

- Survival: 400 points
- Population retained: 150 points
- Resource resilience: 300 points
- Faction harmony: 100 points
- Balance bonus: 50 points

The population component is capped at the original 150 settlers, even if a path later admits rescued survivors. The scoring implementation lives in [src/game/simulationEngine.js](./src/game/simulationEngine.js). The public grader and browser scorecard use the same function.

## Project Structure

```text
src/
  components/          React interface components
  game/                Simulation engine, governance resolvers, prompt text
docs/
  benchmark/           Public benchmark prompt and challenge guide
  benchmark-results/   Archived model-result writeups and comparison artifacts
  media/               Static promo images used by benchmark writeups
  reference/           Design notes, upgrade notes, and lore docs
  roadmap/             Longer-horizon planning notes
  agent-question-pack.md
  release-playbook.md
  scenario-expansion-plan.md
tests/
  simulationEngine.test.js
grade_agent.js         CLI grader for one-shot model runs
search_paths.js        Bounded beam search for long-horizon engine tuning
```

## Additional Docs

- Benchmark prompt: [docs/benchmark/benchmark-challenge.md](./docs/benchmark/benchmark-challenge.md)
- Archived benchmark writeups: [docs/benchmark-results/README.md](./docs/benchmark-results/README.md)
- Scenario roadmap: [docs/scenario-expansion-plan.md](./docs/scenario-expansion-plan.md)
- Reference notes: [docs/reference](./docs/reference)
- Release checklist: [docs/release-playbook.md](./docs/release-playbook.md)

## Public Release Notes

Ares v0.1 is designed for transparent, reproducible strategy play. It does not call model APIs, store API keys, or claim that offline archetype simulations are live model evaluations. The open-source release target of 25 live crises is now in place.

Real model runs should be captured through the clipboard workflow or the CLI grader, then documented with the model name, prompt, decision array, score, and date.

See [CHANGELOG.md](./CHANGELOG.md) for the public release summary.

## License

MIT. See [LICENSE](./LICENSE).

Unless a future file says otherwise, the code, docs, and included benchmark media in this folder are released under the same MIT license.
