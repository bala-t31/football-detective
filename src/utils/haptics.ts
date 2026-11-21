/**
 * Haptic feedback. Uses the phone's haptic engine through Capacitor inside the Android app,
 * and falls back to very short vibrations in mobile browsers that support it.
 */
import { Capacitor } from '@capacitor/core';

export type Haptic = 'light' | 'medium' | 'selection' | 'success' | 'warning' | 'error';

let enabled = true;
export function setHapticsEnabled(on: boolean) {
  enabled = on;
}

const WEB_PATTERN: Record<Haptic, number | number[]> = {
  light: 8,
  medium: 14,
  selection: 5,
  success: [10, 60, 18],
  warning: [16, 50, 16],
  error: [24, 40, 24, 40, 24],
};

export function hapticsSupported(): boolean {
  return Capacitor.isNativePlatform() || (typeof navigator !== 'undefined' && 'vibrate' in navigator);
}

export async function haptic(kind: Haptic): Promise<void> {
  if (!enabled) return;
  try {
    if (Capacitor.isNativePlatform()) {
      const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
      switch (kind) {
        case 'light':
          return Haptics.impact({ style: ImpactStyle.Light });
        case 'medium':
          return Haptics.impact({ style: ImpactStyle.Medium });
        case 'selection':
          await Haptics.selectionStart();
          await Haptics.selectionChanged();
          return Haptics.selectionEnd();
        case 'success':
          return Haptics.notification({ type: NotificationType.Success });
        case 'warning':
          return Haptics.notification({ type: NotificationType.Warning });
        case 'error':
          return Haptics.notification({ type: NotificationType.Error });
      }
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(WEB_PATTERN[kind]);
  } catch {
    /* haptics are a nicety; never let them break a tap */
  }
}
