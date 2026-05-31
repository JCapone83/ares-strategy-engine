// FactionDebate component
// Displays simulated/real-time debates in a scrolling retro terminal terminal.
import { useEffect, useRef } from 'react';

export default function FactionDebate({ debateLog, isDebating }) {
  const chatEndRef = useRef(null);

  // Auto scroll to latest messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [debateLog, isDebating]);

  return (
    <div className="cyber-card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <span>💬 Faction Debate Arena</span>
        {isDebating && <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', animation: 'indicator-pulse 1.5s infinite ease-in-out' }}>📡 TRANSMITTING DECISION VECTORS...</span>}
      </div>

      <div className="chat-window" style={{ height: '420px' }}>
        <div className="chat-messages">
          {debateLog.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '6rem', fontSize: '0.85rem' }}>
              📡 Telemetry static. Initiate next crisis Sol to establish faction contact.
            </div>
          ) : (
            debateLog.map((msg, index) => (
              <div 
                key={index} 
                className="chat-bubble"
                style={{ borderLeftColor: msg.color || 'var(--accent-cyan)' }}
              >
                <div className="chat-sender-row">
                  <span style={{ fontSize: '1rem' }}>{msg.avatar}</span>
                  <span className="chat-sender-name" style={{ color: msg.color || 'var(--text-primary)' }}>
                    {msg.name}
                  </span>
                  <span className="chat-sender-role">({msg.sender?.toUpperCase()})</span>
                </div>
                <div className="chat-text">{msg.text}</div>
              </div>
            ))
          )}

          {isDebating && (
            <div className="chat-bubble" style={{ borderLeftColor: 'var(--text-muted)' }}>
              <div className="chat-sender-row">
                <span className="pulse-indicator warning" style={{ width: '6px', height: '6px' }} />
                <span className="chat-sender-name" style={{ color: 'var(--text-secondary)' }}>ARES Mainframe</span>
              </div>
              <div className="chat-text" style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                Decoding high-dimensional neural representations...
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
}
