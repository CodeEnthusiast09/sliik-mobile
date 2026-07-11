import { useEffect, useState } from 'react';

/** Milliseconds remaining until `targetIso`, ticking down every second. */
export function useCountdown(targetIso: string): number {
  const [remainingMs, setRemainingMs] = useState(
    () => new Date(targetIso).getTime() - Date.now(),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs(new Date(targetIso).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  return Math.max(remainingMs, 0);
}
