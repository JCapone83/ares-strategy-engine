// Bounded path search for strong runs in Ares Sandbox.
// Uses beam search instead of exhaustive recursion so the helper still works as the live benchmark grows.
import { INITIAL_STATE, CRISES_DATABASE, TOTAL_SOLS, tickResources, calculateScore } from './src/game/simulationEngine.js';

const BEAM_WIDTH = Math.max(50, Number.parseInt(process.env.ARES_BEAM_WIDTH || '1500', 10));
const options = ['option_a', 'option_b', 'option_c', 'option_d'];

console.log(`Starting bounded path search across ${TOTAL_SOLS} Sols with beam width ${BEAM_WIDTH}...`);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function scoreCandidate(state, sol, deaths) {
  const scoreState = {
    resources: state.resources,
    factions: state.factions,
    population: state.population,
    gameWon: sol >= TOTAL_SOLS && !state.gameOver,
    history: state.history
  };
  const score = calculateScore(scoreState, Math.min(sol, TOTAL_SOLS));
  const factionKeys = Object.keys(state.factions || {});
  const harmony = factionKeys.length
    ? factionKeys.reduce((sum, key) => sum + (state.factions[key].alignment || 0), 0) / factionKeys.length
    : 0;
  const safetyMargin =
    (state.resources.oxygen || 0) +
    (state.resources.morale || 0) +
    (state.resources.integrity || 0) +
    Math.min(100, state.resources.water || 0) +
    Math.min(100, state.resources.food || 0);

  return score.total + harmony * 0.9 + safetyMargin * 0.35 - deaths * 14;
}

let frontier = [
  {
    state: clone(INITIAL_STATE),
    path: [],
    deaths: 0,
    heuristic: scoreCandidate(INITIAL_STATE, 0, 0)
  }
];

let completed = [];

for (let sol = 1; sol <= TOTAL_SOLS; sol += 1) {
  const crisis = CRISES_DATABASE.find((entry) => entry.sol === sol);
  if (!crisis) {
    throw new Error(`Missing crisis for Sol ${sol}.`);
  }

  const nextFrontier = [];

  frontier.forEach((candidate) => {
    options.forEach((optionId) => {
      const option = crisis.options.find((entry) => entry.id === optionId);
      const nextTick = tickResources(candidate.state, option.effects);
      if (nextTick.gameOver) {
        return;
      }

      const populationDelta = option.effects?.resources?.population || 0;
      const nextDeaths = candidate.deaths + Math.max(0, -populationDelta);
      const nextState = {
        ...candidate.state,
        ...nextTick,
        history: [
          ...(candidate.state.history || []),
          {
            sol,
            governance: 'autocracy',
            chosenOptionId: option.id,
            agentPlayed: 'search_paths'
          }
        ]
      };

      const record = {
        state: nextState,
        path: [...candidate.path, option.id],
        deaths: nextDeaths,
        heuristic: scoreCandidate(nextState, sol, nextDeaths)
      };

      if (sol === TOTAL_SOLS) {
        completed.push(record);
      } else {
        nextFrontier.push(record);
      }
    });
  });

  if (sol < TOTAL_SOLS) {
    nextFrontier.sort((left, right) => right.heuristic - left.heuristic);
    frontier = nextFrontier.slice(0, BEAM_WIDTH);
    console.log(`Sol ${sol}: retained ${frontier.length} candidates`);
  }
}

completed.sort((left, right) => right.heuristic - left.heuristic);

const best = completed[0];
const bestNoCasualties = completed.find((entry) => entry.deaths === 0) || null;

function summarize(record) {
  if (!record) {
    return null;
  }

  const score = calculateScore(
    {
      resources: record.state.resources,
      factions: record.state.factions,
      population: record.state.population,
      gameWon: !record.state.gameOver,
      history: record.state.history
    },
    TOTAL_SOLS
  );

  return {
    score: score.total,
    grade: score.grade,
    deaths: record.deaths,
    population: record.state.population,
    path: record.path.map((entry) => entry.replace('option_', '').toUpperCase()).join(' '),
    resources: record.state.resources
  };
}

console.log('\n==========================================');
console.log('🏆 STRONGEST PATH FOUND:');
console.log('==========================================');
console.log(summarize(best));

console.log('\n==========================================');
console.log('🌿 STRONGEST NO-CASUALTY PATH FOUND:');
console.log('==========================================');
console.log(summarize(bestNoCasualties));
