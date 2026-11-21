import type { GameMode, RoundState } from '@/types';
import { randomId } from './random';

/** Builds a finished RoundState for modes that don't use the classic round, so it can be recorded. */
export function finishedRound(opts: {
  mode: GameMode;
  playerId: string;
  caseNumber: number;
  guesses: string[];
  maxAttempts: number;
  won: boolean;
  points: number;
  startedAt: number;
}): RoundState {
  const total = opts.won ? opts.points : 0;
  return {
    id: randomId(),
    mode: opts.mode,
    playerId: opts.playerId,
    caseNumber: opts.caseNumber,
    maxAttempts: opts.maxAttempts,
    hintsAllowed: false,
    guesses: opts.guesses,
    revealed: 1,
    status: opts.won ? 'won' : 'lost',
    startedAt: opts.startedAt,
    finishedAt: Date.now(),
    score: { base: total, wrongGuessPenalty: 0, cluePenalty: 0, firstGuessBonus: 0, noHintBonus: 0, multiplier: 1, total },
  };
}
