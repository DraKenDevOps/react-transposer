import type { PlayerSettings } from "../types";

export const DEFAULT_SETTINGS: PlayerSettings = {
    transpose: 0,
    pitch: 0,
    speed: 1,
    loopStart: 0,
    loopEnd: 0,
    enabled: true,
    markers: []
};

function storageKey(url: string): string {
    return `settings:${url}`;
}

export async function loadSettings(url: string): Promise<PlayerSettings> {
    const result = await chrome.storage.local.get(storageKey(url));
    return { ...DEFAULT_SETTINGS, ...(result[storageKey(url)] as Partial<PlayerSettings>) };
}

export async function saveSettings(url: string, settings: Partial<PlayerSettings>): Promise<void> {
    const current = await loadSettings(url);
    const merged = { ...current, ...settings };
    await chrome.storage.local.set({ [storageKey(url)]: merged });
}

export async function getAllMediaKeys(): Promise<string[]> {
    const all = await chrome.storage.local.get(null);
    return Object.keys(all)
        .filter((k) => k.startsWith("settings:"))
        .map((k) => k.slice(9));
}
