import { useEffect, useState, useCallback } from 'react';
import type { PlayerSettings, MediaState } from '../types';
import { loadSettings, saveSettings } from '../storage/settings';
import { Slider } from './components/Slider';
import { Transport } from './components/Transport';
import { LoopPanel } from './components/LoopPanel';

async function getActiveTab(): Promise<number | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id ?? null;
}

function sendMsg(tabId: number, msg: Record<string, unknown>): void {
  try { chrome.tabs.sendMessage(tabId, msg).catch(() => {}); } catch {}
}

function sendMsgWithCb(tabId: number, msg: Record<string, unknown>, cb: (r: any) => void): void {
  try { chrome.tabs.sendMessage(tabId, msg, cb); } catch {}
}

export default function App() {
  const [tabId, setTabId] = useState<number | null>(null);
  const [settings, setSettings] = useState<PlayerSettings>({
    transpose: 0, pitch: 0, speed: 1,
    loopStart: 0, loopEnd: 0, enabled: true,
  });
  const [state, setState] = useState<MediaState>({ currentTime: 0, duration: 0, paused: true });

  useEffect(() => {
    getActiveTab().then(setTabId);
    loadSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (!tabId) return;
    let dead = false;
    const interval = setInterval(() => {
      if (dead) return;
      sendMsgWithCb(tabId, { type: 'GET_STATE' }, (res) => {
        if (dead) return;
        if (chrome.runtime.lastError) { dead = true; clearInterval(interval); return; }
        if (res) setState(res);
      });
    }, 500);
    return () => { dead = true; clearInterval(interval); };
  }, [tabId]);

  const update = useCallback((update: Partial<PlayerSettings>) => {
    setSettings((prev) => ({ ...prev, ...update }));
    saveSettings(update);
    if (tabId) sendMsg(tabId, { type: 'UPDATE_SETTINGS', payload: update });
  }, [tabId]);

  return (
    <div className="w-[300px] select-none bg-neutral-900 px-4 py-4 text-white flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold tracking-tight">Transposer</h1>
        <span className="text-xs text-neutral-500 font-mono">
          {Math.floor(state.currentTime / 60)}:{String(Math.floor(state.currentTime % 60)).padStart(2, '0')}
          {' / '}
          {Math.floor(state.duration / 60)}:{String(Math.floor(state.duration % 60)).padStart(2, '0')}
        </span>
      </div>

      <Transport
        paused={state.paused}
        onPlayPause={() => {
          if (tabId) sendMsg(tabId, { type: 'TOGGLE_PLAY' });
        }}
        onForward={() => {
          if (tabId) sendMsg(tabId, { type: 'SEEK', payload: { delta: SPEED_STEP } });
        }}
        onBackward={() => {
          if (tabId) sendMsg(tabId, { type: 'SEEK', payload: { delta: -SPEED_STEP } });
        }}
      />

      <Slider
        label="Speed"
        value={settings.speed}
        min={0.25}
        max={4}
        step={0.01}
        defaultValue={1}
        format={(v) => `${v.toFixed(2)}x`}
        onChange={(v) => update({ speed: v })}
      />

      <LoopPanel
        enabled={settings.enabled}
        loopStart={settings.loopStart}
        loopEnd={settings.loopEnd}
        currentTime={state.currentTime}
        onToggle={(enabled) => {
          update({ enabled });
          if (!enabled) update({ loopEnd: 0 });
        }}
        onSetStart={() => update({ loopStart: state.currentTime })}
        onSetEnd={() => update({ loopEnd: state.currentTime })}
      />

      <div className="border-t border-neutral-800 pt-3 flex flex-col gap-3">
        <Slider
          label="Transpose"
          value={settings.transpose}
          min={-12}
          max={12}
          step={1}
          defaultValue={0}
          format={(v) => `${v > 0 ? '+' : ''}${v} st`}
          onChange={(v) => update({ transpose: v })}
        />
        <Slider
          label="Pitch"
          value={settings.pitch}
          min={-12}
          max={12}
          step={1}
          defaultValue={0}
          format={(v) => `${v > 0 ? '+' : ''}${v} st`}
          onChange={(v) => update({ pitch: v })}
        />
      </div>
    </div>
  );
}

const SPEED_STEP = 5;
