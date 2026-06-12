interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
    format?: (v: number) => string;
    onChange: (value: number) => void;
}

export function Slider({ label, value, min, max, step, defaultValue, format, onChange }: SliderProps) {
    const display = format ? format(value) : String(value);
    const isDefault = value === defaultValue;

    return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{label}</span>
              <span className="flex items-center gap-1.5">
                  <span className="font-mono tabular-nums text-white">{display}</span>
                  {!isDefault && (
                      <button
                          type="button"
                          onClick={() => onChange(defaultValue)}
                          className="size-4 flex items-center justify-center rounded bg-neutral-800 text-[10px] text-red-400 hover:bg-red-900 hover:text-red-200 transition-colors"
                          title={`Reset to ${defaultValue}`}
                      >
                          &#x21BA;
                      </button>
                  )}
              </span>
          </div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))}
                    className="size-5 flex items-center justify-center rounded bg-neutral-800 text-xs text-neutral-400 hover:bg-red-900 hover:text-red-200 disabled:opacity-30 transition-colors"
                    disabled={value <= min}
                >
                    &minus;
                </button>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="flex-1 h-1.5 appearance-none rounded-full bg-neutral-800 accent-red-500 cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:shadow"
                />
                <button
                    type="button"
                    onClick={() => onChange(Math.min(max, +(value + step).toFixed(2)))}
                    className="size-5 flex items-center justify-center rounded bg-neutral-800 text-xs text-neutral-400 hover:bg-red-900 hover:text-red-200 disabled:opacity-30 transition-colors"
                    disabled={value >= max}
                >
                    +
                </button>
            </div>
        </div>
    );
}
