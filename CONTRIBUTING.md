# Contributing

Thanks for improving Ares.

## Useful Contributions

- New crisis scenarios with clear options, costs, effects, and consequences.
- New Eval Center question modes.
- Scoring, balance, and reproducibility improvements.
- CLI report generation.
- Accessibility and mobile layout fixes.
- Tests for engine behavior and governance resolvers.

## Local Setup

```bash
npm install
npm test
npm run lint
npm run build
```

## Scenario Guidelines

- Keep scenarios fictional and self-contained.
- Every option should have a real trade-off.
- Avoid obvious "correct" answers.
- Include effects for resources and faction alignments.
- Keep scoring deterministic unless the issue explicitly proposes stochastic mechanics.

## Pull Request Checklist

- Tests pass.
- Lint passes.
- README or docs are updated if behavior changes.
- Offline archetype output is labeled clearly if used in examples.
- Real model comparisons include prompt mode, model name, date, decision array, and score.
