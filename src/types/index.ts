// ─── Core domain types ──────────────────────────────────────────────

export type PositionCode = 'GK' | 'CB' | 'FB' | 'DM' | 'CM' | 'AM' | 'W' | 'ST';
export type PositionGroup = 'GK' | 'DEF' | 'MID' | 'FWD';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Era = string; // e.g. "1990s"

export type ClueCategory =
  | 'nationality'
  | 'position'
  | 'clubs'
  | 'league'
  | 'international'
  | 'awards'
  | 'teammates'
  | 'shirt'
  | 'transfer'
  | 'milestone'
  | 'record';

/** Shape authored in the data files. Derived fields are computed in data/index.ts. */
export interface RawPlayer {
  id: string;
  name: string;
  /** Alternative spellings / nicknames used by search. */
  aka?: string[];
  nationality: string;
  position: PositionCode;
  secondaryPositions?: PositionCode[];
  /** Senior clubs in chronological order (selected — very short loans may be omitted). */
  careerClubs: string[];
  /** First senior season (calendar year). */
  from: number;
  /** Year of retirement, or null if still active. */
  to: number | null;
  shirtNumbers?: number[];
  worldCupWinner?: boolean;
  ballonDorAwards?: number;
  difficulty: Difficulty;
  /** Ordered least → most specific. */
  clues: [ClueCategory, string][];
}

export interface Clue {
  id: string;
  text: string;
  category: ClueCategory;
  difficulty: Difficulty;
  order: number;
}

export interface Player {
  id: string;
  name: string;
  aka: string[];
  nationality: string;
  position: PositionCode;
  secondaryPositions: PositionCode[];
  currentClub: string; // "Retired" for retired players
  mostRecentClub: string;
  careerClubs: string[];
  leagues: string[];
  mostRecentLeague: string;
  careerEra: Era[];
  from: number;
  to: number | null;
  retired: boolean;
  shirtNumbers: number[];
  worldCupWinner: boolean;
  ballonDorAwards: number;
  difficulty: Difficulty;
  clues: Clue[];
  imageUrl?: string;
}

// ─── Game types ─────────────────────────────────────────────────────

export type GameMode = 'daily' | 'practice' | 'hardcore' | 'career';
export type RoundStatus = 'playing' | 'won' | 'lost';
export type FeedbackStatus = 'correct' | 'partial' | 'wrong';

export interface FeedbackCell {
  key: 'nationality' | 'position' | 'club' | 'league' | 'era';
  label: string;
  value: string;
  status: FeedbackStatus;
  /** For era: is the mystery player earlier or later than the guess? */
  direction?: 'earlier' | 'later';
  /** True when the value shown is something shared with the mystery player (club/league partials). */
  shared?: boolean;
}

export interface GuessFeedback {
  playerId: string;
  correct: boolean;
  cells: FeedbackCell[];
}

export interface ScoreBreakdown {
  base: number;
  wrongGuessPenalty: number;
  cluePenalty: number;
  firstGuessBonus: number;
  noHintBonus: number;
  multiplier: number;
  total: number;
}

export interface RoundState {
  id: string;
  mode: GameMode;
  playerId: string;
  caseNumber: number;
  date?: string; // YYYY-MM-DD for daily
  maxAttempts: number;
  hintsAllowed: boolean;
  guesses: string[];
  revealed: number;
  status: RoundStatus;
  startedAt: number;
  finishedAt?: number;
  score?: ScoreBreakdown;
}

export interface GameRecord {
  id: string;
  mode: GameMode;
  playerId: string;
  caseNumber: number;
  date: string;
  won: boolean;
  guesses: number;
  cluesRevealed: number;
  score: number;
  finishedAt: number;
}

export interface Settings {
  sound: boolean;
  haptics: boolean;
  reducedMotion: boolean;
}

export interface Profile {
  version: 1;
  xp: number;
  achievements: Record<string, number>; // id → unlockedAt
  discovered: Record<string, number>; // playerId → first solved at
  history: GameRecord[];
  daily: {
    currentStreak: number;
    bestStreak: number;
    lastWinDate: string | null;
    lastCompletedDate: string | null;
    completed: Record<string, { won: boolean; score: number }>;
  };
  settings: Settings;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name key
  check: (p: Profile, last?: GameRecord) => boolean;
}

export interface Rank {
  name: string;
  minXp: number;
}
