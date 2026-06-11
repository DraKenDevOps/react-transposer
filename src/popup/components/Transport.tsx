interface TransportProps {
  paused: boolean;
  onPlayPause: () => void;
  onForward: () => void;
  onBackward: () => void;
}

export function Transport({ paused, onPlayPause, onForward, onBackward }: TransportProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={onBackward}
        className="size-9 flex items-center justify-center rounded-full bg-neutral-700 hover:bg-neutral-600 text-white text-xs transition-colors"
        title="-5s"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      </button>

      <button
        onClick={onPlayPause}
        className="size-10 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        title={paused ? 'Play' : 'Pause'}
      >
        {paused ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        )}
      </button>

      <button
        onClick={onForward}
        className="size-9 flex items-center justify-center rounded-full bg-neutral-700 hover:bg-neutral-600 text-white text-xs transition-colors"
        title="+5s"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      </button>
    </div>
  );
}
