import type { GameMode, Achievement, GameRecord, Profile, Rank } from '@/types';
import { addDays } from '@/utils/date';

// ─── Ranks ──────────────────────────────────────────────────────────

export const RANKS: Rank[] = [
  { name: 'Rookie Scout', minXp: 0 },
  { name: 'Amateur Detective', minXp: 2_000 },
  { name: 'Football Analyst', minXp: 6_000 },
  { name: 'Elite Scout', minXp: 14_000 },
  { name: 'Master Detective', minXp: 28_000 },
  { name: 'Football Genius', minXp: 50_000 },
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
];

export const ACHIEVEMENT_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

export function newlyUnlocked(profile: Profile, last?: GameRecord): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !profile.achievements[a.id] && a.check(profile, last));
}

// ─── Streaks ────────────────────────────────────────────────────────

/** The streak as it stands today: it lapses if the last win was before yesterday. */
export function effectiveStreak(profile: Profile, today: string): number {
  const last = profile.daily.lastWinDate;
  if (!last) return 0;
  if (last === today || last === addDays(today, -1)) return profile.daily.currentStreak;
  return 0;
}

/** Returns updated daily stats after finishing the daily case for `date`. Idempotent per date. */
export function applyDailyResult(profile: Profile, date: string, won: boolean, score: number): Profile['daily'] {
  const d = profile.daily;
  if (d.completed[date]) return d;
  let currentStreak: number;
  if (won) {
    const continuing = d.lastWinDate === addDays(date, -1);
    currentStreak = continuing ? d.currentStreak + 1 : 1;
  } else {
    currentStreak = 0;
  }
  return {
    currentStreak,
    bestStreak: Math.max(d.bestStreak, currentStreak),
    lastWinDate: won ? date : d.lastWinDate,
    lastCompletedDate: date,
    completed: { ...d.completed, [date]: { won, score } },
  };
}
