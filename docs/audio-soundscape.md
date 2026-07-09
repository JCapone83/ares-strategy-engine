# Ares Soundscape Notes

Ares uses a tiny browser-native soundscape, not shipped third-party recordings.
The app schedules short Web Audio note patterns at runtime so the release stays
small, local-first, and free of recording-rights ambiguity.

## Source Editions

The current tracks are short procedural arrangements based on public-domain
Mutopia Project score editions:

| In-App Track | Source Work | Mutopia Source | Use |
|---|---|---|---|
| Mission Control Prelude | J. S. Bach, Well-Tempered Clavier I, Prelude I, BWV 846 | https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=5 | Menu / steady-state command |
| Crisis Grave | L. V. Beethoven, Piano Sonata No. 8 "Pathetique", I. Grave | https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=299 | High-pressure crisis deliberation |
| Final Telemetry Suite | J. S. Bach, Cello Suite No. 1, BWV 1007 | https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=517 | Results / final score reflection |

## Release Policy

- No MP3, OGG, or WAV recordings are bundled for these tracks.
- No Mutopia MIDI files are redistributed in this repository.
- The in-app tracks are minimal synthesized arrangements, not faithful recordings.
- If future releases ship rendered audio files, each recording should get its own
  source URL, license note, and hash.
