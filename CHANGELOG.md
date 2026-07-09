# Changelog

## v0.1.1 - 2026-07-09

- **Energy economy retune so the late game is no longer a forced grid collapse.** Added a per-Sol reactor/solar recovery term (`ENERGY_REGEN`, mirroring the oxygen scrubber regen) so a well-managed grid can survive the last-light arc instead of energy being a structural zero. Under v0.1.0 the entire field of surviving runs was compressed into a ~730-760 B-grade band.
- Softened the per-Sol water and food consumption divisors (`WATER_DRAIN_DIV`, `FOOD_DRAIN_DIV`) so back-half resource management is winnable with skill rather than hopeless.
- Current bounded search verifies a 778 / Grade B no-casualty path with full Sol 25 survival, energy preserved, and the full 150-colonist scoring population retained. Grade A remains a future balance target rather than a release claim.
- Verified there is no population-culling exploit: because the Balance Bonus stays gated (water and food cannot reach their thresholds at Sol 25), sacrificing colonists is never net-positive for score, so the optimal path keeps everyone alive.
- Drain/regen values are now exported constants at the top of `simulationEngine.js` for transparent future tuning. Updated the engine test suite to the new canonical baseline (778 / B) and accolade set.

## v0.1.0 - 2026-05-30

- Expanded Ares from the original short benchmark into a full 25-crisis public release across five named scenario packs.
- Added a shared `TOTAL_SOLS` runtime contract so the simulator, CLI grader, tests, and UI all follow the same live horizon.
- Replaced the old exhaustive search helper with bounded beam search for long-horizon benchmark exploration.
- Updated the public benchmark challenge, README, roadmap, and archived benchmark docs to match the new project structure.
- Cleaned the project root by moving benchmark artifacts, reference notes, roadmap files, and media into organized `docs/` subdirectories.
- Added GitHub release metadata and CI for lint, test, and build checks.
- Confirmed the public package with passing tests, lint, build, and CLI grading runs.
