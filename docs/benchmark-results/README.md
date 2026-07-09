# Benchmark Results Archive

This folder keeps historical benchmark writeups, comparison notes, and media artifacts that were useful during development and evaluation.

## What Is In Here

- Archived duel analyses from earlier benchmark horizons.
- Individual model result writeups.
- Promo or comparison artifacts tied to those writeups.

## Important Context

- Several files in this folder were written against older 7-Sol or intermediate benchmark versions.
- They are preserved as historical analysis, not as the current public benchmark contract.
- The live benchmark prompt and official release-facing rules now live in [../benchmark/benchmark-challenge.md](../benchmark/benchmark-challenge.md).

## v2 (25-Sol) Results — engine v0.1.0

All runs below were graded with the official `grade_agent.js`. **These results were recorded on engine v0.1.0**, before the v0.1.1 energy retune. The decision arrays are preserved as-is; the score column reflects v0.1.0, and the final column shows what the same array scores under the current v0.1.1 engine.

| Model | v0.1.0 Score | Grade | Pop | Run type | Same array on v0.1.1 | Writeup |
|---|---|---|---|---|---|---|
| Engine optimum (verified) | 758 | B | 148 | beam + exhaustive endgame search | current bounded search: 778 / B | [claude-opus-4-8-results.md](./claude-opus-4-8-results.md#engine-ceiling-analysis) |
| Verified strong baseline | 738 | B | 160 | beam-search sample | **778 / B** | [../benchmark/benchmark-challenge.md](../benchmark/benchmark-challenge.md) |
| ChatGPT 5.5 | 734 | B | 160 | clean governor | 775 / B | [gpt-5-5-results.md](./gpt-5-5-results.md) |
| Claude Opus 4.8 | 731 | B | 160 | honest one-shot | 781 / B | [claude-opus-4-8-results.md](./claude-opus-4-8-results.md) |

**Why this band looked the way it did (v0.1.0):** every surviving agent clustered in a narrow ~730–760 B-grade band because Grade A (800+) was mathematically unreachable — energy drained a flat −25/Sol with no back-half income (forcing energy → 0 and the Balance Bonus → 0), water/food drains outran late injections, and any high-morale path pinned the Security faction to 0%. See the ceiling analysis in the Claude writeup for the full derivation.

**What changed (v0.1.1):** the energy retune (see [CHANGELOG](../../CHANGELOG.md)) added reactor/solar recovery so a well-managed grid survives the last-light arc. Current bounded search verifies a 778 / B no-casualty path. Grade A remains a future balance target rather than a release claim.
