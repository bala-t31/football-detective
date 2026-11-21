/** Tiny synthesized sound effects via Web Audio — no audio files needed. */
type Sfx = 'tap' | 'reveal' | 'wrong' | 'win' | 'lose' | 'unlock';

let ctx: AudioContext | null = null;
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

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.06) {
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, a.currentTime + start);
  g.gain.setValueAtTime(0, a.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, a.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
  osc.connect(g).connect(a.destination);
  osc.start(a.currentTime + start);
  osc.stop(a.currentTime + start + dur + 0.02);
}

export function play(sfx: Sfx) {
  if (!enabled) return;
  switch (sfx) {
    case 'tap':
      tone(660, 0, 0.06, 'triangle', 0.03);
      break;
    case 'reveal':
      tone(520, 0, 0.12, 'triangle');
      tone(780, 0.08, 0.16, 'triangle');
      break;
    case 'wrong':
      tone(220, 0, 0.18, 'sawtooth', 0.035);
      tone(180, 0.1, 0.22, 'sawtooth', 0.03);
      break;
    case 'win':
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.3, 'triangle', 0.06));
      break;
    case 'lose':
      [392, 330, 262].forEach((f, i) => tone(f, i * 0.14, 0.35, 'sine', 0.05));
      break;
    case 'unlock':
      tone(880, 0, 0.12, 'sine', 0.05);
      tone(1320, 0.1, 0.25, 'sine', 0.05);
      break;
  }
}
