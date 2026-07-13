import { useEffect, useState } from 'react';

function computeRemainingMs(targetIso: string): number {
  const remainingMs = new Date(targetIso).getTime() - Date.now();
  return Number.isFinite(remainingMs) ? Math.max(remainingMs, 0) : 0;
}

/** Milliseconds remaining until `targetIso`, ticking down every second. */
export function useCountdown(targetIso: string): number {
  const [prevTargetIso, setPrevTargetIso] = useState(targetIso);
  const [remainingMs, setRemainingMs] = useState(() =>
    computeRemainingMs(targetIso),
  );

  // targetIso can start out '' (e.g. a deal is still loading) and only
  // become valid after mount - adjust state during render so the value is
  // correct on the very next paint instead of waiting up to a second for
  // the interval below to tick. This is React's documented pattern for
  // resetting state in response to a prop change, so it doesn't cause the
  // cascading extra render an effect-body setState call would.
  if (targetIso !== prevTargetIso) {
    setPrevTargetIso(targetIso);
    setRemainingMs(computeRemainingMs(targetIso));
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs(computeRemainingMs(targetIso));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  return remainingMs;
}
