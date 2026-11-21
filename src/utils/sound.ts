/**
 * Quiet, glassy sound design synthesised with Web Audio (no audio files).
 *
 * Every cue is built from soft "bell" voices: a sine fundamental plus two faint inharmonic
 * partials, with a fast attack and a long exponential decay. All voices feed a gentle low-pass
 * filter and a short feedback-delay "room", so sounds feel airy rather than beepy. Peak levels
 * stay low (around -26 dBFS) so nothing startles.
 */
export type Sfx = 'tap' | 'select' | 'reveal' | 'wrong' | 'win' | 'lose' | 'unlock';

let ctx: AudioContext | null = null;
let bus: { input: GainNode } | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** master → soft low-pass → (dry + small room) → limiter → speakers */
function output(a: AudioContext) {
  if (bus) return bus;
  const input = a.createGain();
  input.gain.value = 0.55;

  const tone = a.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 5200;
  tone.Q.value = 0.4;

  // A tiny "room": two short feedback delays, darkened, mixed in quietly.
  const wet = a.createGain();
  wet.gain.value = 0.22;
  const roomFilter = a.createBiquadFilter();
  roomFilter.type = 'lowpass';
  roomFilter.frequency.value = 2400;
  for (const [time, fb] of [
    [0.083, 0.32],
    [0.131, 0.26],
  ] as const) {
    const d = a.createDelay(0.5);
    d.delayTime.value = time;
    const g = a.createGain();
    g.gain.value = fb;
    tone.connect(d);
    d.connect(g);
    g.connect(d);
    d.connect(roomFilter);
  }
  roomFilter.connect(wet);

  const limiter = a.createDynamicsCompressor();
  limiter.threshold.value = -18;
  limiter.knee.value = 12;
  limiter.ratio.value = 6;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.25;

  input.connect(tone);
  tone.connect(limiter);
  wet.connect(limiter);
  limiter.connect(a.destination);
  bus = { input };
  return bus;
}

/** A soft glass bell. */
function bell(freq: number, at: number, opts: { gain?: number; decay?: number; glide?: number } = {}) {
  const a = audio();
  if (!a) return;
  const { gain = 0.05, decay = 0.9, glide = 0 } = opts;
  const t0 = a.currentTime + at;
  const out = output(a).input;
  const partials: [number, number][] = [
    [1, 1],
    [2.76, 0.12],
    [5.4, 0.035],
  ];
  for (const [ratio, level] of partials) {
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * ratio, t0);
    if (glide) osc.frequency.exponentialRampToValueAtTime(freq * ratio * glide, t0 + 0.18);
    const peak = gain * level;
    const d = ratio === 1 ? decay : decay * 0.45;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    osc.connect(g).connect(out);
    osc.start(t0);
    osc.stop(t0 + d + 0.05);
  }
}

/** A muted, rounded "knock" for wrong answers: no harshness, just a soft low thud. */
function knock(freq: number, at: number, gain = 0.07) {
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + at;
  const osc = a.createOscillator();
  const g = a.createGain();
  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 900;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.72, t0 + 0.22);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.34);
  osc.connect(lp).connect(g).connect(output(a).input);
  osc.start(t0);
  osc.stop(t0 + 0.4);
}

export function play(sfx: Sfx) {
  if (!enabled) return;
  switch (sfx) {
    case 'tap':
      bell(1568, 0, { gain: 0.022, decay: 0.12, glide: 0.92 });
      break;
    case 'select':
      bell(2093, 0, { gain: 0.014, decay: 0.08 });
      break;
    case 'reveal': // airy rising fifth
      bell(1319, 0, { gain: 0.04, decay: 0.7 });
      bell(1976, 0.07, { gain: 0.03, decay: 0.9 });
      break;
    case 'wrong': // two soft low knocks
      knock(196, 0, 0.06);
      knock(165, 0.11, 0.045);
      break;
    case 'win': // gentle major arpeggio that rings out
      [1047, 1319, 1568, 2093].forEach((f, i) => bell(f, i * 0.075, { gain: 0.05 - i * 0.006, decay: 1.4 }));
      break;
    case 'lose': // slow falling minor third
      bell(440, 0, { gain: 0.04, decay: 1.1 });
      bell(370, 0.18, { gain: 0.035, decay: 1.3 });
      break;
    case 'unlock': // three tiny sparkles
      [2349, 2794, 3136].forEach((f, i) => bell(f, i * 0.06, { gain: 0.022, decay: 0.6 }));
      break;
  }
}
