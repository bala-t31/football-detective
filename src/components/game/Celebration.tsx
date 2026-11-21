import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

/** Lightweight confetti burst for victories — pure framer-motion, no canvas. */
export function Confetti() {
  const reduce = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * Math.min(520, window.innerWidth * 0.9),
        y: -(160 + Math.random() * 240),
        r: Math.random() * 540 - 270,
        size: 5 + Math.random() * 6,
        color: ['#B7FF35', '#4ADE80', '#F4F6F3', '#FACC15'][i % 4],
        delay: Math.random() * 0.15,
      })),
    [],
  );
  if (reduce) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      <div className="absolute left-1/2 top-[30%]">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute block rounded-[2px]"
          style={{ width: p.size, height: p.size * 0.45, background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 420], opacity: [1, 1, 0], rotate: p.r }}
          transition={{ duration: 1.8, delay: p.delay, ease: [0.2, 0.7, 0.4, 1], times: [0, 0.35, 1] }}
        />
      ))}
      </div>
    </div>
  );
}
