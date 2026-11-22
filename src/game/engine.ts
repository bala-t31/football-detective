import type { Clue, GameMode, Player, RoundState } from '@/types';
import { PLAYERS, PLAYER_BY_ID, getPlayer } from '@/data';
import { toDateKey } from '@/utils/date';
import { caseNumberFor, dailyPlayerId } from './daily';
import { legendsForWeek, legendsProgress, weekKeyFor } from './weekly';
import { hashString, randomId } from './random';
import { calculateScore, REVEAL_ANSWER_COST } from './scoring';
import type { PracticeLevel } from './levels';
import { storage } from '@/utils/storage';
import { compareGuess } from './feedback';

export interface ModeConfig {
  id: GameMode;
  name: string;
  tagline: string;
  maxAttempts: number;
  hintsAllowed: boolean;
  pool: (p: Player) => boolean;
}

function distinctClubs(p: Player): number {
  return new Set(p.careerClubs).size;
}

export const MODES: Record<GameMode, ModeConfig> = {
  daily: {
    id: 'daily',
    name: 'Daily Case',
    tagline: 'One mystery. Six attempts. Same for everyone.',
    maxAttempts: 6,
    hintsAllowed: true,
    pool: (p) => p.difficulty !== 'hard',
  },
  practice: {
    id: 'practice',
    name: 'Practice',
    tagline: 'Unlimited random cases. No streak pressure.',
    maxAttempts: 6,
    hintsAllowed: true,
    pool: () => true,
  },
  hardcore: {
    id: 'hardcore',
    name: 'Hardcore',
    tagline: 'One clue. Three attempts. No hints. ×1.5 XP.',
    maxAttempts: 3,
    hintsAllowed: false,
    pool: (p) => p.difficulty !== 'easy',
  },
  career: {
    id: 'career',
    name: 'Career Detective',
    tagline: 'Identify the player from their club trail. ×1.2 XP.',
    maxAttempts: 6,
    hintsAllowed: true,
    pool: (p) => distinctClubs(p) >= 3,
  },
  legends: {
    id: 'legends',
    name: 'Weekly Legends',
    tagline: 'Five retired greats a week, the same for everyone. ×1.3 XP.',
    maxAttempts: 6,
    hintsAllowed: true,
    pool: (p) => p.retired && p.difficulty !== 'hard',
  },
  clubpath: {
    id: 'clubpath',
    name: 'Club Path Run',
    tagline: 'Name players from their club path alone. One miss ends the run.',
    maxAttempts: 2,
    hintsAllowed: false,
    pool: (p) => distinctClubs(p) >= 3,
  },
  teammate: {
    id: 'teammate',
    name: 'Name the Teammate',
    tagline: 'Name players who shared a dressing room with a star.',
    maxAttempts: 3,
    hintsAllowed: false,
    pool: () => true,
  },
  higherlower: {
    id: 'higherlower',
    name: 'Higher or Lower',
    tagline: 'Who started their career first? One miss ends the run.',
    maxAttempts: 1,
    hintsAllowed: false,
    pool: (p) => p.difficulty !== 'hard',
  },
  emoji: {
    id: 'emoji',
    name: 'Emoji Clue',
    tagline: 'A career told in emojis. Three guesses.',
    maxAttempts: 3,
    hintsAllowed: false,
    pool: (p) => p.difficulty !== 'hard',
  },
  transfer: {
    id: 'transfer',
    name: 'Transfer Fee',
    tagline: 'Pick the reported fee for famous transfers.',
    maxAttempts: 1,
    hintsAllowed: false,
    pool: () => true,
  },
  xi: {
    id: 'xi',
    name: 'Guess the XI',
    tagline: 'Name every starter of a famous line-up.',
    maxAttempts: 11,
    hintsAllowed: false,
    pool: () => true,
  },
};

/** Modes where a win doesn't mean you identified the player, so it doesn't count as "discovered". */
export const NON_DISCOVERY_MODES: GameMode[] = ['teammate', 'higherlower', 'transfer', 'xi'];

/** Clues shown for a round. Career mode builds a progressive club timeline instead. */
export function cluesForRound(player: Player, mode: GameMode): Clue[] {
  if (mode !== 'career') return player.clues;
  const stops: Clue[] = player.careerClubs.map((club, i) => ({
    id: `${player.id}-career-${i + 1}`,
    text: club,
    category: 'transfer',
    difficulty: i < 2 ? 'hard' : i < 4 ? 'medium' : 'easy',
    order: i + 1,
  }));
  stops.push({
    id: `${player.id}-career-nat`,
    text: `Nationality: ${player.nationality}`,
    category: 'nationality',
    difficulty: 'easy',
    order: stops.length + 1,
  });
  return stops;
}

const PRACTICE_LEVEL_KEY = 'practice.level';

export function getPracticeLevel(): PracticeLevel {
  const v = storage.get<PracticeLevel>(PRACTICE_LEVEL_KEY, 'easy');
  return v === 'easy' || v === 'medium' || v === 'hard' || v === 'all' ? v : 'easy';
}

export function setPracticeLevel(level: PracticeLevel) {
  storage.set(PRACTICE_LEVEL_KEY, level);
}

function pickRandom(mode: GameMode, exclude: string[]): Player {
  const level = mode === 'practice' ? getPracticeLevel() : 'all';
  const pool = PLAYERS.filter((p) => MODES[mode].pool(p) && (level === 'all' || p.difficulty === level));
  const fresh = pool.filter((p) => !exclude.includes(p.id));
  const source = fresh.length > 0 ? fresh : pool;
  return source[Math.floor(Math.random() * source.length)];
}


