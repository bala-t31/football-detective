/**
 * Higher or Lower, "Who started first?": did the next player begin his senior career earlier or
 * later than the one on screen? Pairs with the same start year are never shown.
 */
import type { Player } from '@/types';
import { PLAYERS } from '@/data';
import { storage } from '@/utils/storage';

export const HL_POINTS = 40;
export const HL_STREAK_BONUS = 5;

export const HL_POOL: Player[] = PLAYERS.filter((p) => p.difficulty !== 'hard');

export type HlAnswer = 'earlier' | 'later';

export function hlAnswer(current: Player, next: Player): HlAnswer {
  return next.from < current.from ? 'earlier' : 'later';
}

/** A next player with a different start year, not seen this run. */
export function nextHlPlayer(current: Player | null, seen: string[]): Player {
  const ok = (p: Player) => !seen.includes(p.id) && (!current || p.from !== current.from);
  const pool = HL_POOL.filter(ok);
  const list = pool.length ? pool : PLAYERS.filter((p) => !current || p.from !== current.from);
  return list[Math.floor(Math.random() * list.length)];
}

export function hlPoints(streakBefore: number): number {
  return HL_POINTS + streakBefore * HL_STREAK_BONUS;
}

const BEST_KEY = 'higherlower.best';
export const hlBest = (): number => storage.get<number>(BEST_KEY, 0);
export function saveHlBest(n: number): boolean {
  if (n <= hlBest()) return false;
  storage.set(BEST_KEY, n);
  return true;
}
