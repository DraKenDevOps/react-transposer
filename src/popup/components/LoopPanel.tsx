interface LoopPanelProps {
    enabled: boolean;
    loopStart: number;
    loopEnd: number;
    currentTime: number;
    onToggle: (enabled: boolean) => void;
    onSetStart: () => void;
    onSetEnd: () => void;
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export function LoopPanel({ enabled, loopStart, loopEnd, currentTime, onToggle, onSetStart, onSetEnd }: LoopPanelProps) {
    return (
        <div className="flex flex-col gap-2 rounded-lg bg-neutral-900 p-3">
            <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer">
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => onToggle(e.target.checked)}
                    className="rounded border-red-800 bg-neutral-800 text-red-500 focus:ring-red-500"
                />
                Loop
            </label>

            {enabled && (
                <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
                    <button
                        onClick={onSetStart}
                        className="flex-1 rounded bg-neutral-800 px-2 py-1.5 text-center text-neutral-300 hover:bg-red-900 hover:text-red-200 transition-colors"
                    >
                        {formatTime(loopStart)}
                    </button>
                    <span className="text-red-400/60">&mdash;</span>
                    <button
                        onClick={onSetEnd}
                        className="flex-1 rounded bg-neutral-800 px-2 py-1.5 text-center text-neutral-300 hover:bg-red-900 hover:text-red-200 transition-colors"
                    >
                        {loopEnd > 0 ? formatTime(loopEnd) : formatTime(currentTime)}
                    </button>
                </div>
            )}
        </div>
    );
}
