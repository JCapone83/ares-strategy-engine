// Main App Coordinator
// Coordinates the offline strategy engine, simulated governance protocols, scorecards, and clipboard challenges.
import { useState } from 'react';
import { HelpCircle, Cpu } from 'lucide-react';

// Logic and Engine imports
import { INITIAL_STATE, CRISES_DATABASE, TOTAL_SOLS, tickResources, calculateAccolades, calculateScore } from './game/simulationEngine';
import { resolveAutocracy, resolveDemocracy, resolveQuadraticVoting, resolveFutarchy, simulateAgentChoice } from './game/governanceModels';
import { generateProceduralDebate } from './game/promptTemplates';

// Component imports
import ColonyTelemetry from './components/ColonyTelemetry';
import FactionDebate from './components/FactionDebate';
import GovernanceConsole from './components/GovernanceConsole';
import CrisisLog from './components/CrisisLog';
import TournamentPanel from './components/TournamentPanel';
import ResultsScreen from './components/ResultsScreen';

function cloneInitialState() {
  return JSON.parse(JSON.stringify(INITIAL_STATE));
}

function buildDebateEntries(crisis, currentState) {
  const offlineLines = generateProceduralDebate(crisis);
  const factions = ['science', 'agriculture', 'security', 'medical'];

  return factions.map((fac) => {
    const factionMeta = currentState.factions[fac];
    const line = offlineLines.find(l => l.sender === fac);

    return {
      sender: fac,
      name: factionMeta.name,
      avatar: factionMeta.avatar,
      color: factionMeta.color,
      text: line?.text || "No sectoral brief available."
    };
  });
}

function buildCrisisState(solNumber, currentState) {
  const crisis = CRISES_DATABASE.find(c => c.sol === solNumber);
  if (!crisis) return currentState;

  return {
    ...currentState,
    sol: solNumber,
    currentCrisis: crisis,
    debateLog: buildDebateEntries(crisis, currentState),
    statusMessage: `Sol ${solNumber} orbital crisis detected. Standby for sector analysis.`
  };
}

