/**
 * Everything the app reads from the website: the latest version, announcements and the online
 * player data. All checks are best-effort: offline or slow, the app simply carries on.
 */
import { CONTENT_REV, PLAYER_BY_ID } from '@/data';
import { CONTENT_CACHE_KEY, compareVersions, sanitizeContent } from '@/data/remote';
import { storage } from './storage';
import { APP_VERSION } from './external';

export const SITE = 'https://football-detective.netlify.app';

function base(): string {
  // QA can point the app at a local copy of the website's data folder.
  const override = storage.get<string | null>('remote.base', null);
  return override || `${SITE}/data`;
}

async function getJson(name: string, timeoutMs = 7000): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${base()}/${name}?t=${Date.now()}`, { cache: 'no-store', signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

// ─── Online player data ─────────────────────────────────────────────

export interface ContentSyncResult {
  /** A newer file was saved; it applies the next time the app opens. */
  updated: boolean;
  newPlayers: number;
}

export async function syncContent(): Promise<ContentSyncResult> {
  const raw = await getJson('content.json');
  const content = sanitizeContent(raw);
  if (!content) return { updated: false, newPlayers: 0 };
  if (content.minApp && compareVersions(APP_VERSION, content.minApp) < 0) return { updated: false, newPlayers: 0 };
  let cachedRev = 0;
  try {
    const cached = sanitizeContent(JSON.parse(localStorage.getItem(CONTENT_CACHE_KEY) ?? 'null'));
    cachedRev = cached?.rev ?? 0;
  } catch {
    /* unreadable cache: replace it */
  }
  if (content.rev <= Math.max(cachedRev, CONTENT_REV)) return { updated: false, newPlayers: 0 };
  try {
    localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(content));
  } catch {
    return { updated: false, newPlayers: 0 };
  }
  const newPlayers = (content.players ?? []).filter((p) => !PLAYER_BY_ID[p.id]).length;
  return { updated: true, newPlayers };
}

// ─── App updates ────────────────────────────────────────────────────

export interface UpdateInfo {
  latest: string;
  notes: string[];
  url: string;
}

const UPDATE_SNOOZE_KEY = 'update.snoozed';
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  const raw = (await getJson('version.json')) as Partial<UpdateInfo> | null;
  if (!raw || typeof raw.latest !== 'string' || typeof raw.url !== 'string') return null;
  if (APP_VERSION === 'dev' || compareVersions(raw.latest, APP_VERSION) <= 0) return null;
  const snoozed = storage.get<{ version: string; at: number } | null>(UPDATE_SNOOZE_KEY, null);
  if (snoozed && snoozed.version === raw.latest && Date.now() - snoozed.at < SNOOZE_MS) return null;
  const notes = Array.isArray(raw.notes) ? raw.notes.filter((n): n is string => typeof n === 'string').slice(0, 6) : [];
  return { latest: raw.latest, notes, url: raw.url };
}

export function snoozeUpdate(version: string) {
  storage.set(UPDATE_SNOOZE_KEY, { version, at: Date.now() });
}

// ─── Announcements ──────────────────────────────────────────────────

export interface Announcement {
  id: string;
  title: string;
  body: string;
  cta?: { label: string; url: string };
  /** Last day to show it (YYYY-MM-DD). */
  until?: string;
  /** Only show to these app versions and newer. */
  minApp?: string;
}

const SEEN_KEY = 'announcements.seen';

export async function getAnnouncement(today: string): Promise<Announcement | null> {
  const raw = (await getJson('announcement.json')) as Partial<Announcement> | null;
  if (!raw || typeof raw.id !== 'string' || typeof raw.title !== 'string' || typeof raw.body !== 'string') return null;
  if (raw.until && today > raw.until) return null;
  if (raw.minApp && APP_VERSION !== 'dev' && compareVersions(APP_VERSION, raw.minApp) < 0) return null;
  const seen = storage.get<string[]>(SEEN_KEY, []);
  if (seen.includes(raw.id)) return null;
  const cta =
    raw.cta && typeof raw.cta.label === 'string' && typeof raw.cta.url === 'string' && /^https:\/\//.test(raw.cta.url) ? raw.cta : undefined;
  return { id: raw.id, title: raw.title.slice(0, 80), body: raw.body.slice(0, 600), cta, until: raw.until };
}

export function markAnnouncementSeen(id: string) {
  const seen = storage.get<string[]>(SEEN_KEY, []);
  if (!seen.includes(id)) storage.set(SEEN_KEY, [...seen.slice(-30), id]);
}
