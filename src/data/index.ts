import type { Clue, Player, RawPlayer } from '@/types';
import { LEGENDS } from './players/legends';
import { MODERN } from './players/modern';
import { MODERN_2 } from './players/modern2';
import { LEGENDS_2 } from './players/legends2';
import { leagueOf } from './clubs';

const DIFFICULTY_BY_ORDER = ['easy', 'easy', 'medium', 'medium', 'hard', 'hard', 'hard'] as const;

function decadesBetween(from: number, to: number): string[] {
  const out: string[] = [];
  for (let d = Math.floor(from / 10) * 10; d <= to; d += 10) out.push(`${d}s`);
  return out;
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export const DATA_YEAR = 2026;

function enrich(raw: RawPlayer): Player {
  const end = raw.to ?? DATA_YEAR;
  const mostRecentClub = raw.careerClubs[raw.careerClubs.length - 1];
  const clues: Clue[] = raw.clues.map(([category, text], i) => ({
    id: `${raw.id}-c${i + 1}`,
    text,
    category,
    difficulty: DIFFICULTY_BY_ORDER[Math.min(i, DIFFICULTY_BY_ORDER.length - 1)],
    order: i + 1,
  }));
  return {
    id: raw.id,
    name: raw.name,
    aka: raw.aka ?? [],
    nationality: raw.nationality,
    position: raw.position,
    secondaryPositions: raw.secondaryPositions ?? [],
    currentClub: raw.to === null ? mostRecentClub : 'Retired',
    mostRecentClub,
    careerClubs: raw.careerClubs,
    leagues: unique(raw.careerClubs.map(leagueOf)),
    mostRecentLeague: leagueOf(mostRecentClub),
    careerEra: decadesBetween(raw.from, end),
    from: raw.from,
    to: raw.to,
    retired: raw.to !== null,
    shirtNumbers: raw.shirtNumbers ?? [],
    worldCupWinner: raw.worldCupWinner ?? false,
    ballonDorAwards: raw.ballonDorAwards ?? 0,
    difficulty: raw.difficulty,
    clues,
  };
}

export const PLAYERS: Player[] = [...MODERN, ...MODERN_2, ...LEGENDS, ...LEGENDS_2].map(enrich).sort((a, b) => a.name.localeCompare(b.name));

export const PLAYER_BY_ID: Record<string, Player> = Object.fromEntries(PLAYERS.map((p) => [p.id, p]));

export function getPlayer(id: string): Player | undefined {
  return PLAYER_BY_ID[id];
}

/** Stable order (by id) used for deterministic daily selection — independent of display sorting. */
export const PLAYER_IDS_STABLE: string[] = PLAYERS.map((p) => p.id).sort();
