/** Guess the XI: name every starter of a famous line-up. */
import { LINEUPS, normName, type Lineup, type XiPlayer } from '@/data/lineups';
import { storage } from '@/utils/storage';

export const XI_POINTS = 25;
export const XI_FULL_BONUS = 50;

export const lineupById = (id: string): Lineup | undefined => LINEUPS.find((l) => l.id === id);
export const xiPlayers = (l: Lineup): XiPlayer[] => l.rows.flat();

/** The starter a typed name matches, if any (and not already found). */
export function matchXi(l: Lineup, typed: string, found: string[]): XiPlayer | null {
  const q = normName(typed);
  if (!q) return null;
  return xiPlayers(l).find((p) => !found.includes(p.name) && p.accept.some((a) => normName(a) === q)) ?? null;
}

export function xiScore(found: number): number {
  return found * XI_POINTS + (found === 11 ? XI_FULL_BONUS : 0);
}

export interface XiGame {
  lineupId: string;
  found: string[];
  wrong: string[];
  status: 'playing' | 'over';
  startedAt: number;
}

const KEY = 'xi.game';
const BEST_KEY = 'xi.best';
export const loadXiGame = (): XiGame | null => {
  const g = storage.get<XiGame | null>(KEY, null);
  return g && lineupById(g.lineupId) ? g : null;
};
export const saveXiGame = (g: XiGame | null) => storage.set(KEY, g);
export const xiBest = (): Record<string, number> => storage.get<Record<string, number>>(BEST_KEY, {});
export function saveXiBest(id: string, found: number) {
  const best = xiBest();
  if ((best[id] ?? 0) < found) storage.set(BEST_KEY, { ...best, [id]: found });
}
