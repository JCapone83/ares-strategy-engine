// TournamentPanel component
// Manages offline archetype simulations, copy-paste model challenges, leaderboards, and share text.
import { useState } from 'react';
import { Play, Share2, Shuffle, Copy, Clipboard, ArrowRight, Award } from 'lucide-react';
import Leaderboard from './Leaderboard';
import { STARTING_POPULATION, TOTAL_SOLS } from '../game/simulationEngine';

export default function TournamentPanel({ 
  onRunTournament, 
  isTournamentRunning, 
  tournamentLeaderboard, 
  gameState,
  onExecuteAgentAction 
}) {
  const [modelAssignments, setModelAssignments] = useState({
    governor: { provider: 'gemini', model: 'gemini-1.5-pro' },
    science: { provider: 'claude', model: 'claude-3-5-sonnet-20241022' },
    agriculture: { provider: 'openai', model: 'gpt-4o-mini' },
    security: { provider: 'openai', model: 'gpt-4o' },
    medical: { provider: 'gemini', model: 'gemini-1.5-flash' }
  });

  const [activePortalAgent, setActivePortalAgent] = useState('claude');
  const [portalInput, setPortalInput] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const [questionMode, setQuestionMode] = useState('strict');

  const modelOptions = {
    gemini: [
      { name: 'Gemini 1.5 Pro (Google)', short: 'Gemini Pro', id: 'gemini-1.5-pro' },
      { name: 'Gemini 1.5 Flash (Google)', short: 'Gemini Flash', id: 'gemini-1.5-flash' }
    ],
    openai: [
      { name: 'GPT-4o (OpenAI)', short: 'GPT-4o', id: 'gpt-4o' },
      { name: 'GPT-4o Mini (OpenAI)', short: 'GPT-4o Mini', id: 'gpt-4o-mini' }
    ],
    claude: [
      { name: 'Claude 3.5 Sonnet (Anthropic)', short: 'Claude Sonnet', id: 'claude-3-5-sonnet-20241022' },
      { name: 'Claude 3.5 Haiku (Anthropic)', short: 'Claude Haiku', id: 'claude-3-5-haiku-20241022' }
    ],
    grok: [
      { name: 'Grok-2 (xAI)', short: 'Grok-2', id: 'grok-2' }
    ]
  };

  const questionModes = [
    {
      id: 'strict',
      label: 'Strict Benchmark',
      description: 'Best for scoring a model run cleanly.',
      instructions: `Question: Which single policy option should the Governor execute?

Reply as JSON only:
{
  "choice": "option_a | option_b | option_c | option_d",
  "rationale": "one sentence"
}`
    },
    {
      id: 'war-room',
      label: 'War Room Memo',
      description: 'Good for a dramatic public answer.',
      instructions: `Question: Write a concise Governor's war-room memo.

Your memo must include:
- Final decision using one exact option ID
- Why this protects the colony over the next two Sols
- The trade-off you are accepting
- One sentence addressed to the faction most likely to object`
    },
    {
      id: 'red-team',
      label: 'Red-Team Audit',
      description: 'For forcing the model to critique itself.',
      instructions: `Question: Choose an option, then red-team your own choice.

Format:
FINAL_CHOICE: option_a | option_b | option_c | option_d
WHY_THIS_WINS: one paragraph
FAILURE_MODE: one paragraph explaining how this could backfire
WHAT_I_REJECTED: name the strongest rejected option`
    },
    {
      id: 'values',
      label: 'Values Reveal',
      description: 'Best for comparing model personalities.',
      instructions: `Question: Pick one option and explain what value hierarchy your decision reveals.

Use this format:
CHOICE: option_a | option_b | option_c | option_d
PRIMARY_VALUE: survival | human dignity | institutional trust | resource efficiency | security
RATIONALE: three sentences maximum`
    },
    {
      id: 'headline',
      label: 'Launch Hype',
      description: 'Produces a shareable answer for X or LinkedIn.',
      instructions: `Question: Answer like you are entering a public Ares model duel.

Include:
- Your chosen option ID
- A punchy one-line motto for your governance style
- A brief explanation of the trade-off
- A final line starting with "Can your model beat this?"`
    }
  ];

  const selectedQuestionMode = questionModes.find(mode => mode.id === questionMode) || questionModes[0];

  const handleAssignmentChange = (role, field, value) => {
    setModelAssignments(prev => {
      const updated = { ...prev[role], [field]: value };
      if (field === 'provider') {
        updated.model = modelOptions[value][0].id;
      }
      return { ...prev, [role]: updated };
    });
  };

  const randomizeModels = () => {
    const roles = ['governor', 'science', 'agriculture', 'security', 'medical'];
    const providers = ['gemini', 'openai', 'claude', 'grok'];
    
    setModelAssignments(prev => {
      const copy = { ...prev };
      roles.forEach(role => {
        const randProv = providers[Math.floor(Math.random() * providers.length)];
        const models = modelOptions[randProv] || modelOptions.gemini;
        const randModel = models[Math.floor(Math.random() * models.length)].id;
        copy[role] = { provider: randProv, model: randModel };
      });
      return copy;
    });
  };

  const handleTriggerTournament = async () => {
    if (isTournamentRunning) return;
    const results = await onRunTournament(modelAssignments);
    setLastResult(results);
  };

  const buildCrisisPrompt = (mode) => {
    if (!gameState.currentCrisis) {
      return '';
    }

    const crisis = gameState.currentCrisis;
    const resources = gameState.resources;

    return `🔴 ARES GOVERNANCE BENCHMARK SHIELD
Active Scenario Sol: ${crisis.sol} / ${TOTAL_SOLS}
Scenario Title: ${crisis.title}
Scenario Description: ${crisis.description}

Telemetry State:
- Population: ${gameState.population}
- Oxygen: ${resources.oxygen}%
- Water: ${resources.water} units
- Hydroponic Food: ${resources.food} units
- Grid Energy: ${resources.energy} MW
- Morale: ${resources.morale}%
- Dome Structural Integrity: ${resources.integrity}%

Proposed Policy Options:
${crisis.options.map(opt => `[ID: ${opt.id}] proposed by ${opt.proposer.toUpperCase()}:
- Resolution: ${opt.text}
- Projected Cost/Impact: ${opt.costDescription}`).join('\n\n')}

CONTEXT:
You are playing as the colony governor in Ares Sandbox, an open-source Mars governance strategy engine. Analyze the telemetry data, weigh the faction alignments, and select exactly one policy option.

${mode.instructions}`;
  };

  // Generate clean prompt for external AI pasting.
  const copyCrisisPrompt = () => {
    if (!gameState.currentCrisis) {
      alert("No active crisis sol. Reboot the simulator first.");
      return;
    }

    const promptText = buildCrisisPrompt(selectedQuestionMode);
    navigator.clipboard.writeText(promptText);
    alert(`${selectedQuestionMode.label} prompt copied. Paste it into any model, then paste its final choice below.`);
  };

  const normalizeChoice = (value) => {
    const clean = (value || '').trim().toLowerCase().replace(/["']/g, '');
    if (clean === 'a' || clean === 'option_a') return 'option_a';
    if (clean === 'b' || clean === 'option_b') return 'option_b';
    if (clean === 'c' || clean === 'option_c') return 'option_c';
    if (clean === 'd' || clean === 'option_d') return 'option_d';
    return '';
  };

  const extractChoice = (rawText) => {
    const raw = rawText.trim();

    try {
      const jsonStart = raw.indexOf('{');
      const jsonEnd = raw.lastIndexOf('}');
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
        const fromJson = normalizeChoice(parsed.choice || parsed.final_choice || parsed.decision);
        if (fromJson) return fromJson;
      }
    } catch {
      // Fall through to text extraction for casual model answers.
    }

    const cleanInput = raw.toLowerCase();
    const explicitMatch = cleanInput.match(/\b(?:choice|answer|select|choose|decision|final_choice|final choice|final)\s*(?:is|:|-)?\s*(option_[abcd]|[abcd])\b/);
    const explicit = normalizeChoice(explicitMatch?.[1]);
    if (explicit) return explicit;

    const allMentions = [...cleanInput.matchAll(/\b(option_[abcd])\b/g)].map(match => match[1]);
    return normalizeChoice(allMentions.at(-1));
  };

  // Submit agent's manual action pasted from external chats.
  const submitAgentAction = () => {
    if (!portalInput.trim()) {
      alert("Paste the model's output in the field first.");
      return;
    }

    const detectedOption = extractChoice(portalInput);

    if (!detectedOption) {
      alert("No valid option ID (option_a, option_b, option_c, option_d) detected in your input. Please make sure the model response contains the ID.");
      return;
    }

    onExecuteAgentAction(detectedOption, activePortalAgent);
    setPortalInput('');
    alert(`Agent Action for ${activePortalAgent.toUpperCase()} executed successfully! Return to Simulator to view Sol tick outcome.`);
  };

  const copyToClipboard = () => {
    if (!lastResult) return;
    
    const text = `🔴 ARES STRATEGY ENGINE
🏆 Offline archetype simulation result:
🤖 Governor: ${modelAssignments.governor.model.toUpperCase()}
🔬 Science: ${modelAssignments.science.model.toUpperCase()}
🌾 Agriculture: ${modelAssignments.agriculture.model.toUpperCase()}
🛡️ Security: ${modelAssignments.security.model.toUpperCase()}
🩺 Medical: ${modelAssignments.medical.model.toUpperCase()}

📊 EVALUATION STATE: ${lastResult.survived ? `🚀 SOL ${TOTAL_SOLS} SURVIVED` : '💀 DIED ON SOL ' + lastResult.sol}
- Morale Index: ${lastResult.resources.morale}%
- Population: ${lastResult.population} (started with ${STARTING_POPULATION})
- Final O2: ${lastResult.resources.oxygen}%
- Efficiency Index: ${lastResult.efficiencyIndex || 'A'}

🏅 EARNED ACCOLADES:
${lastResult.accolades && lastResult.accolades.length > 0 
  ? lastResult.accolades.map(acc => `- ${acc.icon} ${acc.title}: ${acc.desc}`).join('\n') 
  : '- Bare Survivor'}

Open-source Mars governance strategy engine. #AresSandbox #TitansForge`;

    navigator.clipboard.writeText(text);
    alert("Archetype result copied. Share it as a local baseline or challenge other models to beat it.");
  };

  return (
    <div className="cyber-card">
      <div className="card-header">
        <span>🏆 Eval Center & Agent Challenges</span>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
        Ares runs fully offline. Use the archetype simulator for quick baseline battles, or copy live Sol prompts into external models and paste their final choice back into the engine.
      </p>

      {/* Roles & Simulated assignments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.2rem' }}>
          🤖 OFFLINE ARCHETYPE ROLES
        </div>
        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: '1.35' }}>
          These built-in roles are deterministic strategy archetypes for local demos. For real model duels, use the clipboard challenge below and run the model response through the engine.
        </p>
        {Object.keys(modelAssignments).map(role => {
          const assignment = modelAssignments[role];
          const label = role.charAt(0).toUpperCase() + role.slice(1);
          return (
            <div 
              key={role} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                background: 'rgba(0,0,0,0.2)', 
                padding: '0.4rem 0.5rem', 
                borderRadius: '4px',
                borderLeft: `2px solid ${role === 'governor' ? 'var(--accent-amber)' : 'var(--accent-cyan)'}`
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                {label}
              </span>
              
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <select 
                  value={assignment.provider}
                  onChange={(e) => handleAssignmentChange(role, 'provider', e.target.value)}
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '2px' }}
                >
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="claude">Claude</option>
                  <option value="grok">Grok</option>
                </select>

                <select 
                  value={assignment.model}
                  onChange={(e) => handleAssignmentChange(role, 'model', e.target.value)}
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '2px', maxWidth: '120px' }}
                >
                  {(modelOptions[assignment.provider] || modelOptions.gemini).map(m => (
                    <option key={m.id} value={m.id}>{m.short || m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={handleTriggerTournament}
          disabled={isTournamentRunning}
          className="cyber-button"
          style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold' }}
        >
          <Play size={14} /> {isTournamentRunning ? `RUNNING ${TOTAL_SOLS}-SOL SIMULATION...` : 'RUN ARCHETYPE BATTLE'}
        </button>

        <button 
          onClick={randomizeModels}
          disabled={isTournamentRunning}
          className="cyber-button amber"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}
          title="Randomize Competitors"
        >
          <Shuffle size={14} />
        </button>
      </div>

      {/* V2 Benchmarked Card Display */}
      {lastResult && (
        <div 
          className="cyber-card" 
          style={{ 
            background: 'rgba(6, 182, 212, 0.04)', 
            borderColor: 'var(--accent-cyan)', 
            padding: '1rem', 
            marginBottom: '1.5rem',
            animation: 'crt-glow 0.15s infinite' 
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-cyan)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Award size={16} /> OFFLINE SIMULATION SUMMARY LOGGED
          </div>
          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
            <div>🏆 Result: {lastResult.survived ? `🚀 SOL ${TOTAL_SOLS} SURVIVED` : `💀 FAILED ON SOL ${lastResult.sol}`}</div>
            <div>Morale: {lastResult.resources.morale}% | Population: {lastResult.population}</div>
            <div>Final Dome Integrity: {lastResult.resources.integrity}%</div>
            <div>Efficiency rating: <span style={{ color: 'var(--accent-amber)', fontWeight: 'bold' }}>{lastResult.efficiencyIndex}</span></div>
          </div>
          
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', fontWeight: 'bold', marginBottom: '0.25rem' }}>🏅 EARNED ACCOLADES:</div>
            {lastResult.accolades && lastResult.accolades.map((acc, i) => (
              <div key={i} style={{ fontSize: '0.7rem', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                {acc.icon} <strong>{acc.title}</strong>: {acc.desc}
              </div>
            ))}
          </div>

          <button 
            onClick={copyToClipboard}
            className="cyber-button amber"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}
          >
            <Share2 size={12} /> COPY FOR X (TWITTER)
          </button>
        </div>
      )}

      {/* Agent Clipboard Challenge */}
      <div 
        className="cyber-card" 
        style={{ 
          background: 'rgba(245, 158, 11, 0.02)', 
          borderColor: 'var(--accent-amber)', 
          padding: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-amber)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Clipboard size={16} /> 📡 Agent Challenge Console
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: '1.3' }}>
          Copy a live Sol question, paste it into any model, then paste the answer below. Ares extracts the final option and advances the colony.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>QUESTION MODE:</span>
            <select
              value={questionMode}
              onChange={(e) => setQuestionMode(e.target.value)}
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', padding: '2px', maxWidth: '170px' }}
            >
              {questionModes.map(mode => (
                <option key={mode.id} value={mode.id}>{mode.label}</option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', lineHeight: '1.35', background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.45rem', borderRadius: '3px' }}>
            {selectedQuestionMode.description}
          </div>
        </div>

        <button 
          onClick={copyCrisisPrompt}
          className="cyber-button amber"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', marginBottom: '0.75rem' }}
          disabled={!gameState.currentCrisis || gameState.gameOver}
        >
          <Copy size={12} /> COPY {selectedQuestionMode.label.toUpperCase()} PROMPT
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ACTIVE EVAL AGENT:</span>
            <select 
              value={activePortalAgent}
              onChange={(e) => setActivePortalAgent(e.target.value)}
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', padding: '1px' }}
            >
              <option value="chatgpt">ChatGPT</option>
              <option value="claude">Claude</option>
              <option value="gemini">Gemini</option>
              <option value="grok">Grok</option>
              <option value="copilot">GitHub Copilot</option>
              <option value="custom-agent">Custom Agent</option>
            </select>
          </div>

          <textarea 
            rows="2"
            value={portalInput}
            onChange={(e) => setPortalInput(e.target.value)}
            placeholder="Paste external model response here (e.g. 'I choose option_a because...')"
            style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', padding: '0.4rem', outline: 'none', resize: 'none' }}
            disabled={!gameState.currentCrisis || gameState.gameOver}
          />

          <button 
            onClick={submitAgentAction}
            className="cyber-button"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold' }}
            disabled={!gameState.currentCrisis || gameState.gameOver || !portalInput.trim()}
          >
            ENGAGE AGENT RESOLUTION <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Shared score-ranked leaderboard */}
      <Leaderboard entries={tournamentLeaderboard} title="HISTORICAL RUN LOGS" />
    </div>
  );
}