export function createRound(mode: GameMode, opts: { date?: string; exclude?: string[]; caseNumber?: number; playerId?: string } = {}): RoundState {
  const cfg = MODES[mode];
  let playerId: string;
  let caseNumber: number;
  let date: string | undefined;

  if (mode === 'daily') {
    date = opts.date ?? toDateKey();
    playerId = dailyPlayerId(date);
    caseNumber = caseNumberFor(date);
  } else if (mode === 'legends') {
    // `date` holds the week key; `caseNumber` is the legend's position in the week (1–5).
    date = weekKeyFor(opts.date ?? toDateKey());
    const done = legendsProgress(date).map((r) => r.playerId);
    const list = legendsForWeek(date);
    const nextIdx = Math.max(0, list.findIndex((id) => !done.includes(id)));
    playerId = list[nextIdx];
    caseNumber = nextIdx + 1;
  } else if (opts.playerId && PLAYER_BY_ID[opts.playerId]) {
    playerId = opts.playerId;
    caseNumber = opts.caseNumber ?? 100 + (hashString(`${playerId}:${Date.now()}`) % 900);
  } else {
    playerId = pickRandom(mode, opts.exclude ?? []).id;
    caseNumber = opts.caseNumber ?? 100 + (hashString(`${playerId}:${Date.now()}`) % 900);
  }

  return {
    id: randomId(),
    mode,
    playerId,
    caseNumber,
    date,
    maxAttempts: cfg.maxAttempts,
    hintsAllowed: cfg.hintsAllowed,
    guesses: [],
    revealed: 1,
    status: 'playing',
    startedAt: Date.now(),
  };
}

export type GuessError = 'finished' | 'unknown' | 'duplicate';

export type GuessResult =
  | { ok: true; state: RoundState; correct: boolean }
  | { ok: false; error: GuessError; message: string };

export const GUESS_ERROR_MESSAGE: Record<GuessError, string> = {
  finished: 'This case is already closed.',
  unknown: 'Pick a player from the suggestions — only players in the database can be guessed.',
  duplicate: 'You have already guessed this player.',
};

export function submitGuess(state: RoundState, guessId: string): GuessResult {
  if (state.status !== 'playing') return { ok: false, error: 'finished', message: GUESS_ERROR_MESSAGE.finished };
  const guess = getPlayer(guessId);
  if (!guess) return { ok: false, error: 'unknown', message: GUESS_ERROR_MESSAGE.unknown };
  if (state.guesses.includes(guessId)) return { ok: false, error: 'duplicate', message: GUESS_ERROR_MESSAGE.duplicate };

  const correct = guessId === state.playerId;
  const guesses = [...state.guesses, guessId];
  const wrong = correct ? guesses.length - 1 : guesses.length;
  let next: RoundState = { ...state, guesses };

  if (correct || guesses.length >= state.maxAttempts) {
    next = {
      ...next,
      status: correct ? 'won' : 'lost',
      finishedAt: Date.now(),
      score: calculateScore({ won: correct, wrongGuesses: wrong, cluesRevealed: state.revealed, mode: state.mode }),
    };
  }
  return { ok: true, state: next, correct };
}

/** Ends the round by showing the answer. Costs XP from the player's total. */
export function giveUp(state: RoundState): RoundState {
  if (state.status !== 'playing') return state;
  return {
    ...state,
    status: 'lost',
    gaveUp: true,
    finishedAt: Date.now(),
    score: {
      base: 0, wrongGuessPenalty: 0, cluePenalty: 0, firstGuessBonus: 0, noHintBonus: 0,
      multiplier: 1, revealPenalty: REVEAL_ANSWER_COST, total: -REVEAL_ANSWER_COST,
    },
  };
}

export function totalClues(state: RoundState): number {
  const player = getPlayer(state.playerId);
  return player ? cluesForRound(player, state.mode).length : 0;
}

export function hintsRemaining(state: RoundState): number {
  if (!state.hintsAllowed) return 0;
  return Math.max(0, totalClues(state) - state.revealed);
}

export function revealNextClue(state: RoundState): RoundState {
  if (state.status !== 'playing' || hintsRemaining(state) <= 0) return state;
  return { ...state, revealed: state.revealed + 1 };
}

export function feedbackFor(state: RoundState) {
  const target = getPlayer(state.playerId);
  if (!target) return [];
  return state.guesses
    .map((id) => getPlayer(id))
    .filter((p): p is Player => Boolean(p))
    .map((g) => compareGuess(g, target));
}

export function wrongGuessCount(state: RoundState): number {
  return state.status === 'won' ? state.guesses.length - 1 : state.guesses.length;
}

/** Basic sanity check for persisted rounds (data may change between versions). */
export function isValidRound(v: unknown): v is RoundState {
  if (!v || typeof v !== 'object') return false;
  const r = v as RoundState;
  return (
    typeof r.id === 'string' &&
    typeof r.playerId === 'string' &&
    Boolean(getPlayer(r.playerId)) &&
    Array.isArray(r.guesses) &&
    r.guesses.every((g) => Boolean(getPlayer(g))) &&
    typeof r.revealed === 'number' &&
    ['playing', 'won', 'lost'].includes(r.status) &&
    r.mode in MODES
  );
}
