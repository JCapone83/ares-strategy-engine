// CrisisLog component
// Renders the active Sol crisis description, proposal cards, and voting sliders/controls for each governance protocol.
import { useState } from 'react';
import { AlertCircle, ArrowRight, Activity } from 'lucide-react';

export default function CrisisLog({ 
  crisis, 
  activeGov, 
  userInfluence, 
  onSubmitDecision, 
  isResolving 
}) {
  const [selectedOption, setSelectedOption] = useState(crisis?.options?.[0]?.id || '');
  
  // State for Quadratic Voting allocations: { option_a: tokens, option_b: tokens, ... }
  const [qvAllocations, setQvAllocations] = useState(() => {
    const initialQV = {};
    crisis?.options?.forEach(opt => { initialQV[opt.id] = 0; });
    return initialQV;
  });
  const [remainingTokens, setRemainingTokens] = useState(userInfluence);
  const [futarchyTarget, setFutarchyTarget] = useState('morale'); // morale or water/food

  if (!crisis) {
    return (
      <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
        <AlertCircle size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Telecommunication systems nominal. Standby for orbital crisis events...</span>
      </div>
    );
  }

  // Calculate total quadratic cost of current allocations
  const calculateQVTotalCost = (allocations) => {
    let cost = 0;
    Object.values(allocations).forEach(tokens => {
      cost += Math.abs(tokens); // Total tokens allocated is the sum of raw tokens
    });
    return cost;
  };

  const handleQVChange = (optionId, value) => {
    const newVal = parseInt(value) || 0;
    const tempAllocations = { ...qvAllocations, [optionId]: newVal };
    const totalCost = calculateQVTotalCost(tempAllocations);

    if (totalCost <= userInfluence) {
      setQvAllocations(tempAllocations);
      setRemainingTokens(userInfluence - totalCost);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isResolving) return;

    if (activeGov === 'autocracy' || activeGov === 'democracy') {
      onSubmitDecision({ choiceId: selectedOption });
    } else if (activeGov === 'quadratic') {
      // Package token allocations
      onSubmitDecision({ qvAllocations });
    } else if (activeGov === 'futarchy') {
      onSubmitDecision({ futarchyTarget });
    }
  };

  return (
    <div className="cyber-card active" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="crisis-box">
        <div className="crisis-title">
          <AlertCircle size={18} style={{ color: 'var(--accent-red)' }} />
          <span>SOL {crisis.sol} CRISIS: {crisis.title}</span>
        </div>
        <p className="crisis-description">{crisis.description}</p>
      </div>

      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
            📜 Proposed Resolutions
          </div>

          {crisis.options.map(opt => {
            const proposerName = opt.proposer.charAt(0).toUpperCase() + opt.proposer.slice(1);
            const isSelected = selectedOption === opt.id;

            return (
              <div 
                key={opt.id}
                className="cyber-card"
                style={{
                  padding: '0.85rem',
                  borderWidth: '1px',
                  borderColor: isSelected && (activeGov === 'autocracy' || activeGov === 'democracy') ? 'var(--accent-cyan)' : 'var(--border-color)',
                  background: isSelected && (activeGov === 'autocracy' || activeGov === 'democracy') ? 'rgba(6, 182, 212, 0.02)' : 'rgba(0,0,0,0.2)',
                  marginBottom: 0
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  {/* Selectors based on governance model */}
                  {(activeGov === 'autocracy' || activeGov === 'democracy') && (
                    <input 
                      type="radio" 
                      name="crisis-option" 
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => setSelectedOption(opt.id)}
                      style={{ marginTop: '0.25rem', cursor: 'pointer' }}
                    />
                  )}

                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {opt.text}
                      </span>
                      <span style={{ fontSize: '0.65rem', padding: '1px 4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', borderRadius: '2px' }}>
                        BY {proposerName}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginTop: '0.25rem' }}>
                      Impact: {opt.costDescription}
                    </div>

                    {/* Quadratic Voting Slider Interface */}
                    {activeGov === 'quadratic' && (
                      <div style={{ marginTop: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '2px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Allocate Influence Tokens:</span>
                          <span style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                            {qvAllocations[opt.id] || 0} tokens = {(Math.sqrt(Math.abs(qvAllocations[opt.id] || 0))).toFixed(2)} votes
                          </span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max={userInfluence}
                          value={qvAllocations[opt.id] || 0}
                          onChange={(e) => handleQVChange(opt.id, e.target.value)}
                          style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quadratic Voting Telemetry Footer */}
        {activeGov === 'quadratic' && (
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', background: 'rgba(6, 182, 212, 0.05)', padding: '0.75rem', borderRadius: '4px', border: '1px solid rgba(6, 182, 212, 0.2)', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Available Influence:</span>
            <span style={{ fontWeight: 'bold', color: remainingTokens === 0 ? 'var(--accent-amber)' : 'var(--accent-cyan)' }}>
              {remainingTokens} / {userInfluence} Tokens Left
            </span>
          </div>
        )}

        {/* Futarchy Telemetry Target Footer */}
        {activeGov === 'futarchy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.05)', padding: '0.75rem', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.8rem' }}>
            <div style={{ color: 'var(--accent-amber)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Activity size={14} /> FUTARCHY TARGET INDEX:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="futarchy-metric" 
                  value="morale"
                  checked={futarchyTarget === 'morale'}
                  onChange={() => setFutarchyTarget('morale')} 
                />
                Morale Index
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', marginLeft: '0.75rem' }}>
                <input 
                  type="radio" 
                  name="futarchy-metric" 
                  value="integrity"
                  checked={futarchyTarget === 'integrity'}
                  onChange={() => setFutarchyTarget('integrity')} 
                />
                Dome Integrity
              </label>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Factions will automatically purchase stock on the option mathematically proven to maximize the selected parameter by Sol 5.
            </p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isResolving || (activeGov === 'quadratic' && calculateQVTotalCost(qvAllocations) === 0 && userInfluence > 0)}
          className="cyber-button"
          style={{ width: '100%', marginTop: '0.5rem', py: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', border: '2px solid var(--accent-cyan)' }}
        >
          {isResolving ? '📡 Resolving Consensus Mechanics...' : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              ENGAGE RESOLUTION VECTOR <ArrowRight size={14} />
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
