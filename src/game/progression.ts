import type { GameMode, Achievement, GameRecord, Profile, Rank } from '@/types';
import { addDays, daysBetween } from '@/utils/date';

// ─── Ranks ──────────────────────────────────────────────────────────

export const RANKS: Rank[] = [
  { name: 'Zero Ball Knowledge', minXp: 0 },
  { name: 'Casual Fan', minXp: 1_500 },
  { name: 'Highlights Merchant', minXp: 4_000 },
  { name: 'Ball Knower', minXp: 9_000 },
  { name: 'Certified Ball Knower', minXp: 18_000 },
  { name: 'Elite Ball Knowledge', minXp: 32_000 },
  { name: 'Ball Knowledge GOAT', minXp: 55_000 },
];

export function rankFor(xp: number) {
  let idx = 0;
  RANKS.forEach((r, i) => {
    if (xp >= r.minXp) idx = i;
  });
  const current = RANKS[idx];
  const next = RANKS[idx + 1];
  const progress = next ? (xp - current.minXp) / (next.minXp - current.minXp) : 1;
  return { index: idx, current, next, progress: Math.min(1, Math.max(0, progress)), toNext: next ? next.minXp - xp : 0 };
}

// ─── Achievements ───────────────────────────────────────────────────

const wins = (p: Profile) => p.history.filter((h) => h.won);
/** Modes played as a clue-and-guess round; guess and clue counts only mean something there. */
export const CLASSIC_MODES: GameMode[] = ['daily', 'practice', 'hardcore', 'career', 'legends'];
const classicWins = (p: Profile) => wins(p).filter((h) => CLASSIC_MODES.includes(h.mode));

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-case', title: 'First Case', description: 'Solve your first mystery.', icon: 'search', check: (p) => wins(p).length >= 1 },
  {
    id: 'perfect-detective', title: 'Perfect Detective', description: 'Solve a case on the first guess.', icon: 'target',
    check: (p) => classicWins(p).some((h) => h.guesses === 1),
  },
  {
    id: 'no-hints', title: 'No Hints', description: 'Solve without revealing extra clues.', icon: 'eye-off',
    check: (p) => classicWins(p).some((h) => h.cluesRevealed === 1),
  },
  { id: 'football-brain', title: 'Football Brain', description: 'Solve 10 cases.', icon: 'brain', check: (p) => wins(p).length >= 10 },
  {
    id: 'streak-master', title: 'Streak Master', description: 'Complete 7 consecutive daily challenges.', icon: 'flame',
    check: (p) => p.daily.bestStreak >= 7,
  },
  {
    id: 'hardcore-hero', title: 'Hardcore Hero', description: 'Complete a hardcore case.', icon: 'skull',
    check: (p) => wins(p).some((h) => h.mode === 'hardcore'),
  },
  {
    id: 'transfer-expert', title: 'Transfer Expert', description: 'Solve a career-history mystery.', icon: 'route',
    check: (p) => wins(p).some((h) => h.mode === 'career'),
  },
  {
    id: 'legend-hunter', title: 'Legend Hunter', description: 'Identify 25 different footballers.', icon: 'trophy',
    check: (p) => Object.keys(p.discovered).length >= 25,
  },
  {
    id: 'daily-regular', title: 'Daily Regular', description: 'Solve a Daily Case.', icon: 'calendar',
    check: (p) => wins(p).some((h) => h.mode === 'daily'),
  },
  {
    id: 'high-scorer', title: 'High Scorer', description: 'Score 1,400+ XP in a single case.', icon: 'zap',
    check: (p) => p.history.some((h) => h.score >= 1400),
  },
  {
    id: 'path-finder', title: 'Path Finder', description: 'Name 5 players in a row in Club Path Run.', icon: 'waypoints',
    check: (p) => wins(p).some((h) => h.mode === 'clubpath' && h.caseNumber >= 5),
  },
  {
    id: 'dressing-room', title: 'Dressing Room', description: 'Name 5 teammates of one star.', icon: 'users',
    check: (p) => p.history.some((h) => h.mode === 'teammate' && h.caseNumber >= 5),
  },
  {
    id: 'hall-of-fame', title: 'Hall of Fame', description: 'Solve 5 Weekly Legends.', icon: 'crown',
    check: (p) => wins(p).filter((h) => h.mode === 'legends').length >= 5,
  },
  {
    id: 'team-sheet', title: 'Team Sheet', description: 'Name a full XI in Guess the XI.', icon: 'shirt',
    check: (p) => p.history.some((h) => h.mode === 'xi' && h.caseNumber >= 11),
  },
  {
    id: 'transfer-guru', title: 'Transfer Guru', description: 'Get 7 of 8 fees right in Transfer Fee.', icon: 'banknote',
    check: (p) => p.history.some((h) => h.mode === 'transfer' && h.caseNumber >= 7),
  },
  {
    id: 'time-keeper', title: 'Time Keeper', description: 'Get 10 in a row in Higher or Lower.', icon: 'arrow-up-down',
    check: (p) => p.history.some((h) => h.mode === 'higherlower' && h.caseNumber >= 10),
  },
];

