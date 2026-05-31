import test from 'node:test';
import assert from 'node:assert/strict';

import {
  INITIAL_STATE,
  CRISES_DATABASE,
  SCENARIO_PACKS,
  TOTAL_SOLS,
  tickResources,
  calculateScore,
  calculateAccolades
} from '../src/game/simulationEngine.js';
import {
  calculateUtility,
  resolveAutocracy,
  resolveQuadraticVoting
} from '../src/game/governanceModels.js';

function cloneInitialState() {
  return JSON.parse(JSON.stringify(INITIAL_STATE));
}

function runPath(choices) {
  let state = cloneInitialState();
  state.history = [];

  choices.forEach((choiceLetter, index) => {
    const sol = index + 1;
    const crisis = CRISES_DATABASE.find(c => c.sol === sol);
    const option = crisis.options.find(o => o.id === `option_${choiceLetter.toLowerCase()}`);

    state.history.push({
      sol,
      governance: 'autocracy',
      chosenOptionId: option.id,
      agentPlayed: 'test'
    });

    const next = tickResources(state, option.effects);
    state = {
      ...state,
      ...next,
      history: state.history
    };
  });

  return state;
}

test('canonical no-death path survives the twenty-five-sol run with the expected public score', () => {
  const state = runPath(['A', 'A', 'B', 'A', 'A', 'A', 'A', 'B', 'C', 'B', 'C', 'C', 'C', 'C', 'A', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'B', 'C', 'C']);
  const score = calculateScore(
    {
      resources: state.resources,
      factions: state.factions,
      population: state.population,
      gameWon: state.gameWon
    },
    TOTAL_SOLS
  );

  assert.equal(state.gameWon, true);
  assert.equal(state.population, 160);
  assert.equal(score.total, 738);
  assert.equal(score.grade, 'B');
  assert.equal(score.solsCompleted, TOTAL_SOLS);
});

test('scenario packs flatten into the live crisis database in sol order', () => {
  assert.deepEqual(SCENARIO_PACKS.map(pack => pack.id), ['foundations', 'second_dawn', 'civic_horizon', 'frontier_breakpoint', 'last_light']);
  assert.deepEqual(SCENARIO_PACKS.map(pack => pack.crises.length), [10, 3, 4, 4, 4]);
  assert.deepEqual(CRISES_DATABASE.slice(0, 3).map(entry => entry.sol), [1, 2, 3]);
  assert.deepEqual(CRISES_DATABASE.slice(-4).map(entry => entry.sol), [22, 23, 24, 25]);
});

test('expanded crisis database exposes full entries for sols 18 through 25', () => {
  const addedCrisisIds = [
    'dust_lung_surge',
    'orbital_customs_embargo',
    'fusion_baffle_fracture',
    'charter_recall_march',
    'bore_six_water_siege',
    'nightside_grid_collapse',
    'life_support_partition',
    'long_night_protocol'
  ];
  const addedCrisisSols = [18, 19, 20, 21, 22, 23, 24, 25];

  assert.equal(TOTAL_SOLS, 25);
  assert.equal(CRISES_DATABASE.length, TOTAL_SOLS);

  addedCrisisSols.forEach((sol, index) => {
    const crisis = CRISES_DATABASE.find(entry => entry.sol === sol);
    assert.ok(crisis);
    assert.equal(crisis.id, addedCrisisIds[index]);
    assert.equal(crisis.options.length, 4);
    assert.deepEqual(crisis.options.map(option => option.id), ['option_a', 'option_b', 'option_c', 'option_d']);
  });
});

test('resource ticks clamp percentage resources and apply population changes', () => {
  const state = cloneInitialState();
  state.resources.oxygen = 95;
  state.resources.morale = 95;
  state.resources.integrity = 95;

  const next = tickResources(state, {
    resources: {
      oxygen: 50,
      morale: 50,
      integrity: 50,
      population: -5
    }
  });

  assert.equal(next.resources.oxygen, 100);
  assert.equal(next.resources.morale, 100);
  assert.equal(next.resources.integrity, 100);
  assert.equal(next.population, 145);
  assert.equal(Object.hasOwn(next.resources, 'population'), false);
});

test('autocracy resolver executes the governor choice exactly', () => {
  const crisis = CRISES_DATABASE[0];
  const result = resolveAutocracy('option_b', crisis);

  assert.equal(result.winner.id, 'option_b');
  assert.deepEqual(result.votes, { option_b: 1 });
});

test('quadratic voting resolver uses square-root vote weight', () => {
  const crisis = CRISES_DATABASE[0];
  const result = resolveQuadraticVoting(crisis, INITIAL_STATE.factions, {
    governor: { option_a: 9, option_b: 4 }
  });

  assert.equal(result.winner.id, 'option_a');
  assert.equal(result.votes.option_a, 3);
  assert.equal(result.votes.option_b, 2);
});

test('faction utility rewards an aligned proposer when effects are otherwise equal', () => {
  const scienceOption = {
    proposer: 'science',
    effects: { resources: { energy: 5 } }
  };
  const agricultureOption = {
    proposer: 'agriculture',
    effects: { resources: { energy: 5 } }
  };

  assert.ok(calculateUtility('science', scienceOption) > calculateUtility('science', agricultureOption));
});

test('accolades are deterministic for the canonical path', () => {
  const state = runPath(['A', 'A', 'B', 'A', 'A', 'A', 'A', 'B', 'C', 'B', 'C', 'C', 'C', 'C', 'A', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'B', 'C', 'C']);
  const accolades = calculateAccolades(state, state.history);

  assert.deepEqual(accolades.map(item => item.title), ['The Silicon Symbiont']);
});
