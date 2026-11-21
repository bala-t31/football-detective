import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * A night pitch under floodlights: deep turf with mowing stripes receding into the distance,
 * and four floodlight blooms that switch on, one after another, the first time the app opens.
 * Everything is gradients + transforms (no filters), so it stays cheap on Android WebViews.
 */
const LIGHTS = [
  { left: '-18%', top: '-22%', size: '78vmax', color: 'rgb(226 238 255 / 0.30)', delay: 0.1 },
  { left: '62%', top: '-26%', size: '72vmax', color: 'rgb(226 238 255 / 0.24)', delay: 0.35 },
  { left: '18%', top: '-38%', size: '60vmax', color: 'rgb(120 240 190 / 0.16)', delay: 0.6 },
  { left: '70%', top: '55%', size: '70vmax', color: 'rgb(75 227 160 / 0.12)', delay: 0.85 },
];

let switchedOn = false;

export const PitchBackdrop = memo(function PitchBackdrop() {
  const reduce = useReducedMotion();
  const firstLoad = !switchedOn && !reduce;
  switchedOn = true;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-pitch-950" aria-hidden>
      {/* Turf: vertical gradient from dark sky to lit grass */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#050c0a_0%,#08170f_35%,#0d2a1d_72%,#0a1d14_100%)]" />

      {/* Mowing stripes, laid in perspective so they recede toward the stands */}
      <div className="absolute inset-x-[-40%] bottom-[-10%] h-[75%] [perspective:700px]">
        <div
          className="h-full w-full origin-bottom [transform:rotateX(58deg)]"
          style={{
            background:
              'repeating-linear-gradient(90deg, rgb(255 255 255 / 0.05) 0 9%, rgb(0 0 0 / 0.0) 9% 18%)',
            maskImage: 'linear-gradient(to top, black 10%, transparent 85%)',
            WebkitMaskImage: 'linear-gradient(to top, black 10%, transparent 85%)',
          }}
        />
      </div>

      {/* Floodlights */}
      {LIGHTS.map((l, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full animate-drift"
          style={{
            left: l.left,
            top: l.top,
            width: l.size,
            height: l.size,
            background: `radial-gradient(closest-side, ${l.color}, transparent 72%)`,
            animationDelay: `${i * -4}s`,
          }}
          initial={firstLoad ? { opacity: 0 } : false}
          animate={{ opacity: firstLoad ? [0, 0.55, 0.25, 1] : 1 }}
          transition={{ delay: l.delay, duration: 0.9, times: [0, 0.25, 0.4, 1], ease: 'easeOut' }}
        />
      ))}

      {/* Vignette keeps text contrast at the edges */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_30%,transparent_40%,rgb(0_0_0/0.55)_100%)]" />
    </div>
  );
});
