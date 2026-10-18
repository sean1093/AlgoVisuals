import { useEffect, useMemo, useState } from 'react';
import { SORTERS, makeInput } from '../../algorithms/sorting/logic';
import Bars from '../../algorithms/sorting/Bars';

/**
 * Endlessly sorts a fresh list with insertion sort — a live hero illustration
 */
function HeroSortLoop({ className = '' }: { className?: string }) {
  const [round, setRound] = useState(0);
  const frames = useMemo(() => SORTERS.insertion(makeInput(14, 'random')), [round]);
  const [i, setI] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setI(frames.length - 1);
      return;
    }
    const atEnd = i >= frames.length - 1;
    const t = setTimeout(
      () => {
        if (atEnd) {
          setRound((r) => r + 1);
          setI(0);
        } else setI(i + 1);
      },
      atEnd ? 1800 : 110
    );
    return () => clearTimeout(t);
  }, [i, frames]);

  return <Bars frame={frames[Math.min(i, frames.length - 1)]} className={className} />;
}

export default HeroSortLoop;
