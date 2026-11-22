import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { EASE_OUT, MOTION, isReducedMotion } from '@/ui/motion';

/**
 * A headline number that rolls from its previous value to the new one. Use it for the one number
 * that matters on a screen; small figures elsewhere change instantly.
 */
export function AnimatedNumber({ value, duration = MOTION.number, className }: { value: number; duration?: number; className?: string }) {
  const [display, setDisplay] = useState(() => (isReducedMotion() ? value : 0));
  const from = useRef(display);

  useEffect(() => {
    if (isReducedMotion()) {
      from.current = value;
      setDisplay(value);
      return;
    }
    const controls = animate(from.current, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => {
        from.current = v;
        setDisplay(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value, duration]);

  return <span className={className}>{display.toLocaleString()}</span>;
}
