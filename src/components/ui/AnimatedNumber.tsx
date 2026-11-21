import { useEffect, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

export function AnimatedNumber({ value, duration = 1.1, className }: { value: number; duration?: number; className?: string }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setDisplay(Math.round(v)) });
    return () => controls.stop();
  }, [value, duration, reduce]);

  return <span className={className}>{display.toLocaleString()}</span>;
}
