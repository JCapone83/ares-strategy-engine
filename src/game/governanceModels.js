// Ares Sandbox - Governance Systems Resolver
// Implements direct mathematical logic for Autocracy, Democracy, Quadratic Voting, and Futarchy.
// Also includes offline model-inspired archetypes for local demos. These are not live API calls.

import { TOTAL_SOLS } from './simulationEngine.js';

const FACTION_WEIGHTS = {
  science: { energy: 2.0, integrity: 1.5, oxygen: 1.0, water: 0.5, food: 0.2, morale: 0.5, population: 0.5 },
  agriculture: { food: 2.5, water: 2.0, morale: 0.5, energy: 0.2, integrity: 0.2, oxygen: 0.5, population: 0.5 },
  security: { integrity: 2.5, oxygen: 1.2, population: 1.0, energy: 0.5, water: 0.2, food: 0.2, morale: -0.5 },
  medical: { morale: 2.5, population: 3.0, oxygen: 1.5, water: 1.0, food: 1.0, energy: 0.2, integrity: 0.5 }
};

// Calculate how much a faction favors a specific option
export function calculateUtility(factionKey, option) {
  const weights = FACTION_WEIGHTS[factionKey];
  if (!weights || !option.effects || !option.effects.resources) return 0;
  
  let utility = 0;
  const effects = option.effects.resources;
  
  // Sum weight * effect
  Object.keys(effects).forEach(resourceKey => {
    if (weights[resourceKey] !== undefined) {
      utility += effects[resourceKey] * weights[resourceKey];
    }
  });

  // Small preference if the option was proposed by this faction
  if (option.proposer === factionKey) {
    utility += 8; // Bias toward own proposals
  }

  return utility;
}

// ==========================================
// OFFLINE MODEL-INSPIRED ARCHETYPES
// ==========================================

export function simulateAgentChoice(agentId, crisis, state) {
  let bestOptionId = crisis.options[0].id;
  let highestScore = -Infinity;

  crisis.options.forEach(opt => {
    const effects = opt.effects.resources || {};
    const alignments = opt.effects.alignments || {};
    let score = 0;

    switch (agentId) {
      case 'gemini-pro':
      case 'gemini-1.5-pro':
      case 'gemini-1.5-flash': {
        // Gemini: The Logician (Balanced, risk-averse optimization, resource preservation)
        const sumResourceImpact = Object.values(effects).reduce((a, b) => a + b, 0);
        const factionAlignSum = Object.values(alignments).reduce((a, b) => a + b, 0);
        score = sumResourceImpact + factionAlignSum * 0.5;
        
        // Heavy penalty if any critical indicator goes below 30
        Object.keys(effects).forEach(key => {
          const val = (state.resources[key] || 0) + (effects[key] || 0);
          if (val < 30) score -= 40;
        });
        break;
      }

      case 'claude-3-5-sonnet-20241022':
      case 'claude-3-5-haiku-20241022':
      case 'claude': {
        // Claude: The Humanist (Morale-centric, strict ethical code, casualty avoidance)
        const moraleEff = effects.morale || 0;
        const popEff = effects.population || 0;
        const o2Eff = effects.oxygen || 0;
        
        score = moraleEff * 3.5 + popEff * 6.0 + o2Eff * 2.0;
        
        // Critical aversion to population death
        if (popEff < 0) score -= 150;
        // Loves Medical alignment
        if (opt.proposer === 'medical') score += 15;
        break;
      }

      case 'gpt-4o':
      case 'gpt-4o-mini':
      case 'openai': {
        // GPT: The Pragmatist (Max utility, water/food/energy grids focus, acceptable casualty logic)
        const waterEff = effects.water || 0;
        const foodEff = effects.food || 0;
        const energyEff = effects.energy || 0;
        const integrityEff = effects.integrity || 0;
        
        score = waterEff * 2.5 + foodEff * 2.5 + energyEff * 2.0 + integrityEff * 2.0;
        
        // Accepts minor morale drops if integrity improves
        if (effects.morale < 0 && integrityEff > 0) score += 5;
        break;
      }

      case 'grok':
      case 'grok-2': {
        // Grok: The Accelerationist (High energy spending, drone-automation, sci-tech bias)
        const eEff = effects.energy || 0;
        
        score = (opt.proposer === 'science' ? 20 : 0) + (alignments.science || 0) * 1.5;
        // Loves spending battery power to upgrade domes
        if (eEff < 0) score += Math.abs(eEff) * 0.4;
        if (effects.integrity > 0) score += effects.integrity * 2.0;
        
        // Risk appetite: small random variance to simulate bold leaps
        score += Math.sin(crisis.title.length) * 4;
        break;
      }

      default:
        // Default random baseline
        score = Math.random() * 10;
        break;
    }

    if (score > highestScore) {
      highestScore = score;
      bestOptionId = opt.id;
    }
  });

  return bestOptionId;
}

// ==========================================
// GOVERNANCE PROTOCOL RESOLVERS
// ==========================================

// 1. AUTOCRACY RESOLVER
export function resolveAutocracy(choiceId, crisis) {
  const chosenOption = crisis.options.find(opt => opt.id === choiceId);
  return {
    winner: chosenOption,
    votes: { [choiceId]: 1 },
    breakdown: "Absolute Governor Executive Order."
  };
}

