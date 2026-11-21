import type { FeedbackCell, FeedbackStatus, GuessFeedback, Player } from '@/types';
import { nationInfo } from '@/data/nations';
import { POSITION_GROUP, POSITION_LABEL } from '@/data/positions';

function compareNationality(guess: Player, target: Player): FeedbackCell {
  let status: FeedbackStatus = 'wrong';
  if (guess.nationality === target.nationality) status = 'correct';
  else if (nationInfo(guess.nationality).confederation === nationInfo(target.nationality).confederation) status = 'partial';
  return { key: 'nationality', label: 'Nation', value: guess.nationality, status };
}

function comparePosition(guess: Player, target: Player): FeedbackCell {
  let status: FeedbackStatus = 'wrong';
  if (guess.position === target.position) status = 'correct';
  else if (
    POSITION_GROUP[guess.position] === POSITION_GROUP[target.position] ||
    target.secondaryPositions.includes(guess.position) ||
    guess.secondaryPositions.includes(target.position)
  )
    status = 'partial';
  return { key: 'position', label: 'Position', value: POSITION_LABEL[guess.position], status };
}

function compareClub(guess: Player, target: Player): FeedbackCell {
  if (guess.mostRecentClub === target.mostRecentClub)
    return { key: 'club', label: 'Club', value: guess.mostRecentClub, status: 'correct' };
  const shared = [...guess.careerClubs].reverse().find((c) => target.careerClubs.includes(c));
  if (shared) return { key: 'club', label: 'Club', value: shared, status: 'partial', shared: true };
  return { key: 'club', label: 'Club', value: guess.mostRecentClub, status: 'wrong' };
}

function compareLeague(guess: Player, target: Player): FeedbackCell {
  if (guess.mostRecentLeague === target.mostRecentLeague)
    return { key: 'league', label: 'League', value: guess.mostRecentLeague, status: 'correct' };
  const shared = [...guess.leagues].reverse().find((l) => target.leagues.includes(l));
  if (shared) return { key: 'league', label: 'League', value: shared, status: 'partial', shared: true };
  return { key: 'league', label: 'League', value: guess.mostRecentLeague, status: 'wrong' };
}

function midpoint(p: Player): number {
  return (p.from + (p.to ?? new Date().getFullYear())) / 2;
}

function compareEra(guess: Player, target: Player): FeedbackCell {
  const g = guess.careerEra;
  const t = target.careerEra;
  const same = g.length === t.length && g.every((e) => t.includes(e));
  const overlap = g.some((e) => t.includes(e));
  const status: FeedbackStatus = same ? 'correct' : overlap ? 'partial' : 'wrong';
  const value = g.length > 1 ? `${g[0]}–${g[g.length - 1].slice(-3)}` : g[0];
  const cell: FeedbackCell = { key: 'era', label: 'Era', value, status };
  if (!same) cell.direction = midpoint(target) < midpoint(guess) ? 'earlier' : 'later';
  return cell;
}

export function compareGuess(guess: Player, target: Player): GuessFeedback {
  return {
    playerId: guess.id,
    correct: guess.id === target.id,
    cells: [
      compareNationality(guess, target),
      comparePosition(guess, target),
      compareClub(guess, target),
      compareLeague(guess, target),
      compareEra(guess, target),
    ],
  };
}

export const FEEDBACK_EMOJI: Record<FeedbackStatus, string> = { correct: '🟩', partial: '🟨', wrong: '⬛' };