export default function App() {
  // Navigation: 'GAME' or 'TOURNAMENT'
  const [activeTab, setActiveTab] = useState('GAME');
  
  // Game State
  const [gameState, setGameState] = useState(() => buildCrisisState(1, cloneInitialState()));
  const isDebating = false;
  const [isResolving, setIsResolving] = useState(false);
  const [consequenceLog, setConsequenceLog] = useState('');
  const [tournamentLeaderboard, setTournamentLeaderboard] = useState(() => {
    const savedLeaderboard = localStorage.getItem('ares_leaderboard');
    if (!savedLeaderboard) return [];

    try {
      return JSON.parse(savedLeaderboard);
    } catch {
      return [];
    }
  });

  // End-of-run scoring state (for the human / copy-paste model results screen)
  const [lastScore, setLastScore] = useState(null);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [lastEntryTimestamp, setLastEntryTimestamp] = useState(null);
  const [lastPlayerName, setLastPlayerName] = useState('');

  // Prepares the crisis for a specific Sol
  const startCrisisForSol = (solNumber, currentState) => {
    setGameState(prev => buildCrisisState(solNumber, currentState || prev));
    setConsequenceLog('');
  };

  // Submits decisions based on active governance
  const handleDecisionSubmit = async (args) => {
    setIsResolving(true);
    setGameState(prev => ({ ...prev, statusMessage: "Running voting mathematics..." }));

    const crisis = gameState.currentCrisis;
    let resolutionResult = null;

    // Simulate simple delay for retro terminal feel
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (gameState.activeGovernance === 'autocracy') {
      resolutionResult = resolveAutocracy(args.choiceId, crisis);
    } else if (gameState.activeGovernance === 'democracy') {
      resolutionResult = resolveDemocracy(crisis, gameState.factions, args.choiceId);
    } else if (gameState.activeGovernance === 'quadratic') {
      const allocations = { governor: args.qvAllocations };
      // Factions allocate tokens dynamically
      Object.keys(gameState.factions).forEach(fac => {
        const proposedOption = crisis.options.find(o => o.proposer === fac);
        allocations[fac] = { [proposedOption.id]: 25 }; 
      });

      resolutionResult = resolveQuadraticVoting(crisis, gameState.factions, allocations);
    } else if (gameState.activeGovernance === 'futarchy') {
      resolutionResult = resolveFutarchy(crisis, gameState.factions, args.futarchyTarget);
    }

    if (!resolutionResult || !resolutionResult.winner) {
      setIsResolving(false);
      return;
    }

    executeWinningChoice(resolutionResult, crisis);
  };

  // Clipboard Challenge action execution for external model runs.
  const handleExecuteAgentAction = (choiceId, agentName) => {
    setIsResolving(true);
    const crisis = gameState.currentCrisis;
    
    // Autocracy execution for external paste runs
    const resolution = resolveAutocracy(choiceId, crisis);
    
    executeWinningChoice(resolution, crisis, agentName);
  };

  const executeWinningChoice = (resolutionResult, crisis, externalAgentName = null) => {
    const winningOption = resolutionResult.winner;
    const consequence = winningOption.consequence;
    
    setConsequenceLog(`${resolutionResult.breakdown || ''}\n\nCONSEQUENCE:\n${consequence}`);

    // Update resources and alignments
    const nextState = tickResources(gameState, winningOption.effects);
    
    // Save choices to state history for achievements
    const newHistoryEntry = {
      sol: gameState.sol,
      governance: gameState.activeGovernance,
      chosenOptionId: winningOption.id,
      agentPlayed: externalAgentName || 'human'
    };
    
    const updatedHistory = [...(gameState.history || []), newHistoryEntry];

    // If the game ended, compute the unified run score. The player tags and posts
    // it from the results screen (see submitScore) so runs are named on the board.
    if (nextState.gameOver || nextState.gameWon) {
      const scoreState = {
        resources: nextState.resources,
        factions: nextState.factions,
        population: nextState.population,
        gameWon: nextState.gameWon
      };
      const computed = calculateScore(scoreState, gameState.sol);
      setLastScore(computed);
      setScoreSubmitted(false);
      setLastEntryTimestamp(null);
      setLastPlayerName(externalAgentName || '');
    }

    setGameState(prev => ({
      ...prev,
      population: nextState.population,
      resources: nextState.resources,
      factions: nextState.factions,
      history: updatedHistory,
      gameOver: nextState.gameOver,
      gameWon: nextState.gameWon,
      statusMessage: nextState.statusMessage
    }));

    setIsResolving(false);
  };

  const handleNextSol = () => {
    const nextSolNumber = gameState.sol + 1;
    if (gameState.gameOver || gameState.gameWon) return;
    startCrisisForSol(nextSolNumber, gameState);
  };

  // Posts the finished run to the shared leaderboard, tagged with who played it.
  const submitScore = (playerName) => {
    if (scoreSubmitted || !lastScore) return;

    const timestamp = Date.now();
    const entry = {
      name: (playerName || '').trim() || 'Anonymous Governor',
      score: lastScore.total,
      grade: lastScore.grade,
      sols: lastScore.solsCompleted,
      survived: lastScore.survived,
      morale: gameState.resources.morale,
      population: gameState.population,
      governance: gameState.activeGovernance,
      timestamp
    };

    const newLeaderboard = [...tournamentLeaderboard, entry]
      .sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || (b.sols || 0) - (a.sols || 0))
      .slice(0, 20);

    setTournamentLeaderboard(newLeaderboard);
    localStorage.setItem('ares_leaderboard', JSON.stringify(newLeaderboard));
    setScoreSubmitted(true);
    setLastEntryTimestamp(timestamp);
  };

  const resetGame = () => {
    const freshState = {
      ...cloneInitialState(),
      history: []
    };
    setGameState(buildCrisisState(1, freshState));
    setConsequenceLog('');
    setLastScore(null);
    setScoreSubmitted(false);
    setLastEntryTimestamp(null);
    setLastPlayerName('');
  };

  // automated Tournament benchmarker
  const handleRunTournament = async (assignments) => {
    setIsResolving(true);
    let currentSimState = cloneInitialState();
    currentSimState.history = [];
    let survived = true;
    let finalSol = 1;

    for (let sol = 1; sol <= TOTAL_SOLS; sol++) {
      const crisis = CRISES_DATABASE.find(c => c.sol === sol);
      if (!crisis) break;
      finalSol = sol;

      // Simulate Governor model selection
      const govChoiceId = simulateAgentChoice(assignments.governor.model, crisis, currentSimState);
      
      // Simulate direct democracy voting
      const votes = { [govChoiceId]: 1 };
      
      Object.keys(currentSimState.factions).forEach(fac => {
        const facChoiceId = simulateAgentChoice(assignments[fac].model, crisis, currentSimState);
        votes[facChoiceId] = (votes[facChoiceId] || 0) + 1;
      });

      // Find winner
      let winnerId = crisis.options[0].id;
      let maxV = -1;
      Object.keys(votes).forEach(optId => {
        if (votes[optId] > maxV) {
          maxV = votes[optId];
          winnerId = optId;
        }
      });

      const winnerOption = crisis.options.find(o => o.id === winnerId);
      const ticked = tickResources(currentSimState, winnerOption.effects);

      currentSimState.resources = ticked.resources;
      currentSimState.population = ticked.population;
      currentSimState.factions = ticked.factions;
      currentSimState.history.push({
        sol,
        governance: 'democracy',
        chosenOptionId: winnerOption.id,
        agentPlayed: assignments.governor.model
      });

      if (ticked.gameOver) {
        survived = false;
        break;
      }
    }

    const endAccolades = calculateAccolades(currentSimState, currentSimState.history);

    // Unified score (same formula as human / copy-paste runs)
    const simScore = calculateScore({ ...currentSimState, gameWon: survived }, finalSol);

    const result = {
      sol: finalSol,
      survived,
      resources: currentSimState.resources,
      population: currentSimState.population,
      efficiencyIndex: simScore.grade,
      score: simScore.total,
      accolades: endAccolades
    };

    // Update leaderboard with a comparable, named entry
    const newEntry = {
      name: `${assignments.governor.model} (Sim)`,
      score: simScore.total,
      grade: simScore.grade,
      sols: finalSol,
      survived,
      morale: currentSimState.resources.morale,
      population: currentSimState.population,
      governance: 'democracy',
      timestamp: Date.now()
    };

    const updatedLeaderboard = [...tournamentLeaderboard, newEntry]
      .sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || (b.sols || 0) - (a.sols || 0))
      .slice(0, 20);

    setTournamentLeaderboard(updatedLeaderboard);
    localStorage.setItem('ares_leaderboard', JSON.stringify(updatedLeaderboard));

    setIsResolving(false);
    return result;
  };

  const endAccolades = (gameState.gameOver || gameState.gameWon) 
    ? calculateAccolades(gameState, gameState.history) 
    : [];

  return (
    <div className="terminal-layer">
      {/* Header bar */}
      <div className="header-bar">
        <div className="brand-title">
          <Cpu size={22} style={{ animation: 'indicator-pulse 2s infinite ease-in-out' }} />
          <span>ARES SANDBOX</span>
          <span className="brand-subtitle">// MARS GOVERNANCE COORDINATOR</span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            className={`cyber-button ${activeTab === 'GAME' ? 'amber' : ''}`}
            onClick={() => setActiveTab('GAME')}
            style={{ fontSize: '0.75rem' }}
          >
            🕹️ SIMULATOR
          </button>
          <button 
            className={`cyber-button ${activeTab === 'TOURNAMENT' ? 'amber' : ''}`}
            onClick={() => setActiveTab('TOURNAMENT')}
            style={{ fontSize: '0.75rem' }}
          >
            🏆 EVAL CENTER
          </button>
        </div>
      </div>

      {/* Main Play Area */}
      {activeTab === 'GAME' ? (
        <div className="game-grid">
          {/* Left Panel: Telemetry & Factions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <ColonyTelemetry 
              resources={gameState.resources} 
              population={gameState.population}
              sol={gameState.sol}
            />

            {/* Faction Alignment List */}
            <div className="cyber-card">
              <div className="card-header">
                <span>🤝 Faction Alignment</span>
              </div>
              <div className="factions-grid">
                {Object.keys(gameState.factions).map(facKey => {
                  const fac = gameState.factions[facKey];
                  return (
                    <div key={facKey} className="faction-status-card" style={{ borderLeft: `3px solid ${fac.color}` }}>
                      <span className="faction-avatar">{fac.avatar}</span>
                      <div className="faction-info">
                        <div className="faction-name-row">
                          <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{fac.name}</span>
                          <span style={{ fontSize: '0.8rem', color: fac.alignment < 40 ? 'var(--accent-red)' : (fac.alignment < 60 ? 'var(--accent-amber)' : 'var(--accent-green)'), fontWeight: 'bold' }}>
                            {fac.alignment}%
                          </span>
                        </div>
                        <div className="faction-details">
                          <span>{fac.role}</span>
                          <span>Influence: {fac.influence}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center Panel: Crisis, Actions & Debate */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {gameState.gameOver || gameState.gameWon ? (
              <ResultsScreen
                gameWon={gameState.gameWon}
                statusMessage={gameState.statusMessage}
                score={lastScore}
                accolades={endAccolades}
                resources={gameState.resources}
                population={gameState.population}
                leaderboard={tournamentLeaderboard}
                scoreSubmitted={scoreSubmitted}
                lastTimestamp={lastEntryTimestamp}
                defaultName={lastPlayerName}
                onSubmitScore={submitScore}
                onReboot={resetGame}
              />
            ) : (
              <>
                <CrisisLog 
                  key={gameState.currentCrisis?.id}
                  crisis={gameState.currentCrisis}
                  activeGov={gameState.activeGovernance}
                  userInfluence={50}
                  onSubmitDecision={handleDecisionSubmit}
                  isResolving={isResolving}
                />

                {consequenceLog && (
                  <div className="cyber-card" style={{ background: 'rgba(245, 158, 11, 0.02)', borderColor: 'var(--accent-amber)', animation: 'crt-glow 0.15s infinite' }}>
                    <div className="card-header" style={{ color: 'var(--accent-amber)' }}>
                      <span>📡 Consensus Log Details</span>
                    </div>
                    <pre style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                      {consequenceLog}
                    </pre>
                    <button 
                      onClick={handleNextSol}
                      className="cyber-button amber" 
                      style={{ width: '100%', marginTop: '1rem', fontWeight: 'bold' }}
                    >
                      INITIALIZE NEXT SOL SCENARIOS ➡️
                    </button>
                  </div>
                )}
              </>
            )}
            
            <FactionDebate 
              debateLog={gameState.debateLog}
              isDebating={isDebating}
            />
          </div>

          {/* Right Panel: Governance console & Instructions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <GovernanceConsole 
              activeGov={gameState.activeGovernance}
              onChangeGov={(gov) => setGameState(prev => ({ ...prev, activeGovernance: gov }))}
              disabled={!!consequenceLog || gameState.gameOver || gameState.gameWon}
            />

            {/* Systems Manual */}
            <div className="cyber-card" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
              <div className="card-header" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><HelpCircle size={14} /> Systems Manual</span>
              </div>
              <ul style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: '1.4' }}>
                <li>Coordinate the first <strong>{TOTAL_SOLS} Sols (Days)</strong> of trials.</li>
                <li>Factions have divergent goals: if any faction alignment reaches <strong>0%</strong>, they may sabotage modules.</li>
                <li>Changing governance structures alters decision resolution formulas.</li>
                <li>No API keys are required. Use the Eval Center to copy prompts into any model or run offline archetype simulations.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <TournamentPanel 
            onRunTournament={handleRunTournament}
            isTournamentRunning={isResolving}
            tournamentLeaderboard={tournamentLeaderboard}
            gameState={gameState}
            onExecuteAgentAction={handleExecuteAgentAction}
          />
        </div>
      )}

    </div>
  );
}
