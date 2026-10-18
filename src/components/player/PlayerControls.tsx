import { CSSProperties, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { Player, SPEED_LABELS } from './usePlayer';

interface PlayerControlsProps {
  player: Player;
  accent: string;
  /** Listen for Space / ← / → on the whole page */
  keyboard?: boolean;
  className?: string;
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

/**
 * Play / pause, step, scrub and speed controls for a Player
 */
function PlayerControls({ player, accent, keyboard = true, className = '' }: PlayerControlsProps) {
  const { index, total, playing, atEnd } = player;
  // Latest player for the key handler, so we subscribe once instead of every frame
  const latest = useRef(player);
  latest.current = player;

  useEffect(() => {
    if (!keyboard) return;
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === ' ' && (e.target as HTMLElement)?.tagName !== 'BUTTON') {
        e.preventDefault();
        latest.current.toggle();
      } else if (e.key === 'ArrowRight') {
        latest.current.stepForward();
      } else if (e.key === 'ArrowLeft') {
        latest.current.stepBack();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [keyboard]);

  const fill = total > 1 ? (index / (total - 1)) * 100 : 0;
  const iconButton =
    'flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 ${className}`}>
      <div className="flex items-center gap-1">
        <button type="button" className={iconButton} onClick={player.restart} disabled={index === 0} aria-label="Back to start" title="Back to start">
          <RotateCcw size={17} />
        </button>
        <button type="button" className={iconButton} onClick={player.stepBack} disabled={index === 0} aria-label="Previous step" title="Previous step (←)">
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={player.toggle}
          className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-card transition-transform active:scale-95"
          style={{ backgroundColor: accent }}
          aria-label={playing ? 'Pause' : atEnd ? 'Replay' : 'Play'}
          title={playing ? 'Pause (space)' : 'Play (space)'}
        >
          {playing ? <Pause size={20} fill="currentColor" /> : atEnd ? <RotateCcw size={19} /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
        </button>
        <button type="button" className={iconButton} onClick={player.stepForward} disabled={atEnd} aria-label="Next step" title="Next step (→)">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <input
          type="range"
          min={0}
          max={Math.max(0, total - 1)}
          value={index}
          onChange={(e) => {
            player.pause();
            player.seek(Number(e.target.value));
          }}
          className="range min-w-0 flex-1"
          style={{ '--fill': `${fill}%`, '--accent': accent } as CSSProperties}
          aria-label="Scrub through steps"
        />
        <span className="w-20 flex-shrink-0 text-right text-xs tabular-nums text-ink-mute">
          {index + 1} / {total}
        </span>
      </div>

      <div className="flex flex-shrink-0 rounded-full border border-line bg-paper/60 p-0.5" role="radiogroup" aria-label="Speed">
        {SPEED_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={player.speed === i}
            onClick={() => player.setSpeed(i)}
            className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
              player.speed === i ? 'bg-card text-ink shadow-card' : 'text-ink-mute hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PlayerControls;
