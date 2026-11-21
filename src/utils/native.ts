/**
 * Native (Android) integration via Capacitor. Every call is a no-op in a normal browser,
 * so the same build runs on the web and inside the APK.
 */
import { Capacitor } from '@capacitor/core';

export const isNative = (): boolean => Capacitor.isNativePlatform();

export async function initNative(): Promise<void> {
  if (!isNative()) return;
  document.documentElement.classList.add('native');
  try {
    const { App } = await import('@capacitor/app');
    // Android back: close an open sheet first, then go back a screen, and only exit from the dashboard.
    await App.addListener('backButton', ({ canGoBack }) => {
      if (document.querySelector('[role="dialog"]')) {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        return;
      }
      const atHome = !window.location.hash || window.location.hash === '#/' || window.location.hash === '#';
      if (!atHome) {
        if (canGoBack) window.history.back();
        else window.location.hash = '#/';
        return;
      }
      void App.exitApp();
    });
  } catch {
    /* back handling falls back to the WebView default */
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

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/** Shares an image through the Android share sheet (Instagram Stories, WhatsApp…). */
export async function nativeShareImage(blob: Blob, fileName: string, text?: string): Promise<'shared' | 'cancelled' | false> {
  if (!isNative()) return false;
  try {
    const [{ Filesystem, Directory }, { Share }] = await Promise.all([import('@capacitor/filesystem'), import('@capacitor/share')]);
    const data = await blobToBase64(blob);
    const written = await Filesystem.writeFile({ path: fileName, data, directory: Directory.Cache });
    await Share.share({ title: 'Football Detective', text, files: [written.uri], dialogTitle: 'Share your result' });
    return 'shared';
  } catch (err) {
    const msg = err instanceof Error ? err.message.toLowerCase() : '';
    return msg.includes('cancel') ? 'cancelled' : false;
  }
}
