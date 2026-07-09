export const SOUNDSCAPE_TRACKS = [
  {
    id: 'bach_prelude_mission',
    title: 'Mission Control Prelude',
    shortTitle: 'Prelude',
    sourceTitle: 'J. S. Bach, Well-Tempered Clavier I, Prelude I, BWV 846',
    sourceUrl: 'https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=5',
    sourceLicense: 'Mutopia public-domain score edition',
    role: 'Menu / steady-state command',
    tempoMs: 220,
    wave: 'triangle',
    gain: 0.045,
    pattern: [
      ['C4', 'E4', 'G4', 'C5', 'E5', 'G4', 'C5', 'E5'],
      ['D4', 'F4', 'A4', 'D5', 'F5', 'A4', 'D5', 'F5'],
      ['G3', 'D4', 'G4', 'B4', 'D5', 'G4', 'B4', 'D5'],
      ['C4', 'E4', 'G4', 'C5', 'E5', 'G4', 'C5', 'E5'],
    ],
  },
  {
    id: 'beethoven_crisis_grave',
    title: 'Crisis Grave',
    shortTitle: 'Grave',
    sourceTitle: 'L. V. Beethoven, Piano Sonata No. 8 "Pathetique", I. Grave',
    sourceUrl: 'https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=299',
    sourceLicense: 'Mutopia public-domain score edition',
    role: 'High-pressure crisis deliberation',
    tempoMs: 520,
    wave: 'sawtooth',
    gain: 0.035,
    pattern: [
      ['C3', 'G3', 'C4'],
      ['Eb3', 'Bb3', 'Eb4'],
      ['Ab2', 'Eb3', 'Ab3'],
      ['G2', 'D3', 'G3'],
      ['C3', 'G3', 'C4'],
    ],
  },
  {
    id: 'bach_cello_final',
    title: 'Final Telemetry Suite',
    shortTitle: 'Finale',
    sourceTitle: 'J. S. Bach, Cello Suite No. 1, BWV 1007',
    sourceUrl: 'https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=517',
    sourceLicense: 'Mutopia public-domain score edition',
    role: 'Results / final score reflection',
    tempoMs: 360,
    wave: 'sine',
    gain: 0.055,
    pattern: [
      ['G2'],
      ['D3'],
      ['B3'],
      ['A3'],
      ['B3'],
      ['D3'],
      ['G3'],
      ['B3'],
      ['A3'],
      ['F#3'],
      ['D3'],
      ['G2'],
    ],
  },
];

const NOTE_OFFSETS = {
  C: -9,
  'C#': -8,
  Db: -8,
  D: -7,
  'D#': -6,
  Eb: -6,
  E: -5,
  F: -4,
  'F#': -3,
  Gb: -3,
  G: -2,
  'G#': -1,
  Ab: -1,
  A: 0,
  'A#': 1,
  Bb: 1,
  B: 2,
};

export function noteToFrequency(note) {
  const match = /^([A-G](?:#|b)?)(-?\d+)$/.exec(note);
  if (!match) return 440;

  const [, pitch, octaveRaw] = match;
  const octave = Number(octaveRaw);
  const semitonesFromA4 = NOTE_OFFSETS[pitch] + (octave - 4) * 12;

  return 440 * 2 ** (semitonesFromA4 / 12);
}

export function selectSoundscapeTrack(gameState) {
  if (gameState?.gameOver || gameState?.gameWon) return 'bach_cello_final';
  if ((gameState?.resources?.morale ?? 100) < 45 || (gameState?.resources?.integrity ?? 100) < 60) {
    return 'beethoven_crisis_grave';
  }
  return 'bach_prelude_mission';
}
