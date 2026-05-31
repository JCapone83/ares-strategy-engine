// GovernanceConsole component
// Interactive console for toggling between Autocracy, Democracy, Quadratic Voting, and Futarchy.
import { User, Gavel, Scale, TrendingUp } from 'lucide-react';

export default function GovernanceConsole({ activeGov, onChangeGov, disabled }) {
  const models = [
    {
      id: 'autocracy',
      name: 'Autocracy',
      icon: <User size={16} />,
      desc: 'Absolute rule. You make all decisions directly. Easy and fast, but factions whose ideas are bypassed suffer a small alignment penalty.',
      math: 'Decision = Governor Choice'
    },
    {
      id: 'democracy',
      name: 'Direct Democracy',
      icon: <Gavel size={16} />,
      desc: 'One agent, one vote. You and the four Faction Chiefs each get one vote. Factions vote automatically for their preferred option. Majority rule.',
      math: 'Winner = Max(Votes), ties broken by Governor'
    },
    {
      id: 'quadratic',
      name: 'Quadratic Voting',
      icon: <Scale size={16} />,
      desc: 'Passionate intensity scales. Voters allocate Influence Tokens. The vote weight is the square root of tokens spent. Excellent for protecting minor interests.',
      math: 'Votes = Sign(Tokens) * sqrt(|Tokens|)'
    },
    {
      id: 'futarchy',
      name: 'Futarchy',
      icon: <TrendingUp size={16} />,
      desc: 'Let prediction markets rule. Factions bet influence on which policy will result in the highest Sol 5 colony Morale. The policy with the highest prediction is enacted.',
      math: 'Decision = Max(Predicted Morale)'
    }
  ];

  return (
    <div className="cyber-card">
      <div className="card-header">
        <span>⚖️ Governance Protocols</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {models.map(model => {
          const isActive = activeGov === model.id;
          return (
            <div 
              key={model.id}
              onClick={() => !disabled && onChangeGov(model.id)}
              className={`cyber-card ${isActive ? 'active' : ''}`}
              style={{
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled && !isActive ? 0.5 : 1,
                padding: '0.75rem',
                borderWidth: '1px',
                borderColor: isActive ? 'var(--accent-cyan)' : 'var(--border-color)',
                background: isActive ? 'rgba(6, 182, 212, 0.03)' : 'rgba(255,255,255,0.01)',
                marginBottom: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: isActive ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                {model.icon}
                <span>{model.name}</span>
                {isActive && <span style={{ fontSize: '0.65rem', padding: '1px 4px', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', borderRadius: '2px', marginLeft: 'auto' }}>ACTIVE</span>}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: '1.4' }}>
                {model.desc}
              </p>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: isActive ? 'var(--accent-amber)' : 'var(--text-muted)', marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '2px', width: 'fit-content' }}>
                Formula: {model.math}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
