// Leaderboard component
// Shared, score-ranked board used on the results screen and in the Eval Center.
// Renders any saved run (human, copy-paste model, or simulated agent) on one scale.
import { Trophy, Crown } from 'lucide-react';
import { TOTAL_SOLS } from '../game/simulationEngine';

const GRADE_COLORS = {
  S: 'var(--accent-cyan)',
  A: 'var(--accent-green)',
  B: 'var(--accent-green)',
  C: 'var(--accent-amber)',
  D: 'var(--accent-amber)',
  F: 'var(--accent-red)'
};

export default function Leaderboard({ entries = [], highlightTimestamp = null, title = 'GLOBAL LEADERBOARD', compact = false }) {
  // Defensive sort by score; tolerate legacy entries that only had sols/morale.
  const ranked = [...entries].sort((a, b) => {
    const sa = a.score ?? -1;
    const sb = b.score ?? -1;
    if (sb !== sa) return sb - sa;
    return (b.sols || 0) - (a.sols || 0);
  });

  return (
    <div className="cyber-card">
      <div className="card-header" style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Trophy size={15} /> <span>{title}</span>
      </div>

      {ranked.length === 0 ? (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.75rem' }}>
          No runs recorded yet. Finish a full Sol {TOTAL_SOLS} run to post the first score.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 54px 70px', gap: '0.5rem', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 0.5rem' }}>
            <span>#</span>
            <span>Player / Model</span>
            <span style={{ textAlign: 'center' }}>Grade</span>
            <span style={{ textAlign: 'right' }}>Score</span>
          </div>

          {ranked.map((item, index) => {
            const isHighlight = highlightTimestamp && item.timestamp === highlightTimestamp;
            const grade = item.grade || '—';
            return (
              <div
                key={item.timestamp || index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '28px 1fr 54px 70px',
                  gap: '0.5rem',
                  alignItems: 'center',
                  fontSize: '0.72rem',
                  background: isHighlight ? 'rgba(6, 182, 212, 0.10)' : 'rgba(255,255,255,0.02)',
                  border: isHighlight ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                  padding: '5px 8px',
                  borderRadius: '3px'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: index === 0 ? 'var(--accent-amber)' : 'var(--text-secondary)', fontWeight: 'bold' }}>
                  {index === 0 ? <Crown size={11} /> : index + 1}
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                  {item.name || item.govModel || 'Anonymous'}
                  {!compact && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>
                      {' '}· {item.survived ? `Sol ${TOTAL_SOLS} ✓` : `Sol ${item.sols || '?'}`}{item.governance ? ` · ${item.governance}` : ''}
                    </span>
                  )}
                </span>
                <span style={{ textAlign: 'center', fontWeight: 'bold', fontFamily: 'var(--font-display)', color: GRADE_COLORS[grade] || 'var(--text-secondary)' }}>
                  {grade}
                </span>
                <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
                  {item.score != null ? item.score : '—'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
