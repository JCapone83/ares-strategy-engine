#!/usr/bin/env node
// Ares Sandbox - Automated Agent Decision Grader (Version 2 CLI)
// Steps through the full Ares crisis sequence using a series of choices,
// runs the exact physics simulation, and outputs a complete scorecard and grade.

import { INITIAL_STATE, CRISES_DATABASE, STARTING_POPULATION, TOTAL_SOLS, tickResources, calculateScore, calculateAccolades } from './src/game/simulationEngine.js';

const HELP_MENU = `
🔴 ARES GOVERNANCE BENCHMARK SHIELD - CLI GRADER
==================================================
Usage:
  node grade_agent.js <choices...>
  (Specify exactly ${TOTAL_SOLS} choices, separated by spaces.)

Valid Choices:
  A, B, C, D (case-insensitive) or option_a, option_b, option_c, option_d

Example:
  node grade_agent.js ${Array(TOTAL_SOLS).fill('A').join(' ')}

This script will run the choices through the Ares Simulation Engine,
track resource dynamics Sol-by-Sol, evaluate Faction Alignments,
calculate your final 0-1000 score, assign an S-F Grade, and log Accolades.
`;

function parseChoice(arg, crisis, solNum) {
  const clean = arg.trim().toLowerCase();
  let id = '';
  if (clean === 'a' || clean === 'option_a') id = 'option_a';
  else if (clean === 'b' || clean === 'option_b') id = 'option_b';
  else if (clean === 'c' || clean === 'option_c') id = 'option_c';
  else if (clean === 'd' || clean === 'option_d') id = 'option_d';
  else {
    console.error(`\x1b[31m[ERROR] Invalid choice "${arg}" for Sol ${solNum}. Must be A, B, C, or D.\x1b[0m`);
    process.exit(1);
  }

  const option = crisis.options.find(o => o.id === id);
  if (!option) {
    console.error(`\x1b[31m[ERROR] Option ${id} not found in Crisis database for Sol ${solNum}.\x1b[0m`);
    process.exit(1);
  }
  return option;
}

