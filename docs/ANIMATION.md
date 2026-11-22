# Animation guide: Football Detective

How motion works in this app, so any developer or AI assistant keeps the same calm, premium feel.
The rule: **motion explains a change, it never decorates.** If an animation doesn't help the player
understand what just happened, leave it out.

## The principles

1. **One motion per moment.** A screen opening, a clue arriving, the portrait coming into focus. Never several competing motions on the same spot.
2. **Ease out, never bounce.** One curve everywhere: `EASE_OUT = cubic-bezier(0.22, 0.70, 0.20, 1.00)`.
3. **Short.** Entrances 0.42 s, number roll 0.7 s, bars 0.65 s, press 0.16 s. Nothing over 1 s (the win confetti is the one 1 s moment).
4. **Once.** Entrances play when a screen appears, then stop. No looping shimmer, pulse or sheen. The only loop is the scan line while a guess is being checked.
5. **Small distances.** A block rises 12 px.
6. **Respect the player.** With the in-app "Reduce motion" setting or the phone's setting, everything appears in its final state.

## The tokens

All in `src/ui/motion.ts`. Never hard-code a duration in a component.

| Token | Value | Use |
|---|---|---|
| `MOTION.enter` | 0.42 s | a block rises and fades in |
| `MOTION.stagger` | 0.06 s | gap between blocks (max 6 steps) |
| `MOTION.number` | 0.7 s | headline number roll, portrait reveal |
| `MOTION.chart` | 0.65 s | bars and progress fill |
| `MOTION.press` | 0.16 s | button press (scale 0.98) |
| `MOTION.fadeIn` / `fadeOut` | 0.22 / 0.12 s | screen cross-fade, pop-up exits |
| `MOTION.sheetIn` / `sheetOut` | 0.32 / 0.22 s | bottom sheets |
| `MOTION.quick` | 0.26 s | small state changes, toasts, feedback cells |

## The helpers

- `reveal` variants with `custom={index}`: the staggered rise for the top-level blocks of a screen. Not for list rows.
- `ease(duration, delay)`: an ease-out tween that becomes instant with reduced motion.
- `enter(index)`: the timing of `reveal` for one block.
- `glide()`: the only spring, critically damped (no overshoot). For the tab highlight and switch knobs.
- `press()` and `pressScale`: press feedback.
- `isReducedMotion()`: check it before any new animation.
- `<AnimatedNumber>`: rolls from the previous value to the new one. Only for the one headline number.

## Checklist before adding an animation

- Does it explain a change the player just made or is about to read? If not, drop it.
- Does it use `MOTION.*` and `EASE_OUT` (through `ease()`)?
- Does it play once?
- Is the travel distance 16 px or less?
- Does it respect `isReducedMotion()`?
- Is it 0.7 s or shorter?
