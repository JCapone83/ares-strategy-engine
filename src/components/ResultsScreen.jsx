// ResultsScreen component
// The end-of-run "win/score area." Works for whoever played the run — a human,
// a model driven through the Clipboard Portal, or a simulated agent. Computes a
// transparent score, shows the breakdown + accolades, lets the player tag the run
// with a name (their own or a model's), and posts it to the shared leaderboard.
import { useState, useRef, useEffect } from 'react';
import { ShieldAlert, Award, RefreshCw, Save, CheckCircle, Trophy, Download, Image as ImageIcon, Clipboard } from 'lucide-react';
import Leaderboard from './Leaderboard';
import { STARTING_POPULATION, TOTAL_SOLS } from '../game/simulationEngine';

// Hex equivalents of the theme accents (canvas can't read CSS variables).
const GRADE_HEX = { S: '#06B6D4', A: '#10B981', B: '#10B981', C: '#F59E0B', D: '#F59E0B', F: '#EF4444' };

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Draws the 1200x630 (OG image ratio) social share card onto a canvas.
function drawShareCard(canvas, { gameWon, score, accolades, resources, population, playerName }) {
  const ctx = canvas.getContext('2d');
  const W = 1200, H = 630;
  canvas.width = W; canvas.height = H;

  const total = score?.total ?? 0;
  const grade = score?.grade ?? '-';
  const survived = !!score?.survived;
  const sols = score?.solsCompleted ?? 0;
  const accent = gameWon ? '#10B981' : '#EF4444';
  const gradeHex = GRADE_HEX[grade] || '#9aa4b0';

  // Background
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#070b12');
  g.addColorStop(1, '#0d1726');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Faint grid
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Frame + top accent bar
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, W, 8);
  ctx.strokeStyle = 'rgba(6,182,212,0.25)';
  ctx.lineWidth = 2;
  roundRect(ctx, 18, 18, W - 36, H - 36, 14);
  ctx.stroke();

  // Wordmark
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#E5E7EB';
  ctx.font = '800 50px Helvetica, Arial, sans-serif';
  ctx.fillText('ARES SANDBOX', 64, 104);
  ctx.fillStyle = '#7c8794';
  ctx.font = '600 21px Helvetica, Arial, sans-serif';
  ctx.fillText('MARS GOVERNANCE · AI COORDINATION BENCHMARK', 66, 138);

  // Result line
  ctx.fillStyle = accent;
  ctx.font = '800 40px Helvetica, Arial, sans-serif';
  ctx.fillText(gameWon ? 'COLONY SECURED' : 'COLONY LOST', 64, 232);
  ctx.fillStyle = '#9aa4b0';
  ctx.font = '400 26px Helvetica, Arial, sans-serif';
  ctx.fillText(survived ? `Survived all ${TOTAL_SOLS} Sols` : `Fell on Sol ${sols}`, 66, 270);

  // Big score
  ctx.fillStyle = '#06B6D4';
  ctx.font = '800 190px Helvetica, Arial, sans-serif';
  ctx.fillText(String(total), 58, 470);
  const scoreW = ctx.measureText(String(total)).width;
  ctx.fillStyle = '#5b6573';
  ctx.font = '700 34px Helvetica, Arial, sans-serif';
  ctx.fillText('/ 1000', 74 + scoreW, 470);

  // Player tag
  ctx.fillStyle = '#cbd3dc';
  ctx.font = '600 28px Helvetica, Arial, sans-serif';
  const who = (playerName || '').trim() || 'Anonymous Governor';
  ctx.fillText(`Played by ${who}`, 66, 520);

  // Run stats
  ctx.fillStyle = '#8a93a0';
  ctx.font = '500 23px Helvetica, Arial, sans-serif';
  ctx.fillText(`Pop ${population} (start ${STARTING_POPULATION})   ·   Morale ${resources?.morale ?? 0}%   ·   Integrity ${resources?.integrity ?? 0}%`, 66, 558);

  // Grade badge (right)
  const bx = 880, by = 150, bw = 256, bh = 256;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  roundRect(ctx, bx, by, bw, bh, 22); ctx.fill();
  ctx.strokeStyle = gradeHex; ctx.lineWidth = 4;
  roundRect(ctx, bx, by, bw, bh, 22); ctx.stroke();
  ctx.fillStyle = '#7c8794';
  ctx.font = '700 22px Helvetica, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GRADE', bx + bw / 2, by + 50);
  ctx.fillStyle = gradeHex;
  ctx.font = '800 150px Helvetica, Arial, sans-serif';
  ctx.fillText(grade, bx + bw / 2, by + 190);

  // Top accolade under the badge
  if (accolades && accolades.length) {
    const t = accolades[0].title.length > 24 ? accolades[0].title.slice(0, 23) + '…' : accolades[0].title;
    ctx.fillStyle = '#8a93a0';
    ctx.font = '600 22px Helvetica, Arial, sans-serif';
    ctx.fillText(`🏅 ${t}`, bx + bw / 2, by + bh + 38);
  }
  ctx.textAlign = 'left';

  // Footer hashtag
  ctx.fillStyle = '#586172';
  ctx.font = '600 22px Helvetica, Arial, sans-serif';
  ctx.fillText('Open-source AI governance benchmark · #AresSandbox', 66, 600);
  ctx.fillStyle = gradeHex;
  ctx.font = '700 22px Helvetica, Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Can your model beat it?', W - 64, 600);
  ctx.textAlign = 'left';
}

