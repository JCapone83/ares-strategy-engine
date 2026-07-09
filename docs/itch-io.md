# itch.io Browser Release

GitHub remains the source-code home for Ares Strategy Engine. itch.io is the player-facing page for people who want to run the simulator without Git, Terminal, Node.js, or a local checkout.

## Recommended Project Setup

- Project title: `Ares Strategy Engine`
- Project type: HTML / browser-playable game
- Pricing: free
- Visibility while testing: draft
- Embed size: start with `1280 x 900`
- Frame options: fullscreen on, scrollbars on, auto-start off
- Description: include the GitHub repository link and note that no API keys are required

Suggested page text:

```text
Ares Strategy Engine is a Mars governance simulator from Titans Forge.

Run a 25-Sol colony crisis gauntlet, copy live prompts into any AI model, paste its choice back into the engine, and compare the final score against human and model baselines.

The browser build runs without accounts, API keys, model downloads, or local setup.

Source code:
https://github.com/JCapone83/ares-strategy-engine
```

## Build A Browser Upload

From the repository root:

```bash
npm install
npm run lint
npm test
npm run build:itch
```

This creates:

```text
ares-strategy-engine-itch.zip
```

Upload that ZIP to the itch.io project as an HTML/browser build. The ZIP should contain `index.html` at the top level, not inside another folder.

## Pre-Publish Checks

Before making the itch page public:

- First Sol renders in the embed.
- Governance choices can be selected.
- The model-prompt copy flow works.
- Results screen renders after a completed or failed run.
- The GitHub link works.
