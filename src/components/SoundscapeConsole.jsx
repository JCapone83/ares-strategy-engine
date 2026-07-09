import { useEffect, useMemo, useRef, useState } from 'react';
import { Music, Pause, Play, Volume2 } from 'lucide-react';
import { SOUNDSCAPE_TRACKS, noteToFrequency, selectSoundscapeTrack } from '../game/soundscapeCatalog';

function createAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  return AudioContextClass ? new AudioContextClass() : null;
}

export default function SoundscapeConsole({ gameState }) {
  const suggestedTrackId = selectSoundscapeTrack(gameState);
  const [selectedTrackId, setSelectedTrackId] = useState(suggestedTrackId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.28);
  const audioRef = useRef(null);
  const masterGainRef = useRef(null);
  const timeoutRef = useRef(null);
  const cycleRef = useRef(0);

  const selectedTrack = useMemo(
    () => SOUNDSCAPE_TRACKS.find((track) => track.id === selectedTrackId) || SOUNDSCAPE_TRACKS[0],
    [selectedTrackId]
  );

  function stopPlayback() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    cycleRef.current = 0;
    setIsPlaying(false);

    if (masterGainRef.current && audioRef.current) {
      masterGainRef.current.gain.setTargetAtTime(0, audioRef.current.currentTime, 0.05);
    }
  }

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setTargetAtTime(volume, audioRef.current.currentTime, 0.08);
    }
  }, [volume]);

  useEffect(() => () => stopPlayback(), []);

  const scheduleChord = (context, masterGain, track, notes, startTime, duration) => {
    notes.forEach((note, index) => {
      const oscillator = context.createOscillator();
      const noteGain = context.createGain();
      const frequency = noteToFrequency(note);
      const stagger = index * 0.012;
      const noteStart = startTime + stagger;
      const noteEnd = noteStart + duration;

      oscillator.type = track.wave;
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      oscillator.detune.setValueAtTime((index - 1) * 3, noteStart);

      noteGain.gain.setValueAtTime(0, noteStart);
      noteGain.gain.linearRampToValueAtTime(track.gain, noteStart + 0.04);
      noteGain.gain.setTargetAtTime(0, noteEnd - 0.08, 0.05);

      oscillator.connect(noteGain).connect(masterGain);
      oscillator.start(noteStart);
      oscillator.stop(noteEnd + 0.2);
    });
  };

  const scheduleLoop = (track) => {
    const context = audioRef.current;
    const masterGain = masterGainRef.current;
    if (!context || !masterGain) return;

    const pattern = track.pattern;
    const beatSeconds = track.tempoMs / 1000;
    const startTime = context.currentTime + 0.08;
    const cycle = cycleRef.current;

    pattern.forEach((notes, index) => {
      scheduleChord(context, masterGain, track, notes, startTime + index * beatSeconds, beatSeconds * 0.92);
    });

    cycleRef.current = cycle + 1;
    timeoutRef.current = window.setTimeout(
      () => scheduleLoop(track),
      Math.max(800, pattern.length * track.tempoMs - 120)
    );
  };

  const startPlayback = async () => {
    if (!audioRef.current) {
      const context = createAudioContext();
      if (!context) return;
      const masterGain = context.createGain();
      masterGain.gain.value = volume;
      masterGain.connect(context.destination);
      audioRef.current = context;
      masterGainRef.current = masterGain;
    }

    if (audioRef.current.state === 'suspended') {
      await audioRef.current.resume();
    }

    masterGainRef.current.gain.setTargetAtTime(volume, audioRef.current.currentTime, 0.05);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    cycleRef.current = 0;
    setIsPlaying(true);
    scheduleLoop(selectedTrack);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      void startPlayback();
    }
  };

  const handleTrackChange = (event) => {
    const nextTrackId = event.target.value;
    setSelectedTrackId(nextTrackId);

    if (isPlaying) {
      stopPlayback();
    }
  };

  return (
    <div className="cyber-card soundscape-console">
      <div className="card-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Music size={15} /> Soundscape
        </span>
      </div>

      <div className="soundscape-now">
        <span>{selectedTrack.title}</span>
        <span>{selectedTrack.role}</span>
      </div>

      <select
        className="soundscape-select"
        value={selectedTrackId}
        onChange={handleTrackChange}
        aria-label="Select soundscape track"
      >
        {SOUNDSCAPE_TRACKS.map((track) => (
          <option key={track.id} value={track.id}>
            {track.shortTitle} - {track.role}
          </option>
        ))}
      </select>

      <div className="soundscape-controls">
        <button className="cyber-button amber" onClick={togglePlayback} style={{ flex: '1 1 auto' }}>
          {isPlaying ? <Pause size={14} /> : <Play size={14} />} {isPlaying ? 'Pause' : 'Play'}
        </button>
        <label className="soundscape-volume">
          <Volume2 size={14} />
          <input
            type="range"
            min="0"
            max="0.6"
            step="0.02"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            aria-label="Soundscape volume"
          />
        </label>
      </div>

      <p className="soundscape-credit">
        Suggested: {SOUNDSCAPE_TRACKS.find((track) => track.id === suggestedTrackId)?.shortTitle}. Procedural arrangements based on public-domain Mutopia score editions.
      </p>
    </div>
  );
}
