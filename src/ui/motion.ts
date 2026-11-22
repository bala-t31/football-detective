/**
 * Motion tokens: the single source of truth for how things move.
 *
 * The rule: motion explains a change, it never decorates. One thing moves at a time, everything
 * eases out (no bounce), nothing loops, nothing runs longer than 0.7 s, and with reduced motion
 * every value appears in its final state. Change a value here and the whole app follows.
 */
import type { Transition, Variants } from 'framer-motion';

/** The one curve used everywhere: decelerates gently into place. */
export const EASE_OUT = [0.22, 0.7, 0.2, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const MOTION = {
  /** A block rises and fades in. */
  enter: 0.42,
  /** Gap between blocks on one screen (at most 6 steps). */
  stagger: 0.06,
  /** A headline number rolls to its new value. */
  number: 0.7,
  /** Bars and meters fill. */
  chart: 0.65,
  /** Press feedback. */
  press: 0.16,
  /** Screen cross-fade. */
  fadeIn: 0.22,
  fadeOut: 0.12,
  /** Sheets and pop-ups. */
  sheetIn: 0.32,
  sheetOut: 0.22,
  /** Small state changes: a colour, a badge, a toast. */
  quick: 0.26,
  /** How far a block rises, in px. */
  rise: 12,
} as const;

let reduced = false;
const media = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

/** Set from the in-app "Reduce motion" setting; the system setting is always respected too. */
export function setReducedMotion(on: boolean) {
  reduced = on;
}
export function isReducedMotion(): boolean {
  return reduced || Boolean(media?.matches);
}

const INSTANT: Transition = { duration: 0 };

/** An ease-out tween; instant with reduced motion. */
export function ease(duration: number = MOTION.quick, delay = 0): Transition {
  return isReducedMotion() ? INSTANT : { duration, delay, ease: EASE_OUT };
}

/** The staggered entrance for the `index`-th top-level block of a screen. */
export function enter(index = 0): Transition {
  return ease(MOTION.enter, Math.min(Math.max(index, 0), 6) * MOTION.stagger);
}

/** Blocks that rise into place once when their screen opens: `custom={index}`. */
export const reveal: Variants = {
  hidden: () => (isReducedMotion() ? { opacity: 1, y: 0 } : { opacity: 0, y: MOTION.rise }),
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: enter(i) }),
};

/**
 * For things that glide between places (the tab highlight, a switch knob): a critically damped
 * spring, so it follows the finger and settles without any overshoot.
 */
export function glide(): Transition {
  return isReducedMotion() ? INSTANT : { type: 'spring', stiffness: 520, damping: 46, mass: 1 };
}

/** Press feedback for buttons and tappable cards. */
export const pressScale = 0.98;
export function press(): Transition {
  return ease(MOTION.press);
}
