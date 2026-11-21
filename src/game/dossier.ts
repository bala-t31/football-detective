import type { GameMode, Player } from '@/types';
import { POSITION_LABEL } from '@/data/positions';

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** A short "why this case" note built only from database facts. */
export function caseExplanation(player: Player, mode: GameMode): string {
  const clubs = Array.from(new Set(player.careerClubs));
  const span = player.to ? `${player.from}–${player.to}` : `${player.from}–present`;
  const parts: string[] = [];

  const why =
    mode === 'career'
      ? `Picked for Career Detective because their ${clubs.length}-club trail makes a solvable but winding paper trail.`
      : mode === 'hardcore'
        ? `A ${player.difficulty} profile chosen for Hardcore mode, where only one clue is available.`
        : player.difficulty === 'easy'
          ? 'One of the most recognisable profiles in the database — a fair test for any detective.'
          : player.difficulty === 'medium'
            ? 'A well-known name whose career details reward genuine football knowledge.'
            : 'A deep cut for seasoned detectives.';
  parts.push(why);

  parts.push(
    `${player.nationality} ${POSITION_LABEL[player.position].toLowerCase()} (${span}) who played across ${player.leagues.length} league${
      player.leagues.length === 1 ? '' : 's'
    }${clubs.length > 1 ? ` for ${list(clubs.length > 4 ? [...clubs.slice(0, 4), `${clubs.length - 4} more`] : clubs)}` : ` exclusively for ${clubs[0]}`}.`,
  );

  const honours: string[] = [];
  if (player.worldCupWinner) honours.push('a World Cup winner');
  if (player.ballonDorAwards > 0)
    honours.push(player.ballonDorAwards === 1 ? "a Ballon d'Or winner" : `a ${player.ballonDorAwards}-time Ballon d'Or winner`);
  if (honours.length) parts.push(`Also ${list(honours)}.`);
  return parts.join(' ');
}
