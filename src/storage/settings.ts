import type { PlayerSettings } from '../types';

const STORAGE_KEY = 'player_settings';

export const DEFAULT_SETTINGS: PlayerSettings = {
  transpose: 0,
  pitch: 0,
  speed: 1,
  loopStart: 0,
  loopEnd: 0,
  enabled: true,
};

export async function loadSettings(): Promise<PlayerSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEY] as Partial<PlayerSettings>) };
}

export async function saveSettings(
  settings: Partial<PlayerSettings>,
): Promise<void> {
  const current = await loadSettings();
  const merged = { ...current, ...settings };
  await chrome.storage.local.set({ [STORAGE_KEY]: merged });
}
