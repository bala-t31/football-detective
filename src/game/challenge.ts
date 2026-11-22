/**
 * Head-to-head challenges without a server: the friend's result and the player travel inside the
 * link itself. The payload is lightly scrambled so the answer isn't readable in the URL.
 */
import type { ChallengeTarget, GameMode, RoundState } from '@/types';
import { PLAYER_BY_ID } from '@/data';
import { createRound } from './engine';
import { storage } from '@/utils/storage';

export const SITE = 'https://football-detective.netlify.app';
/** The app's own link scheme, used by the website's "Open in the app" button. */
export const APP_SCHEME = 'footballdetective';

/** Modes a challenge can be played in; anything else is played as Practice. */
const CHALLENGE_MODES: GameMode[] = ['practice', 'hardcore', 'career'];

export interface Challenge extends ChallengeTarget {
  playerId: string;
  mode: GameMode;
}

const KEY = 'fd-1v1';

function scramble(bytes: Uint8Array): Uint8Array {
  return bytes.map((b, i) => b ^ KEY.charCodeAt(i % KEY.length) ^ (i * 7) & 0xff);
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export function encodeChallenge(c: Challenge): string {
  const json = JSON.stringify([1, c.playerId, c.mode, c.won ? 1 : 0, c.guesses, c.clues, c.score]);
  return toBase64Url(scramble(new TextEncoder().encode(json)));
}

export function decodeChallenge(code: string): Challenge | null {
  try {
    const arr = JSON.parse(new TextDecoder().decode(scramble(fromBase64Url(code.trim()))));
    if (!Array.isArray(arr) || arr[0] !== 1) return null;
    const [, playerId, mode, won, guesses, clues, score] = arr;
    if (typeof playerId !== 'string' || !PLAYER_BY_ID[playerId]) return null;
    const num = (v: unknown, max: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.round(v))) : 0);
    return {
      playerId,
      mode: CHALLENGE_MODES.includes(mode) ? mode : 'practice',
      won: won === 1,
      guesses: num(guesses, 10),
      clues: num(clues, 12),
      score: num(score, 5000),
    };
  } catch {
    return null;
  }
}

export function challengeFromRound(round: RoundState): Challenge {
  return {
    playerId: round.playerId,
    mode: CHALLENGE_MODES.includes(round.mode) ? round.mode : 'practice',
    won: round.status === 'won',
    guesses: round.guesses.length,
    clues: round.revealed,
    score: round.status === 'won' ? (round.score?.total ?? 0) : 0,
  };
}

export function challengeUrl(c: Challenge): string {
  return `${SITE}/c/#${encodeChallenge(c)}`;
}

export function challengeText(c: Challenge): string {
  const line = c.won
    ? `I found this footballer in ${c.guesses} guess${c.guesses === 1 ? '' : 'es'} for ${c.score} XP. Can you beat me on the same player?`
    : `This footballer beat me. Can you find him?`;
  return `⚔️ Football Detective challenge\n${line}`;
}

/** Starts the challenge round and returns the mode to open. */
export function startChallenge(c: Challenge): GameMode {
  const round = createRound(c.mode, { playerId: c.playerId });
  round.challenge = { won: c.won, guesses: c.guesses, clues: c.clues, score: c.score };
  storage.set(`round.active.${c.mode}`, round);
  // Lets an open game screen reload with the new round.
  window.dispatchEvent(new Event('fd:challenge'));
  return c.mode;
}

/** Did you beat the friend? Fewer guesses wins; a tie goes to the higher score. */
export function challengeOutcome(round: RoundState): 'won' | 'lost' | 'draw' | null {
  const t = round.challenge;
  if (!t || round.status === 'playing') return null;
  const youWon = round.status === 'won' && !round.gaveUp;
  if (!t.won) return youWon ? 'won' : 'draw';
  if (!youWon) return 'lost';
  if (round.guesses.length !== t.guesses) return round.guesses.length < t.guesses ? 'won' : 'lost';
  const you = round.score?.total ?? 0;
  return you === t.score ? 'draw' : you > t.score ? 'won' : 'lost';
}