const TIER_COLORS = {
  Platinum: 'var(--accent-cyan)',
  Emerald: 'var(--accent-green)',
  Gold: 'var(--accent-amber)',
  Silver: 'var(--text-secondary)'
};

const GRADE_COLORS = {
  S: 'var(--accent-cyan)',
  A: 'var(--accent-green)',
  B: 'var(--accent-green)',
  C: 'var(--accent-amber)',
  D: 'var(--accent-amber)',
  F: 'var(--accent-red)'
};

export default function ResultsScreen({
  gameWon,
  statusMessage,
  score,
  accolades = [],
  resources = {},
  population = 0,
  leaderboard = [],
  scoreSubmitted = false,
  lastTimestamp = null,
  defaultName = '',
  onSubmitScore,
  onReboot
}) {
  const [playerName, setPlayerName] = useState(defaultName);
  const [shareStatus, setShareStatus] = useState('');
  const cardRef = useRef(null);

  const accent = gameWon ? 'var(--accent-green)' : 'var(--accent-red)';
  const gradeColor = GRADE_COLORS[score?.grade] || 'var(--text-secondary)';

  // Keep the share-card preview in sync with the run + the name being typed.
  useEffect(() => {
    if (cardRef.current && score) {
      drawShareCard(cardRef.current, { gameWon, score, accolades, resources, population, playerName });
    }
  }, [gameWon, score, accolades, resources, population, playerName]);

  const flash = (msg) => { setShareStatus(msg); setTimeout(() => setShareStatus(''), 2200); };

  const getBlob = () => new Promise((resolve) => {
    if (!cardRef.current) return resolve(null);
    cardRef.current.toBlob((b) => resolve(b), 'image/png');
  });

  const downloadImage = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ares-score-${score?.total ?? 0}-${score?.grade ?? ''}.png`;
    a.click();
    URL.revokeObjectURL(url);
    flash('Image saved.');
  };

  const copyImage = async () => {
    try {
      const blob = await getBlob();
      if (!blob || !navigator.clipboard || !window.ClipboardItem) throw new Error('unsupported');
      await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
      flash('Image copied — paste it anywhere.');
    } catch {
      downloadImage();
      flash('Copy not supported here — saved image instead.');
    }
  };

  const shareText = () => {
    const total = score?.total ?? 0;
    const grade = score?.grade ?? '-';
    const survived = !!score?.survived;
    const sols = score?.solsCompleted ?? 0;
    const who = (playerName || '').trim() || 'Anonymous Governor';
    const top = accolades && accolades.length ? `\n🏅 ${accolades[0].title}` : '';
    return [
      `🔴 ARES SANDBOX — Mars Governance Run`,
      gameWon ? `🚀 COLONY SECURED` : `💀 COLONY LOST`,
      `Score: ${total}/1000  ·  Grade: ${grade}`,
      survived ? `Survived all ${TOTAL_SOLS} Sols` : `Fell on Sol ${sols}`,
      `Played by ${who}` + top,
      `Pop ${population} (start ${STARTING_POPULATION}) · Morale ${resources.morale ?? 0}% · Integrity ${resources.integrity ?? 0}%`,
      ``,
      `Can your model beat it? Open-source AI governance benchmark. #AresSandbox`
    ].join('\n');
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText());
      flash('Text copied.');
    } catch {
      flash('Clipboard blocked by browser.');
    }
  };

  const handleSubmit = () => {
    if (scoreSubmitted) return;
    onSubmitScore(playerName);
  };

  return (
    <div
      className="cyber-card"
      style={{
        padding: '2rem 1.5rem',
        borderColor: accent,
        background: gameWon ? 'rgba(16, 185, 129, 0.03)' : 'rgba(239, 68, 68, 0.03)'
      }}
    >
      {/* Banner */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <ShieldAlert size={34} style={{ color: accent, marginBottom: '0.75rem', display: 'inline-block' }} />
        <h1 style={{ fontFamily: 'var(--font-display)', color: accent, marginBottom: '0.5rem', letterSpacing: '2px' }}>
          {gameWon ? 'COLONY SECURED' : 'COLONY LOST'}
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5', maxWidth: '560px', margin: '0 auto' }}>
          {statusMessage}
        </p>
      </div>

      {/* SCORE HERO */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          background: 'rgba(0,0,0,0.35)',
          border: `1px solid ${gradeColor}`,
          borderRadius: '6px',
          padding: '1.25rem',
          marginBottom: '1.25rem'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.2rem' }}>Final Score</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.6rem', color: 'var(--accent-cyan)', lineHeight: 1 }}>
            {score?.total ?? 0}
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>/ 1000</div>
        </div>
        <div style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.2rem' }}>Grade</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.6rem', color: gradeColor, lineHeight: 1 }}>
            {score?.grade ?? '—'}
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
            {score?.survived ? `All ${TOTAL_SOLS} Sols` : `Reached Sol ${score?.solsCompleted ?? '?'}`}
          </div>
        </div>
      </div>

      {/* SHARE CARD */}
      <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.9rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <ImageIcon size={13} /> Share card {(playerName || '').trim() ? '' : '(add your name above to tag it)'}
        </div>
        <canvas
          ref={cardRef}
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
          <button onClick={downloadImage} className="cyber-button" style={{ flex: '1 1 30%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 'bold' }}>
            <Download size={13} /> SAVE IMAGE
          </button>
          <button onClick={copyImage} className="cyber-button" style={{ flex: '1 1 30%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 'bold' }}>
            <ImageIcon size={13} /> COPY IMAGE
          </button>
          <button onClick={copyText} className="cyber-button" style={{ flex: '1 1 30%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 'bold' }}>
            <Clipboard size={13} /> COPY TEXT
          </button>
        </div>
        {shareStatus && (
          <div style={{ fontSize: '0.68rem', color: 'var(--accent-green)', marginTop: '0.4rem', textAlign: 'center' }}>{shareStatus}</div>
        )}
      </div>

      {/* SCORE BREAKDOWN BARS */}
      <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.9rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem' }}>How the score breaks down</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {(score?.breakdown || []).map((comp) => {
            const pct = comp.max > 0 ? Math.round((comp.points / comp.max) * 100) : 0;
            return (
              <div key={comp.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: '2px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{comp.label}</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{comp.points} / {comp.max}</span>
                </div>
                <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-cyan)' }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.65rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span>Pop: {population} (start {STARTING_POPULATION})</span>
          <span>Morale: {resources.morale ?? 0}%</span>
          <span>O₂: {resources.oxygen ?? 0}%</span>
          <span>Integrity: {resources.integrity ?? 0}%</span>
        </div>
      </div>

      {/* ACCOLADES */}
      {accolades.length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.9rem', marginBottom: '1.25rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-amber)', fontSize: '0.8rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Award size={14} /> EARNED ACCOLADES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {accolades.map((acc, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', borderLeft: `2px solid ${TIER_COLORS[acc.tier] || 'var(--accent-amber)'}`, paddingLeft: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem' }}>{acc.icon}</span>
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {acc.title} <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>({acc.tier})</span>
                  </div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>{acc.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMIT TO LEADERBOARD */}
      <div style={{ background: 'rgba(6, 182, 212, 0.04)', border: '1px solid var(--accent-cyan)', borderRadius: '4px', padding: '0.9rem', marginBottom: '1.25rem' }}>
        {scoreSubmitted ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-green)', fontSize: '0.8rem', justifyContent: 'center' }}>
            <CheckCircle size={16} /> Run posted to the leaderboard.
          </div>
        ) : (
          <>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Trophy size={13} /> Who played this run? Tag it to rank on the board.
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                placeholder="e.g. Justinian, Claude Opus 4.8, GPT-5.5, Grok 4.3"
                maxLength={40}
                style={{ flexGrow: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '0.45rem', outline: 'none', borderRadius: '3px' }}
              />
              <button
                onClick={handleSubmit}
                className="cyber-button"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}
              >
                <Save size={13} /> POST SCORE
              </button>
            </div>
          </>
        )}
      </div>

      {/* EMBEDDED LEADERBOARD */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Leaderboard entries={leaderboard} highlightTimestamp={lastTimestamp} title="HOW YOU MEASURE UP" />
      </div>

      {/* REBOOT */}
      <div style={{ textAlign: 'center' }}>
        <button onClick={onReboot} className="cyber-button amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', padding: '0.6rem 1.4rem' }}>
          <RefreshCw size={14} /> NEW RUN
        </button>
      </div>
    </div>
  );
}
