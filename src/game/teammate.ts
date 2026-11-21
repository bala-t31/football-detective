import { TEAMMATE_PUZZLES, type TeammatePuzzle } from '@/data/teammates';
import { storage } from '@/utils/storage';

export const TEAMMATE_LIVES = 3;
export const TEAMMATE_TARGET = 3;
export const POINTS_PER_TEAMMATE = 120;

export interface TeammateGame {
  id: string;
  puzzleId: string;
  found: string[];
  wrong: string[];
  status: 'playing' | 'over';
  startedAt: number;
}

const KEY = 'teammate.active';
const SEEN_KEY = 'teammate.seen';

export function puzzleById(id: string): TeammatePuzzle | undefined {
  return TEAMMATE_PUZZLES.find((p) => p.id === id);
}

export function loadTeammateGame(): TeammateGame | null {
  const g = storage.get<TeammateGame | null>(KEY, null);
  if (!g || !puzzleById(g.puzzleId) || !Array.isArray(g.found) || !Array.isArray(g.wrong)) return null;
  return g;
}

export function saveTeammateGame(g: TeammateGame) {
  storage.set(KEY, g);
}

/** Picks a puzzle the player hasn't seen recently. */
export function nextPuzzleId(current?: string): string {
  const seen = storage.get<string[]>(SEEN_KEY, []);
  const fresh = TEAMMATE_PUZZLES.filter((p) => !seen.includes(p.id) && p.id !== current);
  const pool = fresh.length ? fresh : TEAMMATE_PUZZLES.filter((p) => p.id !== current);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const nextSeen = fresh.length ? [...seen, pick.id] : [pick.id];
  storage.set(SEEN_KEY, nextSeen);
  return pick.id;
}

export function teammateScore(g: TeammateGame): number {
  return g.found.length * POINTS_PER_TEAMMATE;
}

export const teammateWon = (g: TeammateGame) => g.found.length >= TEAMMATE_TARGET;
