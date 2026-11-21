import { useEffect, useState } from 'react';
import { msUntilLocalMidnight, toDateKey } from '@/utils/date';

/** Ticks every second; also reports when the local date rolls over. */
export function useMidnightCountdown() {
  const [ms, setMs] = useState(() => msUntilLocalMidnight());
  const [date, setDate] = useState(toDateKey);
  useEffect(() => {
    const t = window.setInterval(() => {
      setMs(msUntilLocalMidnight());
      const now = toDateKey();
      setDate((d) => (d === now ? d : now));
    }, 1000);
    return () => window.clearInterval(t);
  }, []);
  return { ms, date };
}
