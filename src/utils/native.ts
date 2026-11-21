/**
 * Native (Android) integration via Capacitor. Every call is a no-op in a normal browser,
 * so the same build runs on the web and inside the APK.
 */
import { Capacitor } from '@capacitor/core';

export const isNative = (): boolean => Capacitor.isNativePlatform();

export async function initNative(): Promise<void> {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0B0D0C' });
  } catch {
    /* status bar styling is cosmetic */
  }
}

/** Opens the Android share sheet. Returns false if unavailable so callers can fall back. */
export async function nativeShare(text: string): Promise<'shared' | 'cancelled' | false> {
  if (!isNative()) return false;
  try {
    const { Share } = await import('@capacitor/share');
    await Share.share({ title: 'Football Detective', text, dialogTitle: 'Share your result' });
    return 'shared';
  } catch (err) {
    const msg = err instanceof Error ? err.message.toLowerCase() : '';
    return msg.includes('cancel') ? 'cancelled' : false;
  }
}
