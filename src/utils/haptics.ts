/**
 * Haptic feedback, off by default.
 * In the Android app this uses the CrispHaptics native plugin: short, tuned clicks and ticks
 * from the phone's haptic motor rather than buzzy vibrations. Browsers only get a single
 * very short pulse, because longer web vibrations feel cheap.
 */
import { Capacitor, registerPlugin } from '@capacitor/core';

export type Haptic = 'light' | 'medium' | 'selection' | 'success' | 'warning' | 'error';

interface CrispHapticsPlugin {
  play(opts: { kind: Haptic }): Promise<void>;
}
const CrispHaptics = registerPlugin<CrispHapticsPlugin>('CrispHaptics');

let enabled = false;
export function setHapticsEnabled(on: boolean) {
  enabled = on;
}

const WEB_PULSE: Record<Haptic, number> = { light: 6, medium: 10, selection: 4, success: 12, warning: 10, error: 16 };

export function hapticsSupported(): boolean {
  return Capacitor.isNativePlatform() || (typeof navigator !== 'undefined' && 'vibrate' in navigator);
}

export async function haptic(kind: Haptic): Promise<void> {
  if (!enabled) return;
  try {
    if (Capacitor.isNativePlatform()) {
      await CrispHaptics.play({ kind });
      return;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(WEB_PULSE[kind]);
  } catch {
    /* haptics are a nicety; never let them break a tap */
  }
}
