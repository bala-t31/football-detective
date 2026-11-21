import { PLAYER_BY_ID, PLAYER_IDS_STABLE } from '@/data';
import { storage } from '@/utils/storage';
import { addDays, daysBetween, fromDateKey, toDateKey } from '@/utils/date';
import { hashString, seededShuffle } from './random';

/** Weekly Legends: five retired greats, the same for everyone, refreshed every Monday. */
export const LEGENDS_PER_WEEK = 5;
const WEEK_EPOCH = '2026-11-16'; // a Monday; week 1
const SEED = 0x1e9e_4d5;

export const LEGENDS_POOL: string[] = PLAYER_IDS_STABLE.filter((id) => {
  const p = PLAYER_BY_ID[id];
  return p.retired && p.difficulty !== 'hard';
});

/** Monday (local) of the week containing the date. */
export function weekKeyFor(dateKey: string = toDateKey()): string {
  const d = fromDateKey(dateKey);
  const offset = (d.getDay() + 6) % 7; // Monday → 0
  return addDays(dateKey, -offset);
}

export function weekNumber(weekKey: string): number {
  return Math.floor(daysBetween(WEEK_EPOCH, weekKey) / 7) + 1;
}

/**
 * Five legends for the week. Consecutive weeks are drawn from one shuffled cycle of the pool,
 * so nobody repeats until the whole pool has been used.
 */
export function legendsForWeek(weekKey: string): string[] {
  const perCycle = Math.floor(LEGENDS_POOL.length / LEGENDS_PER_WEEK);
  const idx = weekNumber(weekKey) - 1;
  const cycle = Math.floor(idx / perCycle);
  const pos = ((idx % perCycle) + perCycle) % perCycle;
  const order = seededShuffle(LEGENDS_POOL, SEED + hashString(`cycle:${cycle}`));
  return order.slice(pos * LEGENDS_PER_WEEK, pos * LEGENDS_PER_WEEK + LEGENDS_PER_WEEK);
}

export interface LegendResult {
  playerId: string;
  won: boolean;
  score: number;
  guesses: number;
}

const key = (weekKey: string) => `legends.${weekKey}`;

export function legendsProgress(weekKey: string): LegendResult[] {
  const v = storage.get<LegendResult[]>(key(weekKey), []);
  return Array.isArray(v) ? v : [];
}

export function saveLegendResult(weekKey: string, r: LegendResult): LegendResult[] {
  const cur = legendsProgress(weekKey);
  if (cur.some((x) => x.playerId === r.playerId)) return cur;
  const next = [...cur, r];
  storage.set(key(weekKey), next);
  return next;
}

/** Days left until the next Monday (1–7). */
export function daysUntilNextWeek(dateKey: string = toDateKey()): number {
  return 7 - daysBetween(weekKeyFor(dateKey), dateKey);
}
