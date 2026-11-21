import { Capacitor } from '@capacitor/core';

export const DEVELOPER = {
  handle: 'bala_t31',
  instagram: 'https://www.instagram.com/bala_t31/',
  /** Opens a direct-message thread with the developer in the Instagram app (or web). */
  instagramDm: 'https://ig.me/m/bala_t31',
  github: 'https://github.com/bala-t31/football-detective',
} as const;

export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev';

/**
 * Open a link outside the game. Inside the Android app, navigating to an external URL hands it to
 * Android, which opens the Instagram app (or the browser) instead of loading it inside the game.
 */
export function openExternal(url: string) {
  if (Capacitor.isNativePlatform()) {
    window.location.href = url;
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}
