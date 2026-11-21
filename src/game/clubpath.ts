import type { Player } from '@/types';
import { PLAYERS, getPlayer } from '@/data';
import { storage } from '@/utils/storage';

/** Club Path Run: name players from their club path alone. Two tries each; a miss ends the run. */
export const TRIES_PER_PLAYER = 2;
export const POINTS_FIRST_TRY = 120;
export const POINTS_SECOND_TRY = 60;
/** Every solved player in a row adds a little more. */
export const STREAK_BONUS = 10;

/** Club path with consecutive duplicates removed (loans back to the same club stay visible). */
export function clubPath(p: Player): string[] {
  return p.careerClubs.filter((c, i, arr) => i === 0 || arr[i - 1] !== c);
}

const pathKey = (p: Player) => clubPath(p).join('>');

const COUNT_BY_PATH = PLAYERS.reduce<Record<string, number>>((acc, p) => {
  acc[pathKey(p)] = (acc[pathKey(p)] ?? 0) + 1;
  return acc;
}, {});

/** Players whose path has at least three different clubs and is unique in the database. */
export const CLUB_PATH_POOL: Player[] = PLAYERS.filter(
  (p) => new Set(p.careerClubs).size >= 3 && COUNT_BY_PATH[pathKey(p)] === 1,
);

/** A guess counts if it is the player, or anyone with exactly the same path. */
export function isPathMatch(guessId: string, targetId: string): boolean {
  if (guessId === targetId) return true;
  const g = getPlayer(guessId);
  const t = getPlayer(targetId);
  return Boolean(g && t && pathKey(g) === pathKey(t));
}

/** The first few players come from the well-known half of the pool; after that anyone goes. */
export function nextPathPlayer(exclude: string[], step: number): string {
  const tier = CLUB_PATH_POOL.filter((p) => (step < 4 ? p.difficulty === 'easy' || p.difficulty === 'medium' : step < 8 ? p.difficulty !== 'easy' || Math.random() < 0.3 : true));
  const fresh = tier.filter((p) => !exclude.includes(p.id));
  const source = fresh.length ? fresh : CLUB_PATH_POOL.filter((p) => !exclude.includes(p.id));
  const list = source.length ? source : CLUB_PATH_POOL;
  return list[Math.floor(Math.random() * list.length)].id;
}

export function pointsFor(triesUsed: number, solvedSoFar: number): number {
  return (triesUsed === 1 ? POINTS_FIRST_TRY : POINTS_SECOND_TRY) + solvedSoFar * STREAK_BONUS;
}

export interface PathRun {
  id: string;
  startedAt: number;
  solved: { playerId: string; tries: number; points: number }[];
  current: string;
  guesses: string[];
  status: 'playing' | 'over';
  missed?: string;
}

const RUN_KEY = 'clubpath.run';
const BEST_KEY = 'clubpath.best';

export function loadRun(): PathRun | null {
  const r = storage.get<PathRun | null>(RUN_KEY, null);
  if (!r || typeof r !== 'object' || !Array.isArray(r.solved) || !getPlayer(r.current)) return null;
  return r;
}

export function saveRun(r: PathRun) {
  storage.set(RUN_KEY, r);
}

export function runScore(r: PathRun): number {
  return r.solved.reduce((s, x) => s + x.points, 0);
}

export function bestRun(): { solved: number; score: number } {
  return storage.get(BEST_KEY, { solved: 0, score: 0 });
}

export function saveBest(r: PathRun): { solved: number; score: number; isNew: boolean } {
  const best = bestRun();
  const cur = { solved: r.solved.length, score: runScore(r) };
  const isNew = cur.solved > best.solved || (cur.solved === best.solved && cur.score > best.score);
  if (isNew) storage.set(BEST_KEY, cur);
  return { ...(isNew ? cur : best), isNew };
}