export const ACHIEVEMENT_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

export function newlyUnlocked(profile: Profile, last?: GameRecord): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !profile.achievements[a.id] && a.check(profile, last));
}

// ─── Streaks ────────────────────────────────────────────────────────

export const MAX_FREEZES = 2;
export const FREEZE_EVERY = 7;

/** Days missed between the last win and `date` (not counting either end). */
function missedSince(last: string, date: string): number {
  return Math.max(0, daysBetween(last, date) - 1);
}

/**
 * The streak as it stands today. It lapses if the last win was before yesterday, unless there are
 * enough streak freezes to cover the missed days (they are used up when the next case is solved).
 */
export function effectiveStreak(profile: Profile, today: string): number {
  const last = profile.daily.lastWinDate;
  if (!last || profile.daily.currentStreak === 0) return 0;
  if (last === today) return profile.daily.currentStreak;
  const missed = missedSince(last, today);
  return missed <= (profile.daily.freezes ?? 0) ? profile.daily.currentStreak : 0;
}

/** Freezes that today's case would use if solved (0 when nothing was missed). */
export function freezesNeeded(profile: Profile, today: string): number {
  const last = profile.daily.lastWinDate;
  if (!last || profile.daily.currentStreak === 0 || last === today) return 0;
  const missed = missedSince(last, today);
  return missed <= (profile.daily.freezes ?? 0) ? missed : 0;
}

/** Returns updated daily stats after finishing the daily case for `date`. Idempotent per date. */
export function applyDailyResult(profile: Profile, date: string, won: boolean, score: number): Profile['daily'] {
  const d = profile.daily;
  if (d.completed[date]) return d;
  let freezes = d.freezes ?? 0;
  let frozen = d.frozen ?? [];
  let currentStreak: number;
  if (won) {
    const missed = d.lastWinDate && d.currentStreak > 0 ? missedSince(d.lastWinDate, date) : Infinity;
    if (missed === 0) currentStreak = d.currentStreak + 1;
    else if (missed <= freezes) {
      // Freezes cover the missed days, so the streak carries on.
      for (let i = 1; i <= missed; i++) frozen = [...frozen, addDays(d.lastWinDate!, i)];
      freezes -= missed;
      currentStreak = d.currentStreak + 1;
    } else currentStreak = 1;
    if (currentStreak % FREEZE_EVERY === 0) freezes = Math.min(MAX_FREEZES, freezes + 1);
  } else {
    currentStreak = 0;
  }
  return {
    currentStreak,
    bestStreak: Math.max(d.bestStreak, currentStreak),
    lastWinDate: won ? date : d.lastWinDate,
    lastCompletedDate: date,
    completed: { ...d.completed, [date]: { won, score } },
    freezes,
    frozen: frozen.slice(-30),
  };
}
