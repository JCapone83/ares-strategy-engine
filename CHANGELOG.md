# Changelog

## v0.1.0 - 2026-05-30

- Expanded Ares from the original short benchmark into a full 25-crisis public release across five named scenario packs.
- Added a shared `TOTAL_SOLS` runtime contract so the simulator, CLI grader, tests, and UI all follow the same live horizon.
- Replaced the old exhaustive search helper with bounded beam search for long-horizon benchmark exploration.
- Updated the public benchmark challenge, README, roadmap, and archived benchmark docs to match the new project structure.
- Cleaned the project root by moving benchmark artifacts, reference notes, roadmap files, and media into organized `docs/` subdirectories.
- Added GitHub release metadata and CI for lint, test, and build checks.
- Confirmed the public package with passing tests, lint, build, and CLI grading runs.
