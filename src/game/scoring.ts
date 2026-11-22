import type { GameMode, ScoreBreakdown } from '@/types';

export const SCORING = {
  base: 1000,
  wrongGuess: 100,
  extraClue: 75,
  firstGuessBonus: 300,
  noHintBonus: 200,
} as const;

export const MODE_MULTIPLIER: Record<GameMode, number> = {
  daily: 1,
  practice: 1,
  hardcore: 1.5,
  career: 1.2,
  legends: 1.3,
  clubpath: 1,
  teammate: 1,
  higherlower: 1,
  emoji: 1,
  transfer: 1,
  xi: 1,
};

/** XP taken from your total when you reveal the answer instead of solving it. */
export const REVEAL_ANSWER_COST = 150;

export function calculateScore(opts: {
  won: boolean;
  wrongGuesses: number;
  cluesRevealed: number;
  mode: GameMode;
}): ScoreBreakdown {
  const multiplier = MODE_MULTIPLIER[opts.mode];
  if (!opts.won) {
    return { base: 0, wrongGuessPenalty: 0, cluePenalty: 0, firstGuessBonus: 0, noHintBonus: 0, multiplier, total: 0 };
  }
  const extraClues = Math.max(0, opts.cluesRevealed - 1);
  const wrongGuessPenalty = opts.wrongGuesses * SCORING.wrongGuess;
  const cluePenalty = extraClues * SCORING.extraClue;
  const firstGuessBonus = opts.wrongGuesses === 0 ? SCORING.firstGuessBonus : 0;
  const noHintBonus = extraClues === 0 ? SCORING.noHintBonus : 0;
  const raw = SCORING.base - wrongGuessPenalty - cluePenalty + firstGuessBonus + noHintBonus;
  const total = Math.max(0, Math.round(raw * multiplier));
  return { base: SCORING.base, wrongGuessPenalty, cluePenalty, firstGuessBonus, noHintBonus, multiplier, total };
}
