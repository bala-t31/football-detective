import type { Difficulty, RoundState } from '@/types';

/** Player difficulty, named after how much ball knowledge you need. */
export const LEVEL_LABEL: Record<Difficulty, string> = {
  easy: 'Casual',
  medium: 'Ball Knower',
  hard: 'Elite Ball Knowledge',
};

export const LEVEL_BLURB: Record<Difficulty, string> = {
  easy: 'Household names everyone has heard of.',
  medium: 'Big names that regular fans know.',
  hard: 'Deep cuts for people who watch everything.',
};

export type PracticeLevel = Difficulty | 'all';

export const PRACTICE_LEVELS: { id: PracticeLevel; label: string }[] = [
  { id: 'easy', label: 'Casual' },
  { id: 'medium', label: 'Ball Knower' },
  { id: 'hard', label: 'Elite' },
  { id: 'all', label: 'Mixed' },
];

// ─── Result verdicts for share cards ────────────────────────────────

export function roundVerdict(state: Pick<RoundState, 'status' | 'guesses' | 'gaveUp'>): string {
  if (state.gaveUp) return 'Negative ball knowledge';
  if (state.status !== 'won') return 'Zero ball knowledge';
  const n = state.guesses.length;
  if (n === 1) return 'Elite ball knowledge';
  if (n === 2) return 'Certified ball knower';
  if (n <= 4) return 'Ball knower';
  return 'Mid ball knowledge';
}

function byCount(n: number, steps: [number, string][]): string {
  let out = 'Zero ball knowledge';
  for (const [min, label] of steps) if (n >= min) out = label;
  return out;
}

export const runVerdict = (solved: number) =>
  byCount(solved, [[1, 'Mid ball knowledge'], [3, 'Ball knower'], [6, 'Certified ball knower'], [10, 'Elite ball knowledge']]);

export const teammateVerdict = (found: number) =>
  byCount(found, [[1, 'Mid ball knowledge'], [3, 'Ball knower'], [5, 'Certified ball knower'], [8, 'Elite ball knowledge']]);

export const weekVerdict = (solved: number) =>
  byCount(solved, [[1, 'Mid ball knowledge'], [3, 'Ball knower'], [4, 'Certified ball knower'], [5, 'Elite ball knowledge']]);
