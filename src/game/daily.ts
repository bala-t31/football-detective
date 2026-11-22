import { PLAYER_BY_ID, PLAYER_IDS_STABLE } from '@/data';
import { daysBetween, toDateKey } from '@/utils/date';
import { seededShuffle } from './random';

/** Day 1 of the Daily Case. Case numbers count up from here. */
export const DAILY_EPOCH = '2026-11-01';
const DAILY_SEED = 0x5eed_f00d;

/** Daily pool: the most famous (Casual level) players, in a stable id order so every device agrees. */
const DAILY_POOL: string[] = PLAYER_IDS_STABLE.filter((id) => PLAYER_BY_ID[id].difficulty === 'easy');

function cycleOrder(cycle: number): string[] {
  return seededShuffle(DAILY_POOL, DAILY_SEED + cycle * 7919);
}

/** Index of a date relative to the epoch (may be negative for earlier dates). */
export function dayIndex(dateKey: string): number {
  return daysBetween(DAILY_EPOCH, dateKey);
}

export function caseNumberFor(dateKey: string): number {
  return dayIndex(dateKey) + 1;
}

/**
 * Deterministic daily player. Each cycle through the pool is a fresh seeded permutation,
 * so a player never repeats within a cycle. At cycle boundaries we guarantee the first pick of
 * the new cycle differs from the last pick of the previous one.
 */
export function dailyPlayerId(dateKey: string = toDateKey()): string {
  const n = DAILY_POOL.length;
  const idx = dayIndex(dateKey);
  const cycle = Math.floor(idx / n);
  const pos = ((idx % n) + n) % n;
  const order = cycleOrder(cycle);
  if (pos <= 1) {
    const prevLast = cycleOrder(cycle - 1)[n - 1];
    if (order[0] === prevLast) [order[0], order[1]] = [order[1], order[0]];
  }
  return order[pos];
}

export const DAILY_POOL_SIZE = DAILY_POOL.length;
