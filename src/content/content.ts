import type { PlayerSettings, MediaState } from "../types";
import { loadSettings, saveSettings } from "../storage/settings";

let media: HTMLMediaElement | null = null;
let pageUrl = location.href;
let settings: PlayerSettings = {
    transpose: 0,
    pitch: 0,
    speed: 1,
    loopStart: 0,
    loopEnd: 0,
    enabled: true,
    markers: []
};
let loopInterval: ReturnType<typeof setInterval> | null = null;

loadSettings(pageUrl).then((s) => {
    settings = s;
    media = findMedia();
    if (media) {
        applySpeed();
        startLoop();
    }
});

function findMedia(): HTMLMediaElement | null {
    return document.querySelector("video,audio");
}

function startLoop(): void {
    if (loopInterval) clearInterval(loopInterval);
    if (!settings.enabled || settings.loopEnd <= 0) return;

    loopInterval = setInterval(() => {
        if (!media) return;
        if (media.currentTime >= settings.loopEnd) {
            media.currentTime = settings.loopStart;
        }
    }, 100);
}

function applySpeed(): void {
    if (!media) return;
    media.playbackRate = settings.speed;
}

function getMediaState(): MediaState {
    if (!media) return { hasMedia: false, currentTime: 0, duration: 0, paused: true };
    return {
        hasMedia: true,
        currentTime: media.currentTime,
        duration: media.duration || 0,
        paused: media.paused
    };
}

function updateSettings(update: Partial<PlayerSettings>): void {
    settings = { ...settings, ...update };
    saveSettings(pageUrl, update);
    applySpeed();
    startLoop();
}

function togglePlay(): void {
    if (!media) return;
    if (media.paused) media.play();
    else media.pause();
}

function seek(delta: number): void {
    if (!media) return;
    media.currentTime = Math.max(0, media.currentTime + delta);
}

chrome.runtime.onMessage.addListener((message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
    try {
        switch (message.type) {
            case "TOGGLE_PLAY":
                togglePlay();
                sendResponse(getMediaState());
                break;
            case "SEEK":
                seek(message.payload.delta);
                sendResponse(getMediaState());
                break;
            case "UPDATE_SETTINGS":
                updateSettings(message.payload);
                sendResponse({ success: true });
                break;
            case "GET_STATE":
                sendResponse(getMediaState());
                break;
        }
    } catch (err) {
        console.error("Chrome error listen runtime", err);
    }
});

media = findMedia();
if (media) {
    applySpeed();
    startLoop();
}

let dead = false;
setInterval(() => {
    if (dead) return;
    const state = getMediaState();
    try {
        chrome.runtime.sendMessage({ type: "STATE_UPDATE", payload: state }, () => {
            if (chrome.runtime.lastError) dead = true;
        });
    } catch {
        dead = true;
    }
}, 250);

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        media = findMedia();
        if (media) {
            applySpeed();
            startLoop();
        }
    }
});
