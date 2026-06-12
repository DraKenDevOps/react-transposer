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

# Todo
```text
[ ] Install dependencies (tailwindcss, @tailwindcss/vite, soundtouchjs, @types/chrome)
[ ] Create directory structure following GUIDE.md
[ ] Write types (src/types/index.ts)
[ ] Write storage utilities (src/storage/settings.ts)
[ ] Write shared messaging (src/shared/messaging.ts)
[ ] Write background service worker (src/background/service-worker.ts)
[ ] Write content script (src/content/content.ts)
[ ] Write audio engine stubs (src/audio/AudioEngine.ts, SoundTouchEngine.ts)
[ ] Write popup React components (Slider, Transport, LoopPanel) with {number input, -/+ button}
[ ] Write ui color scheme/theme is black-red
[ ] Write popup App.tsx and main.tsx
[ ] Update vite.config.ts for multi-entry build
[ ] Create manifest.json in public/
[ ] Update index.html for popup entry
[ ] Remove old files (App.css, App.tsx, assets/, icons.svg)
[ ] Verify build succeeds
```

# Implementation
After reading the FAQ, here are the **most important technical lessons** for building your own Transpose-like extension.

# 1. Support Two Audio Modes

This is probably the most important architectural decision.

### Mode A: Direct Media Access (Primary)

Connect directly to the page's audio/video element.

```javascript
const media = document.querySelector("video,audio");

const source =
  audioContext.createMediaElementSource(media);
```

Pros:

* Lower CPU
* Better synchronization
* Can control playback
* Can read current time

This should be your default mode. ([transpose.video][1])

---

### Mode B: Tab Capture (Fallback)

Some websites block access to media elements.

Use:

```javascript
chrome.tabCapture.capture()
```

or

```javascript
navigator.mediaDevices.getDisplayMedia()
```

for tab audio capture.

The FAQ explicitly mentions **Tab Capture mode** as the fallback when direct media access fails. ([transpose.video][1])

---

# 2. Expect "No Media Found"

Many websites will fail because:

* Custom players
* DRM
* Embedded players
* Different iframe domains
* Corporate/school restrictions

Your extension should show:

```text
No media detected

Try:
• Start playback
• Refresh page
• Use Tab Capture Mode
```

instead of failing silently. ([transpose.video][1])

---

# 3. Permission System Matters

Transpose repeatedly mentions:

```text
Allow access
```

This means they dynamically request permissions.

Manifest:

```json
{
  "permissions": [
    "storage",
    "scripting"
  ],
  "host_permissions": []
}
```

Then:

```javascript
chrome.permissions.request({
  origins: ["https://*.youtube.com/*"]
});
```

This is cleaner than requesting `<all_urls>` immediately. ([transpose.video][2])

---

# 4. Audio Latency Is Unavoidable

The FAQ states:

```text
Pitch shifting requires buffering
200-400ms delay
```

for the free version. ([transpose.video][1])

This tells us:

* They're using a buffer-based algorithm
* Real-time pitch shifting isn't instant
* Users must expect latency

Your UI should expose:

```text
Low Latency
Balanced
High Quality
```

processing modes.

---

# 5. Store Settings Per Media

Transpose automatically remembers settings for videos. ([transpose.video][1])

Store:

```ts
interface MediaSettings {
  url: string;

  transpose: number;
  pitch: number;
  speed: number;

  loopStart: number;
  loopEnd: number;
}
```

Save:

```javascript
chrome.storage.local
```

Key:

```text
youtube-video-id
spotify-track-id
```

---

# 6. Auto Save + Auto Reset

Very useful feature.

When new media starts:

```text
Save old state
Load defaults
```

or

```text
Save old state
Load remembered state
```

depending on user preference. ([transpose.video][1])

---

# 7. Marker-Based Looping

Do not store loops as only:

```text
start
end
```

Instead create:

```ts
interface Marker {
  id: string;
  time: number;
  label?: string;
}
```

Then:

```text
A ---- B ---- C ---- D
```

Loop:

```text
A→B
B→C
A→D
```

Transpose's loop system is marker-driven. ([transpose.video][1])

---

# 8. Spotify Special Handling

Important.

FAQ says:

```text
Spotify Connect
will not work
```

if playback happens on another device. ([transpose.video][2])

You must detect:

```text
Playing on:
• This Browser ✓
• Phone
• Desktop App
• Speaker
```

Only browser playback can be processed.

---

# 9. Independent Pitch and Speed

Transpose intentionally separates:

```text
Pitch
Speed
```

because musicians need:

```text
Slow down
Keep key

Change key
Keep tempo
```

This should be core design. ([transpose.video][1])

---

# 10. Future-Pro Features

The FAQ reveals their premium roadmap:

### Formant Control

```text
Pitch changes
Voice stays natural
```

### Vocal Reducer

Likely:

```text
Mid-Side Processing
```

Remove centered vocals.

### Presets

```json
{
  "name": "Practice",
  "pitch": -2,
  "speed": 0.75
}
```

### Clips

```text
Intro
Verse
Solo
Outro
```

Each clip stores its own settings.

### Sequences

```text
Solo @ 50%
↓
Solo @ 75%
↓
Solo @ 100%
```

Practice automation. ([transpose.video][1])

---

# MVP Architecture I Would Build

```text
React Popup
      │
      ▼
Content Script
      │
      ▼
Media Controller
      │
      ├── Direct Media Mode
      │
      └── Tab Capture Mode
                │
                ▼
         AudioContext
                │
                ▼
          SoundTouchJS
                │
                ▼
             Output
```

### Version 0.1

* Play/Pause
* Forward/Backward
* Speed
* Markers
* Loops
* Auto Save
* Auto Reset

### Version 0.2

* Pitch Shift
* Transpose
* Tab Capture Mode
* Spotify Support

### Version 1.0

* AudioWorklet
* WASM DSP
* Formant Control
* Presets
* Clip Sequencing

The biggest takeaway from the FAQ is that **the real complexity is not pitch shifting; it's handling all the edge cases around media detection, permissions, tab capture fallback, latency, and persistence.** Those are the features that make the extension feel reliable across YouTube, Spotify, SoundCloud, and arbitrary websites. ([transpose.video][1])

[1]: https://transpose.video/faq?utm_source=chatgpt.com "FAQ - Transpose"
[2]: https://transpose.video/fa/faq?utm_source=chatgpt.com "FAQ - Transpose"
