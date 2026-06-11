# React Transposer

A Chrome extension for real-time audio transposition, pitch shifting, and speed control on any `<video>` or `<audio>` element across the web.

## Status

**Under development.** Scaffolded with Vite + React 19 + TypeScript. See [GUIDE.md](./GUIDE.md) for the full build plan.

## Roadmap

- **v0.1** — Play/Pause, Forward/Backward, Speed, Loop, Settings persistence
- **v0.2** — SoundTouch DSP, Pitch Shift, Transpose, Markers
- **v0.3** — AudioWorklet, better DSP, Spotify support
- **v1.0** — WASM DSP, Formant Control, Premium features

## Tech Stack

React 19 · TypeScript · Vite · TailwindCSS · Chrome Manifest V3 · Web Audio API · SoundTouchJS · Chrome Storage API

## Getting Started

```bash
npm install
npm run dev
```

Load the `dist/` folder as an unpacked Chrome extension.
