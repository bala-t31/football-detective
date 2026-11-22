import { HONOURS } from './honours';
import type { ClueCategory, Clue, Player, RawPlayer } from '@/types';
import { LEGENDS } from './players/legends';
import { MODERN } from './players/modern';
import { MODERN_2 } from './players/modern2';
import { LEGENDS_2 } from './players/legends2';
import { FAMOUS } from './players/famous';
import { FAMOUS_2 } from './players/famous2';
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

const TROPHY_WORDS = /World Cup|Champions League|European Cup|Ballon d'Or|Premier League|Euro 20|Euro 19|European Championship|Copa América|Africa Cup|Europa League|La Liga|Serie A|Bundesliga|Ligue 1|FA Cup|Copa Libertadores|Olympic gold|treble|Golden Boot|Nations League/;
const WON = /\b(won|win|winner|lifted|champions?|captained .* to)\b/i;

/** Trophy line built from structured data when a player has no hand-written honours. */
function autoHonour(raw: RawPlayer): string | null {
  const parts: string[] = [];
  if (raw.worldCupWinner) parts.push(`the World Cup with ${raw.nationality === 'USA' ? 'the USA' : raw.nationality}`);
  if (raw.ballonDorAwards) parts.push(raw.ballonDorAwards === 1 ? "the Ballon d'Or" : `the Ballon d'Or ${raw.ballonDorAwards} times`);
  return parts.length ? `Won ${parts.join(' and ')}.` : null;
}

/**
 * The first hint should be about what the player won, because that's what most fans remember.
 * Moves an existing trophy clue into second place, or adds one from `honours` / World Cup / Ballon d'Or data.
 */
function withTrophyClue(raw: RawPlayer): [ClueCategory, string][] {
  const clues = [...raw.clues];
  const isTrophy = (text: string) => TROPHY_WORDS.test(text) && WON.test(text);
  // Prefer the biggest trophy: World Cup, then Ballon d'Or, then the Champions League, then anything else.
  const PRIORITY = [/World Cup/, /Ballon d'Or/, /Champions League|European Cup/, /./];
  let idx = -1;
  for (const re of PRIORITY) {
    idx = clues.findIndex(([, text]) => isTrophy(text) && re.test(text));
    if (idx !== -1) break;
  }
  const honours = raw.honours ?? HONOURS[raw.id];
  const extra = honours?.find((h) => !clues.some(([, text]) => text === h)) ?? (idx === -1 ? autoHonour(raw) : null);
  if (honours?.length && extra) {
    clues.splice(1, 0, ['awards', extra]);
  } else if (idx > 1) {
    const [c] = clues.splice(idx, 1);
    clues.splice(1, 0, c);
  } else if (idx === -1 && extra) {
    clues.splice(1, 0, ['awards', extra]);
  }
  return clues;
}

function enrich(raw: RawPlayer): Player {
  const end = raw.to ?? DATA_YEAR;
  const mostRecentClub = raw.careerClubs[raw.careerClubs.length - 1];
  const clues: Clue[] = withTrophyClue(raw).map(([category, text], i) => ({
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

export const PLAYERS: Player[] = [...MODERN, ...MODERN_2, ...LEGENDS, ...LEGENDS_2, ...FAMOUS, ...FAMOUS_2].map(enrich).sort((a, b) => a.name.localeCompare(b.name));

export const PLAYER_BY_ID: Record<string, Player> = Object.fromEntries(PLAYERS.map((p) => [p.id, p]));

export function getPlayer(id: string): Player | undefined {
  return PLAYER_BY_ID[id];
}

/** Stable order (by id) used for deterministic daily selection — independent of display sorting. */
export const PLAYER_IDS_STABLE: string[] = PLAYERS.map((p) => p.id).sort();
