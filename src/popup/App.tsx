import { useEffect, useState, useCallback } from "react";
import type { PlayerSettings, MediaState } from "../types";
import { loadSettings, saveSettings } from "../storage/settings";
import { Slider } from "./components/Slider";
import { Transport } from "./components/Transport";
import { LoopPanel } from "./components/LoopPanel";

async function getActiveTabInfo(): Promise<{ id: number; url: string } | null> {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) return null;
        return { id: tab.id, url: tab.url ?? "" };
    } catch {
        return null;
    }
}

function sendMsg(tabId: number, msg: Record<string, unknown>): void {
    try {
        chrome.tabs.sendMessage(tabId, msg).catch(() => {});
    } catch {}
}

function sendMsgWithCb(tabId: number, msg: Record<string, unknown>, cb: (r: any) => void): void {
    try {
        chrome.tabs.sendMessage(tabId, msg, cb);
    } catch {}
}

const NO_MEDIA: MediaState = { hasMedia: false, currentTime: 0, duration: 0, paused: true };

export default function App() {
    const [tabInfo, setTabInfo] = useState<{ id: number; url: string } | null>(null);
    const [settings, setSettings] = useState<PlayerSettings>({
        transpose: 0,
        pitch: 0,
        speed: 1,
        loopStart: 0,
        loopEnd: 0,
        enabled: true,
        markers: []
    });
    const [state, setState] = useState<MediaState>(NO_MEDIA);

    useEffect(() => {
        getActiveTabInfo().then((info) => {
            if (!info) return;
            setTabInfo(info);
            loadSettings(info.url).then(setSettings);
        });
    }, []);

    useEffect(() => {
        if (!tabInfo) return;
        let dead = false;
        const interval = setInterval(() => {
            if (dead) return;
            sendMsgWithCb(tabInfo.id, { type: "GET_STATE" }, (res) => {
                if (dead) return;
                if (chrome.runtime.lastError) {
                    dead = true;
                    clearInterval(interval);
                    return;
                }
                if (res) setState(res);
            });
        }, 500);
        return () => {
            dead = true;
            clearInterval(interval);
        };
    }, [tabInfo]);

    const update = useCallback(
        (update: Partial<PlayerSettings>) => {
            setSettings((prev) => ({ ...prev, ...update }));
            if (tabInfo) saveSettings(tabInfo.url, update);
            if (tabInfo) sendMsg(tabInfo.id, { type: "UPDATE_SETTINGS", payload: update });
        },
        [tabInfo]
    );

    if (!state.hasMedia) {
        return (
            <div className="w-[300px] select-none bg-black px-4 py-6 text-white flex flex-col items-center gap-3 text-center">
                <div className="size-10 rounded-full bg-neutral-900 flex items-center justify-center">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-red-400"
                    >
                        <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-neutral-200">No media detected</p>
                <p className="text-xs text-neutral-500 leading-relaxed">
                    Try starting playback on the page,
                    <br />
                    then refresh or reopen this popup.
                </p>
            </div>
        );
    }

    return (
        <div className="w-[300px] select-none bg-black px-4 py-4 text-white flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-sm font-semibold tracking-tight">Transposer</h1>
                <span className="text-xs text-red-400/70 font-mono">
                    {Math.floor(state.currentTime / 60)}:{String(Math.floor(state.currentTime % 60)).padStart(2, "0")}
                    {" / "}
                    {Math.floor(state.duration / 60)}:{String(Math.floor(state.duration % 60)).padStart(2, "0")}
                </span>
            </div>

            <Transport
                paused={state.paused}
                onPlayPause={() => {
                    if (tabInfo) sendMsg(tabInfo.id, { type: "TOGGLE_PLAY" });
                }}
                onForward={() => {
                    if (tabInfo) sendMsg(tabInfo.id, { type: "SEEK", payload: { delta: SPEED_STEP } });
                }}
                onBackward={() => {
                    if (tabInfo) sendMsg(tabInfo.id, { type: "SEEK", payload: { delta: -SPEED_STEP } });
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

            <div className="border-t border-red-900 pt-3 flex flex-col gap-3">
                <Slider
                    label="Transpose"
                    value={settings.transpose}
                    min={-12}
                    max={12}
                    step={1}
                    defaultValue={0}
                    format={(v) => `${v > 0 ? "+" : ""}${v} st`}
                    onChange={(v) => update({ transpose: v })}
                />
                <Slider
                    label="Pitch"
                    value={settings.pitch}
                    min={-12}
                    max={12}
                    step={1}
                    defaultValue={0}
                    format={(v) => `${v > 0 ? "+" : ""}${v} st`}
                    onChange={(v) => update({ pitch: v })}
                />
            </div>
        </div>
    );
}

const SPEED_STEP = 5;
