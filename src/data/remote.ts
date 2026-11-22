/**
 * Online content: extra players, fixes and scheduled daily mysteries that the app downloads from
 * the website, so the player list can grow without a new APK.
 *
 * The downloaded file is cached in LocalStorage and merged into the built-in data when the app
 * starts (this module is read synchronously while `@/data` loads). A new download takes effect the
 * next time the app opens. Anything that fails validation is ignored, so a bad file can never break
 * the built-in game.
 */
import type { RawPlayer } from '@/types';
import type { NationInfo } from './nations';
import type { TeammatePuzzle } from './teammates';

export interface ScheduledDay {
  playerId: string;
  /** Short banner, e.g. "Match day: El Clásico". */
  theme?: string;
}

export interface RemoteContent {
  /** Increases with every published change. */
  rev: number;
  /** Oldest app version that understands this file. */
  minApp?: string;
  players?: RawPlayer[];
  /** Built-in player ids to hide (for example a player added by mistake). */
  remove?: string[];
  clubs?: Record<string, string>;
  clubShort?: Record<string, string>;
  leagueShort?: Record<string, string>;
  nations?: Record<string, NationInfo>;
  honours?: Record<string, string[]>;
  teammates?: TeammatePuzzle[];
  /** Date (YYYY-MM-DD) → the daily mystery for that day. */
  daily?: Record<string, ScheduledDay>;
}

export const CONTENT_CACHE_KEY = 'football-detective:content.v1';
const POSITIONS = new Set(['GK', 'CB', 'FB', 'DM', 'CM', 'AM', 'W', 'ST']);
const DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

const isStr = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr);
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Checks the shape of one player entry. Clubs and nations are checked later, against the merged maps. */
export function isValidRawPlayer(p: unknown): p is RawPlayer {
  if (!isObj(p)) return false;
  return (
    isStr(p.id) && /^[a-z0-9-]+$/.test(p.id) &&
    isStr(p.name) &&
    isStr(p.nationality) &&
    isStr(p.position) && POSITIONS.has(p.position) &&
    (p.secondaryPositions === undefined || (isStrArr(p.secondaryPositions) && p.secondaryPositions.every((s) => POSITIONS.has(s)))) &&
    (p.aka === undefined || isStrArr(p.aka)) &&
    typeof p.from === 'number' && p.from > 1900 && p.from < 2100 &&
    (p.to === null || (typeof p.to === 'number' && p.to >= p.from)) &&
    isStrArr(p.careerClubs) && p.careerClubs.length > 0 &&
    isStr(p.difficulty) && DIFFICULTIES.has(p.difficulty) &&
    (p.honours === undefined || isStrArr(p.honours)) &&
    Array.isArray(p.clues) && p.clues.length >= 4 &&
    p.clues.every((c) => Array.isArray(c) && c.length === 2 && isStr(c[0]) && isStr(c[1]))
  );
}

/** Light structural validation of the whole file. Returns a cleaned copy or null. */
export function sanitizeContent(raw: unknown): RemoteContent | null {
  if (!isObj(raw) || typeof raw.rev !== 'number') return null;
  const out: RemoteContent = { rev: raw.rev };
  if (isStr(raw.minApp)) out.minApp = raw.minApp;
  if (Array.isArray(raw.players)) out.players = raw.players.filter(isValidRawPlayer);
  if (isStrArr(raw.remove)) out.remove = raw.remove;
  for (const key of ['clubs', 'clubShort', 'leagueShort'] as const) {
    const v = raw[key];
    if (isObj(v)) out[key] = Object.fromEntries(Object.entries(v).filter(([k, x]) => isStr(k) && isStr(x))) as Record<string, string>;
  }
  if (isObj(raw.nations)) {
    out.nations = Object.fromEntries(
      Object.entries(raw.nations).filter(
        ([, n]) => isObj(n) && isStr(n.confederation) && ['UEFA', 'CONMEBOL', 'CAF', 'AFC', 'CONCACAF', 'OFC'].includes(n.confederation) && isStr(n.flag) && isStr(n.code),
      ),
    ) as Record<string, NationInfo>;
  }
  if (isObj(raw.honours)) out.honours = Object.fromEntries(Object.entries(raw.honours).filter(([, h]) => isStrArr(h))) as Record<string, string[]>;
  if (Array.isArray(raw.teammates)) {
    out.teammates = raw.teammates.filter(
      (t): t is TeammatePuzzle => isObj(t) && isStr(t.id) && isStr(t.starId) && isStr(t.club) && isStr(t.years) && isStrArr(t.answers),
    );
  }
  if (isObj(raw.daily)) {
    out.daily = Object.fromEntries(
      Object.entries(raw.daily).filter(([d, v]) => /^\d{4}-\d{2}-\d{2}$/.test(d) && isObj(v) && isStr(v.playerId) && (v.theme === undefined || isStr(v.theme))),
    ) as Record<string, ScheduledDay>;
  }
  return out;
}

export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

/** The cached content, read synchronously at startup. */
export function readCachedContent(appVersion: string): RemoteContent | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(CONTENT_CACHE_KEY);
    if (!raw) return null;
    const c = sanitizeContent(JSON.parse(raw));
    if (!c) return null;
    if (c.minApp && compareVersions(appVersion, c.minApp) < 0) return null;
    return c;
  } catch {
    return null;
  }
}
