/** Checks for the 1.6 features: streak freezes, challenges, new modes and their data. */
import { getPlayer, PLAYERS } from '../src/data';
import { applyDailyResult, effectiveStreak, freezesNeeded } from '../src/game/progression';
import { defaultProfile } from '../src/hooks/useProfile';
import { challengeOutcome, decodeChallenge, encodeChallenge } from '../src/game/challenge';
import { createRound } from '../src/game/engine';
import { TRANSFERS } from '../src/data/transfers';
import { feeOptions, TRANSFER_POOL } from '../src/game/modes/transfer';
import { LINEUPS, normName } from '../src/data/lineups';
import { matchXi, xiPlayers, xiScore } from '../src/game/modes/xi';
import { EMOJI_POOL, emojiTiles } from '../src/game/modes/emoji';
import { HL_POOL, hlAnswer, nextHlPlayer } from '../src/game/modes/higherlower';
import { addDays } from '../src/utils/date';
import type { Profile } from '../src/types';

let failures = 0;
let passes = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) passes++;
  else {
    failures++;
    console.error(`✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

// ── Streak freezes
{
  let p: Profile = defaultProfile();
  const d0 = '2026-12-01';
  for (let i = 0; i < 7; i++) p = { ...p, daily: applyDailyResult(p, addDays(d0, i), true, 500) };
  check('7 wins → streak 7', p.daily.currentStreak === 7);
  check('7 wins → 1 freeze', (p.daily.freezes ?? 0) === 1, String(p.daily.freezes));
  const missedDay = addDays(d0, 7);
  const back = addDays(d0, 8);
  check('one missed day keeps the streak alive with a freeze', effectiveStreak(p, back) === 7);
  check('freeze would be used', freezesNeeded(p, back) === 1);
  check('two missed days without enough freezes lapses', effectiveStreak(p, addDays(d0, 9)) === 0);
  p = { ...p, daily: applyDailyResult(p, back, true, 500) };
  check('streak continues over the frozen day', p.daily.currentStreak === 8, String(p.daily.currentStreak));
  check('freeze used up', (p.daily.freezes ?? 0) === 0);
  check('frozen day recorded', (p.daily.frozen ?? []).includes(missedDay));
  let q: Profile = defaultProfile();
  for (let i = 0; i < 21; i++) q = { ...q, daily: applyDailyResult(q, addDays(d0, i), true, 500) };
  check('freezes capped at 2', q.daily.freezes === 2, String(q.daily.freezes));
  q = { ...q, daily: applyDailyResult(q, addDays(d0, 21), false, 0) };
  check('a loss still ends the streak', effectiveStreak(q, addDays(d0, 22)) === 0 && q.daily.currentStreak === 0);
  const fresh = defaultProfile();
  check('old profiles without freezes work', effectiveStreak(fresh, d0) === 0 && freezesNeeded(fresh, d0) === 0);
}

// ── Challenges
{
  const c = { playerId: 'lionel-messi', mode: 'hardcore' as const, won: true, guesses: 3, clues: 1, score: 1250 };
  const code = encodeChallenge(c);
  check('challenge code is url safe', /^[A-Za-z0-9_-]+$/.test(code), code);
  check('challenge code hides the player', !code.toLowerCase().includes('messi'));
  const back = decodeChallenge(code);
  check('challenge round trip', JSON.stringify(back) === JSON.stringify(c), JSON.stringify(back));
  check('bad code rejected', decodeChallenge('hello') === null && decodeChallenge('') === null);
  const bogus = encodeChallenge({ ...c, playerId: 'not-a-player' });
  check('unknown player rejected', decodeChallenge(bogus) === null);
  const weird = decodeChallenge(encodeChallenge({ ...c, mode: 'daily' }));
  check('daily challenge played as practice', weird?.mode === 'practice');
  const r = createRound('practice', { playerId: 'lionel-messi' });
  check('round uses the challenged player', r.playerId === 'lionel-messi');
  const won = { ...r, challenge: { won: true, guesses: 3, clues: 1, score: 900 }, status: 'won' as const, guesses: ['a', 'lionel-messi'], score: { base: 0, wrongGuessPenalty: 0, cluePenalty: 0, firstGuessBonus: 0, noHintBonus: 0, multiplier: 1, total: 800 } };
  check('fewer guesses wins the challenge', challengeOutcome(won) === 'won');
  check('more guesses loses', challengeOutcome({ ...won, guesses: ['a', 'b', 'c', 'lionel-messi'] }) === 'lost');
  check('same guesses, higher score wins', challengeOutcome({ ...won, guesses: ['a', 'b', 'lionel-messi'], score: { ...won.score, total: 1000 } }) === 'won');
  check('giving up loses', challengeOutcome({ ...won, gaveUp: true }) === 'lost');
  check('beating a friend who failed', challengeOutcome({ ...won, challenge: { won: false, guesses: 6, clues: 6, score: 0 } }) === 'won');
}

// ── Transfer Fee
check('all transfers use known players', TRANSFER_POOL.length === TRANSFERS.length, TRANSFERS.filter((t) => !getPlayer(t.playerId)).map((t) => t.playerId).join());
for (const t of TRANSFERS) {
  const p = getPlayer(t.playerId);
  const clubs = p?.careerClubs ?? [];
  const i = clubs.indexOf(t.from);
  check(`${t.playerId}: ${t.from} → ${t.to} is in his career`, i >= 0 && clubs.slice(i + 1).includes(t.to), clubs.join(' / '));
  check(`${t.playerId}: year within career`, Boolean(p && t.year >= p.from && t.year <= (p.to ?? 2026)));
  for (let k = 0; k < 20; k++) {
    const opts = feeOptions(t);
    const spaced = opts.every((a, x) => opts.every((b, y) => x === y || Math.abs(a - b) / Math.max(a, b) >= 0.2));
    if (opts.length !== 4 || !opts.includes(t.fee) || !spaced) {
      check(`${t.playerId}: 4 spaced options incl. the fee`, false, opts.join());
      break;
    }
  }
}
check('at least 8 transfers', TRANSFER_POOL.length >= 8);

// ── Guess the XI
check('12 line-ups', LINEUPS.length >= 12, String(LINEUPS.length));
for (const l of LINEUPS) {
  const players = xiPlayers(l);
  check(`${l.id}: 11 starters`, players.length === 11, String(players.length));
  check(`${l.id}: one goalkeeper row`, l.rows[0].length === 1);
  check(`${l.id}: star in database`, Boolean(getPlayer(l.starId)));
  check(`${l.id}: formation adds up`, l.formation.split('-').reduce((a, b) => a + Number(b), 0) === 10, l.formation);
  const seen = new Map<string, string>();
  for (const p of players) {
    for (const a of p.accept) {
      const n = normName(a);
      if (seen.has(n) && seen.get(n) !== p.name) check(`${l.id}: "${a}" matches one player only`, false, `${seen.get(n)} / ${p.name}`);
      seen.set(n, p.name);
    }
    check(`${l.id}: ${p.name} matches by full name`, matchXi(l, p.name, [])?.name === p.name);
  }
}
{
  const arg = LINEUPS.find((l) => l.id === 'argentina-2022')!;
  check('xi: surname works', matchXi(arg, 'messi', [])?.name === 'Lionel Messi');
  check('xi: accents ignored', matchXi(arg, 'julian alvarez', [])?.name === 'Julián Álvarez');
  check('xi: found players not matched again', matchXi(arg, 'messi', ['Lionel Messi']) === null);
  check('xi: wrong name', matchXi(arg, 'aguero', []) === null);
  const fr = LINEUPS.find((l) => l.id === 'france-2018')!;
  check("xi: N'Golo Kanté without apostrophe", matchXi(fr, 'ngolo kante', [])?.name === "N'Golo Kanté");
  check('xi score full bonus', xiScore(11) === 11 * 25 + 50 && xiScore(5) === 125);
}

// ── Emoji Clue
check('emoji pool is large', EMOJI_POOL.length >= 150, String(EMOJI_POOL.length));
check('messi emojis include a World Cup and Ballon d’Or', emojiTiles(getPlayer('lionel-messi')!).some((t) => t.emoji === '🏆') && emojiTiles(getPlayer('lionel-messi')!).some((t) => t.emoji.startsWith('🥇')));
const missingFlag = PLAYERS.filter((p) => emojiTiles(p).filter((t) => t.meaning.includes('played in')).length === 0);
check('every player has at least one country emoji', missingFlag.length === 0, missingFlag.slice(0, 5).map((p) => p.leagues.join('/')).join(', '));

// ── Higher or Lower
check('higher/lower pool', HL_POOL.length >= 150, String(HL_POOL.length));
{
  let ok = true;
  let a = nextHlPlayer(null, []);
  for (let i = 0; i < 300; i++) {
    const b = nextHlPlayer(a, [a.id]);
    if (b.from === a.from || b.id === a.id) ok = false;
    a = b;
  }
  check('higher/lower never shows a tie', ok);
  check('earlier/later', hlAnswer(getPlayer('lionel-messi')!, getPlayer('zinedine-zidane')!) === 'earlier');
}

console.log(`\n${passes} passed, ${failures} failed · v1.6 checks`);
if (failures) throw new Error(`${failures} checks failed`);
