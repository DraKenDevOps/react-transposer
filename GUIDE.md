# React Transposer

The fastest path to a working MVP.

## Tech Stack

```text
React 19
TypeScript
Vite
TailwindCSS
Chrome Manifest V3
Web Audio API
SoundTouchJS
Chrome Storage API
```

## Project Structure

```text
transpose-extension/
├── public/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
├── src/
│   ├── popup/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── components/
│   │       ├── Slider.tsx
│   │       ├── Transport.tsx
│   │       └── LoopPanel.tsx
│   │
│   ├── content/
│   │   └── content.ts
│   │
│   ├── background/
│   │   └── service-worker.ts
│   │
│   ├── audio/
│   │   ├── AudioEngine.ts
│   │   └── SoundTouchEngine.ts
│   │
│   ├── storage/
│   │   └── settings.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   └── shared/
│       └── messaging.ts
│
├── manifest.json
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Create Project

```bash
npm create vite@latest transpose-extension -- --template react-ts

cd transpose-extension

npm install

npm install \
tailwindcss \
@tailwindcss/vite \
soundtouchjs

npm install -D \
@types/chrome
```

---

## manifest.json

```json
{
  "manifest_version": 3,
  "name": "Transpose MVP",
  "version": "1.0.0",

  "permissions": [
    "storage",
    "tabs",
    "activeTab",
    "scripting"
  ],

  "host_permissions": [
    "<all_urls>"
  ],

  "background": {
    "service_worker": "src/background/service-worker.js"
  },

  "action": {
    "default_popup": "index.html"
  },

  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content/content.js"]
    }
  ]
}
```

---

## Settings Model

```ts
export interface PlayerSettings {
  transpose: number;
  pitch: number;
  speed: number;

  loopStart: number;
  loopEnd: number;

  enabled: boolean;
}
```

Default:

```ts
export const DEFAULT_SETTINGS = {
  transpose: 0,
  pitch: 0,
  speed: 1,

  loopStart: 0,
  loopEnd: 0,

  enabled: true
};
```

---

## Content Script

Find active media:

```ts
let media: HTMLMediaElement | null = null;

function getMedia() {
  return document.querySelector(
    "video,audio"
  ) as HTMLMediaElement;
}

media = getMedia();
```

Play:

```ts
media?.play();
```

Pause:

```ts
media?.pause();
```

Forward:

```ts
media!.currentTime += 5;
```

Backward:

```ts
media!.currentTime -= 5;
```

---

## Loop Engine

```ts
setInterval(() => {
  if (!media) return;

  if (
    settings.loopEnd > 0 &&
    media.currentTime >= settings.loopEnd
  ) {
    media.currentTime = settings.loopStart;
  }
}, 100);
```

---

## Speed Control

```ts
media.playbackRate = settings.speed;
```

Range:

```text
0.25x
0.5x
0.75x
1x
1.25x
1.5x
2x
4x
```

---

## Popup UI State

```ts
const [transpose, setTranspose] =
  useState(0);

const [pitch, setPitch] =
  useState(0);

const [speed, setSpeed] =
  useState(1);
```

Send updates:

```ts
chrome.tabs.sendMessage(tabId, {
  type: "UPDATE_SETTINGS",
  payload: {
    transpose,
    pitch,
    speed
  }
});
```

---

## SoundTouch Integration

Install:

```bash
npm install soundtouchjs
```

Skeleton:

```ts
import {
  SoundTouch
} from "soundtouchjs";

const soundTouch =
  new SoundTouch(sampleRate);

soundTouch.pitchSemitones =
  settings.transpose;
```

Later we'll connect this to an AudioContext pipeline.

---

## MVP Milestone

Version 0.1 should support:

✅ Play/Pause

✅ Forward/Backward

✅ Speed

✅ Loop

✅ Save settings

UI similar to screenshot

Then add:

```text
v0.2
 ├── SoundTouch
 ├── Pitch Shift
 ├── Transpose
 └── Markers

v0.3
 ├── AudioWorklet
 ├── Better DSP
 └── Spotify Support

v1.0
 ├── WASM DSP
 ├── Formant Control
 └── Premium Features
```

A good next step is generating the complete starter repository (all files with working code and build configuration) so you can run:

```bash
npm install
npm run dev
```

and load it directly as a Chrome extension.