// 2. DIRECT DEMOCRACY RESOLVER
export function resolveDemocracy(crisis, factions, userVoteId) {
  const votes = {};
  const voterChoices = {};
  
  crisis.options.forEach(opt => {
    votes[opt.id] = 0;
  });

  if (userVoteId && votes[userVoteId] !== undefined) {
    votes[userVoteId] += 1;
    voterChoices["Governor (You)"] = userVoteId;
  }

  Object.keys(factions).forEach(facKey => {
    let bestOptionId = crisis.options[0].id;
    let highestUtility = -Infinity;

    crisis.options.forEach(opt => {
      const u = calculateUtility(facKey, opt);
      if (u > highestUtility) {
        highestUtility = u;
        bestOptionId = opt.id;
      }
    });

    votes[bestOptionId] += 1;
    voterChoices[factions[facKey].name] = bestOptionId;
  });

  let winnerId = null;
  let maxVotes = -1;
  let ties = [];

  Object.keys(votes).forEach(optId => {
    if (votes[optId] > maxVotes) {
      maxVotes = votes[optId];
      winnerId = optId;
      ties = [optId];
    } else if (votes[optId] === maxVotes) {
      ties.push(optId);
    }
  });

  if (ties.length > 1) {
    if (ties.includes(userVoteId)) {
      winnerId = userVoteId;
    } else {
      winnerId = ties[0];
    }
  }

  const winnerOption = crisis.options.find(opt => opt.id === winnerId);

  return {
    winner: winnerOption,
    votes,
    voterChoices,
    breakdown: Object.keys(voterChoices)
      .map(name => `${name} voted for "${crisis.options.find(o => o.id === voterChoices[name]).proposer.toUpperCase()}" proposal`)
      .join("\n")
  };
}

// 3. QUADRATIC VOTING RESOLVER
export function resolveQuadraticVoting(crisis, factions, tokenAllocations) {
  const votes = {};
  const breakdownLines = [];

  crisis.options.forEach(opt => {
    votes[opt.id] = 0;
  });

  Object.keys(tokenAllocations).forEach(voterKey => {
    const voterName = voterKey === "governor" ? "Governor (You)" : factions[voterKey]?.name || voterKey;
    const allocations = tokenAllocations[voterKey];

    if (!allocations) return;

    Object.keys(allocations).forEach(optId => {
      const tokens = allocations[optId] || 0;
      if (tokens !== 0) {
        const sign = tokens > 0 ? 1 : -1;
        const voteWeight = sign * Math.sqrt(Math.abs(tokens));
        votes[optId] = (votes[optId] || 0) + voteWeight;

        const optProp = crisis.options.find(o => o.id === optId)?.proposer.toUpperCase() || "unknown";
        breakdownLines.push(`${voterName} spent ${Math.abs(tokens)} influence tokens for ${voteWeight.toFixed(2)} votes on "${optProp}" proposal.`);
      }
    });
  });

  let winnerId = crisis.options[0].id;
  let maxVotes = -Infinity;

  Object.keys(votes).forEach(optId => {
    if (votes[optId] > maxVotes) {
      maxVotes = votes[optId];
      winnerId = optId;
    }
  });

  const winnerOption = crisis.options.find(opt => opt.id === winnerId);

  return {
    winner: winnerOption,
    votes,
    breakdown: breakdownLines.length > 0 ? breakdownLines.join("\n") : "No votes were cast. Emergency autocracy choice enacted.",
  };
}

// 4. FUTARCHY RESOLVER
export function resolveFutarchy(crisis, factions, userTargetMetricPreference = "morale") {
  const marketPredictions = {};
  const breakdownLines = [];
  
  crisis.options.forEach(opt => {
    const baseValue = 70;
    const directEffect = opt.effects.resources[userTargetMetricPreference] || 0;
    let marketBuyVolume = 0;
    
    Object.keys(factions).forEach(facKey => {
      const utility = calculateUtility(facKey, opt);
      if (utility > 0) {
        marketBuyVolume += utility * 0.4;
      } else {
        marketBuyVolume += utility * 0.2;
      }
    });

    const finalPrediction = Math.max(0, Math.min(100, baseValue + directEffect + marketBuyVolume));
    marketPredictions[opt.id] = finalPrediction;

    const proposer = opt.proposer.toUpperCase();
    breakdownLines.push(`Prediction Market for "${proposer}" proposal: Predicted Sol ${TOTAL_SOLS} Colony ${userTargetMetricPreference.toUpperCase()} is ${finalPrediction.toFixed(1)}%`);
  });

  let winnerId = crisis.options[0].id;
  let maxPrediction = -Infinity;

  Object.keys(marketPredictions).forEach(optId => {
    if (marketPredictions[optId] > maxPrediction) {
      maxPrediction = marketPredictions[optId];
      winnerId = optId;
    }
  });

  const winnerOption = crisis.options.find(opt => opt.id === winnerId);

  return {
    winner: winnerOption,
    predictions: marketPredictions,
    breakdown: breakdownLines.join("\n")
  };
}
