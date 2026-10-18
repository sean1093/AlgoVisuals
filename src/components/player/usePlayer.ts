import { useCallback, useEffect, useState } from 'react';

/** Delay per step (ms) for each speed setting, slowest first */
export const DEFAULT_SPEEDS = [800, 350, 120, 25];

export interface Player {
  index: number;
  total: number;
  playing: boolean;
  atEnd: boolean;
  speed: number;
  setSpeed: (speed: number) => void;
  toggle: () => void;
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBack: () => void;
  seek: (index: number) => void;
  restart: () => void;
}

interface Options {
  /** Changing this rewinds to the first frame (e.g. a new input array) */
  resetKey?: unknown;
  /** Delay per step for each speed setting */
  speeds?: number[];
  initialSpeed?: number;
  autoPlay?: boolean;
}

/**
 * Steps through `total` precomputed frames, like a tiny video player
 */
export function usePlayer(total: number, { resetKey, speeds = DEFAULT_SPEEDS, initialSpeed = 1, autoPlay = false }: Options = {}): Player {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(initialSpeed);
  const last = Math.max(0, total - 1);
  const atEnd = index >= last;

  // Rewind when the input changes
  useEffect(() => {
    setIndex(0);
    setPlaying(autoPlay);
  }, [resetKey, autoPlay]);

  useEffect(() => {
    if (!playing) return;
    if (index >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setIndex((i) => Math.min(i + 1, last)), speeds[speed]);
    return () => clearTimeout(t);
  }, [playing, index, last, speed, speeds]);

  const play = useCallback(() => {
    // Pressing play at the end starts over
    setIndex((i) => (i >= last ? 0 : i));
    setPlaying(true);
  }, [last]);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => (playing ? pause() : play()), [playing, play, pause]);
  const stepForward = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.min(i + 1, last));
  }, [last]);
  const stepBack = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);
  const seek = useCallback((i: number) => setIndex(Math.max(0, Math.min(i, last))), [last]);
  const restart = useCallback(() => {
    setPlaying(false);
    setIndex(0);
  }, []);

  return {
    index: Math.min(index, last),
    total,
    playing,
    atEnd,
    speed,
    setSpeed,
    toggle,
    play,
    pause,
    stepForward,
    stepBack,
    seek,
    restart,
  };
}