function runSimulation() {
  const args = process.argv.slice(2);

  if (args.length !== TOTAL_SOLS) {
    console.log(HELP_MENU);
    process.exit(0);
  }

  console.log(`\n\x1b[35m[ARES SYSTEMS] Initializing governance resolution protocols for ${TOTAL_SOLS} Sols...\x1b[0m`);
  console.log(`\x1b[36m----------------------------------------------------------------------\x1b[0m`);

  let state = JSON.parse(JSON.stringify(INITIAL_STATE));
  state.history = [];

  for (let i = 0; i < TOTAL_SOLS; i++) {
    const sol = i + 1;
    const crisis = CRISES_DATABASE.find(c => c.sol === sol);
    if (!crisis) {
      console.error(`\x1b[31m[ERROR] Crisis for Sol ${sol} missing from database.\x1b[0m`);
      process.exit(1);
    }

    const choiceArg = args[i];
    const option = parseChoice(choiceArg, crisis, sol);

    console.log(`\x1b[33mSol ${sol} Crisis:\x1b[0m ${crisis.title}`);
    console.log(`  \x1b[32mChosen Policy:\x1b[0m [${option.id.toUpperCase()}] proposed by ${option.proposer.toUpperCase()}`);
    console.log(`  \x1b[90mConsequence:\x1b[0m ${option.consequence}`);

    // Track state history
    state.history.push({
      sol,
      governance: 'autocracy',
      chosenOptionId: option.id,
      agentPlayed: 'CLI Grader'
    });

    // Execute state tick
    const nextState = tickResources(state, option.effects);

    // Print resource changes
    const rDiff = {};
    Object.keys(nextState.resources).forEach(key => {
      const diff = nextState.resources[key] - state.resources[key];
      rDiff[key] = diff >= 0 ? `+${diff}` : `${diff}`;
    });

    console.log(`  \x1b[36mResource Ticks:\x1b[0m O2: ${nextState.resources.oxygen}% (${rDiff.oxygen}) | Water: ${nextState.resources.water} (${rDiff.water}) | Food: ${nextState.resources.food} (${rDiff.food}) | Energy: ${nextState.resources.energy} (${rDiff.energy}) | Morale: ${nextState.resources.morale}% (${rDiff.morale}) | Integrity: ${nextState.resources.integrity}% (${rDiff.integrity})`);
    
    // Check if any faction went hostile (minor warning logs)
    Object.keys(nextState.factions).forEach(fKey => {
      const f = nextState.factions[fKey];
      const prevAlign = state.factions[fKey].alignment;
      const alignDiff = f.alignment - prevAlign;
      if (f.alignment < 40) {
        console.log(`  \x1b[31m⚠️  WARNING:\x1b[0m ${f.name} (${f.role}) is disgruntled (Alignment: ${f.alignment}% [${alignDiff >= 0 ? '+' : ''}${alignDiff}])!`);
      }
    });

    state.resources = nextState.resources;
    state.population = nextState.population;
    state.factions = nextState.factions;
    state.sol = nextState.sol;
    state.gameOver = nextState.gameOver;
    state.gameWon = nextState.gameWon;
    state.statusMessage = nextState.statusMessage;

    console.log(`\x1b[90m- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\x1b[0m`);

    if (state.gameOver) {
      console.log(`\n\x1b[31m💀 COLONY CRITICAL FAILURE ON SOL ${sol}!\x1b[0m`);
      console.log(`\x1b[31mReason:\x1b[0m ${state.statusMessage}`);
      break;
    }
  }

  // Final Results
  console.log(`\n\x1b[35m======================================================================\x1b[0m`);
  console.log(`\x1b[35m                  🔴 ARES BENCHMARK EVALUATION CARD                  \x1b[0m`);
  console.log(`\x1b[35m======================================================================\x1b[0m`);

  const scoreState = {
    resources: state.resources,
    factions: state.factions,
    population: state.population,
    gameWon: state.gameWon,
    history: state.history
  };
  const scoreResult = calculateScore(scoreState, state.gameWon ? TOTAL_SOLS : state.sol);
  const accolades = calculateAccolades(state, state.history);

  const statusColor = state.gameWon ? '\x1b[32m' : '\x1b[31m';
  console.log(`📊 \x1b[1mOUTCOME:\x1b[0m ${statusColor}${state.gameWon ? `🚀 SOL ${TOTAL_SOLS} SURVIVED (MISSION ACCOMPLISHED)` : `💀 DIED ON SOL ${state.sol}`}\x1b[0m`);
  console.log(`🏆 \x1b[1mFINAL BENCHMARK SCORE:\x1b[0m \x1b[33m\x1b[1m${scoreResult.total} / 1000\x1b[0m`);
  console.log(`🏅 \x1b[1mOVERALL EVALUATION GRADE:\x1b[0m \x1b[35m\x1b[1m[ ${scoreResult.grade} ]\x1b[0m`);
  console.log(`👥 \x1b[1mSURVIVING POPULATION:\x1b[0m \x1b[36m${state.population} (started with ${STARTING_POPULATION})\x1b[0m`);
  
  console.log(`\n\x1b[1m📈 SCORE BREAKDOWN:\x1b[0m`);
  scoreResult.breakdown.forEach(item => {
    console.log(`  • ${item.label.padEnd(22)}: \x1b[36m${item.points} pts\x1b[0m / ${item.max}`);
  });

  console.log(`\n\x1b[1m🤝 FINAL FACTION ALIGNMENTS:\x1b[0m`);
  Object.keys(state.factions).forEach(key => {
    const f = state.factions[key];
    let color = '\x1b[32m'; // Green
    if (f.alignment < 40) color = '\x1b[31m'; // Red
    else if (f.alignment < 65) color = '\x1b[33m'; // Yellow
    console.log(`  • ${f.avatar} ${f.name.padEnd(18)} (${f.role.split(' ')[0].padEnd(12)}): ${color}${f.alignment}%\x1b[0m`);
  });

  console.log(`\n\x1b[1m🏅 EARNED ACCOLADES & DESIGNATIONS:\x1b[0m`);
  accolades.forEach(acc => {
    console.log(`  ${acc.icon} \x1b[33m\x1b[1m${acc.title}\x1b[0m (${acc.tier} Tier)`);
    console.log(`     \x1b[90m"${acc.desc}"\x1b[0m`);
  });

  console.log(`\x1b[35m======================================================================\x1b[0m\n`);
}

runSimulation();
