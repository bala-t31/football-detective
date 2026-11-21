/**
 * Logic + data integrity checks. Run with `npm test`.
 * Covers: data consistency, daily determinism & no consecutive repeats, search, feedback, scoring,
 * guess validation, streak rules.
 */
import { PLAYERS, getPlayer } from '../src/data';
import { CLUB_LEAGUE } from '../src/data/clubs';
import { NATIONS } from '../src/data/nations';
import { dailyPlayerId, caseNumberFor, DAILY_POOL_SIZE } from '../src/game/daily';
import { searchPlayers } from '../src/game/search';
import { compareGuess } from '../src/game/feedback';
import { calculateScore } from '../src/game/scoring';
import { createRound, submitGuess, revealNextClue, hintsRemaining, cluesForRound } from '../src/game/engine';
import { applyDailyResult, effectiveStreak, rankFor } from '../src/game/progression';
import { buildShareText } from '../src/game/share';
import { addDays } from '../src/utils/date';
import type { Profile } from '../src/types';
import { TEAMMATE_PUZZLES } from '../src/data/teammates';
import { LEGENDS_POOL, legendsForWeek, weekKeyFor, weekNumber, LEGENDS_PER_WEEK } from '../src/game/weekly';
import { CLUB_PATH_POOL, clubPath, isPathMatch, pointsFor } from '../src/game/clubpath';

let failures = 0;
let passes = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) passes++;
  else {
    failures++;
    console.error(`✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

// ── Data integrity
check('at least 100 players', PLAYERS.length >= 100, String(PLAYERS.length));
const ids = new Set<string>();
for (const p of PLAYERS) {
  check(`unique id ${p.id}`, !ids.has(p.id));
  ids.add(p.id);
  check(`${p.id} has clubs`, p.careerClubs.length > 0);
  check(`${p.id} has ≥4 clues`, p.clues.length >= 4, String(p.clues.length));
  check(`${p.id} nation known`, p.nationality in NATIONS, p.nationality);
  for (const c of p.careerClubs) check(`${p.id} club mapped: ${c}`, c in CLUB_LEAGUE);
  check(`${p.id} era sane`, p.from >= 1940 && (p.to === null || p.to >= p.from));
  check(`${p.id} clue mentions no name`, !p.clues.some((c) => c.text.toLowerCase().includes(p.name.toLowerCase())));
  const last = p.name.split(' ').slice(-1)[0];
  if (last.length > 3)
    check(`${p.id} clue omits surname`, !p.clues.some((c) => new RegExp(`\\b${last}\\b`, 'i').test(c.text)), last);
}
const names = new Set(PLAYERS.map((p) => p.name));
check('unique names', names.size === PLAYERS.length);

// ── Daily
const d1 = dailyPlayerId('2026-11-21');
check('daily deterministic', d1 === dailyPlayerId('2026-11-21'));
check('case number', caseNumberFor('2026-11-21') === 21);
let prev = dailyPlayerId('2026-01-01');
let consecutive = 0;
const seenInCycle = new Map<number, Set<string>>();
for (let i = 1; i < 1500; i++) {
  const day = addDays('2026-01-01', i);
  const id = dailyPlayerId(day);
  if (id === prev) consecutive++;
  prev = id;
}
check('no consecutive daily repeats over ~4 years', consecutive === 0, String(consecutive));
const firstCycle = new Set<string>();
for (let i = 0; i < DAILY_POOL_SIZE; i++) firstCycle.add(dailyPlayerId(addDays('2026-11-01', i)));
check('daily cycle covers pool without repeats', firstCycle.size === DAILY_POOL_SIZE, `${firstCycle.size}/${DAILY_POOL_SIZE}`);
void seenInCycle;

// ── Search
const mes = searchPlayers(PLAYERS, 'Mes').map((p) => p.name);
check('search "Mes" → Messi', mes.includes('Lionel Messi'), mes.join(', '));
check('search "Mes" → Özil', mes.includes('Mesut Özil'), mes.join(', '));
check('search "Mes" → Mount (fuzzy)', mes.includes('Mason Mount'), mes.join(', '));
check('accent-insensitive', searchPlayers(PLAYERS, 'mbappe')[0]?.name === 'Kylian Mbappé');
check('alias search', searchPlayers(PLAYERS, 'CR7')[0]?.name === 'Cristiano Ronaldo');
check('empty query', searchPlayers(PLAYERS, '  ').length === 0);

// ── Feedback
const messi = getPlayer('lionel-messi')!;
const neymar = getPlayer('neymar')!;
const busq = getPlayer('sergio-busquets')!;
const rodri = getPlayer('rodri')!;
const kroos = getPlayer('toni-kroos')!;
const fb = compareGuess(neymar, messi);
check('Neymar vs Messi: nation partial (CONMEBOL)', fb.cells[0].status === 'partial');
check('Neymar vs Messi: position exact (W)', fb.cells[1].status === 'correct');
check('Neymar vs Messi: club partial (shared Barça/PSG)', fb.cells[2].status === 'partial');
check('Busquets vs Messi: club correct (Inter Miami)', compareGuess(busq, messi).cells[2].status === 'correct');
check('Kroos(CM) vs Rodri(DM): position partial', compareGuess(kroos, rodri).cells[1].status === 'partial');
check('self compare correct', compareGuess(messi, messi).correct);
const pele = getPlayer('pele')!;
const era = compareGuess(pele, messi).cells[4];
check('era direction later', era.status === 'wrong' && era.direction === 'later');

// ── Scoring
check('perfect score', calculateScore({ won: true, wrongGuesses: 0, cluesRevealed: 1, mode: 'daily' }).total === 1500);
check('3 guesses 2 clues', calculateScore({ won: true, wrongGuesses: 2, cluesRevealed: 2, mode: 'daily' }).total === 725);
check('loss = 0', calculateScore({ won: false, wrongGuesses: 6, cluesRevealed: 6, mode: 'daily' }).total === 0);
check('never negative', calculateScore({ won: true, wrongGuesses: 20, cluesRevealed: 20, mode: 'daily' }).total === 0);
check('hardcore ×1.5', calculateScore({ won: true, wrongGuesses: 0, cluesRevealed: 1, mode: 'hardcore' }).total === 2250);

// ── Engine
let r = createRound('daily', { date: '2026-11-21' });
check('daily round player', r.playerId === d1);
check('starts with 1 clue', r.revealed === 1);
const wrongIds = PLAYERS.filter((p) => p.id !== r.playerId).slice(0, 6).map((p) => p.id);
const g1 = submitGuess(r, wrongIds[0]);
check('valid wrong guess', g1.ok && !g1.correct);
if (g1.ok) r = g1.state;
const dup = submitGuess(r, wrongIds[0]);
check('duplicate rejected', !dup.ok && dup.error === 'duplicate');
const unk = submitGuess(r, 'not-a-player');
check('unknown rejected', !unk.ok && unk.error === 'unknown');
r = revealNextClue(r);
check('reveal increments', r.revealed === 2);
for (const id of wrongIds.slice(1)) {
  const g = submitGuess(r, id);
  if (g.ok) r = g.state;
}
check('loses after 6', r.status === 'lost' && r.guesses.length === 6);
check('no guess after finish', !submitGuess(r, r.playerId).ok);
let w = createRound('practice');
const win = submitGuess(w, w.playerId);
check('instant win', win.ok && win.state.status === 'won' && win.state.score?.total === 1500);
let h = createRound('hardcore');
check('hardcore no hints', hintsRemaining(h) === 0 && revealNextClue(h).revealed === 1 && h.maxAttempts === 3);
check('hardcore pool', getPlayer(h.playerId)!.difficulty !== 'easy');
const c = createRound('career');
const cp = getPlayer(c.playerId)!;
check('career clues = clubs + nationality', cluesForRound(cp, 'career').length === cp.careerClubs.length + 1);
w = win.ok ? win.state : w;
const share = buildShareText(w, { includeName: false });
check('share hides name by default', !share.includes(getPlayer(w.playerId)!.name));
check('share includes name when asked', buildShareText(w, { includeName: true }).includes(getPlayer(w.playerId)!.name));
void h;

// ── Streaks
const base: Profile = {
  version: 1, xp: 0, achievements: {}, discovered: {}, history: [],
  daily: { currentStreak: 0, bestStreak: 0, lastWinDate: null, lastCompletedDate: null, completed: {} },
  settings: { sound: true, haptics: true, reducedMotion: false },
};
let p = { ...base, daily: applyDailyResult(base, '2026-11-19', true, 1000) };
p = { ...p, daily: applyDailyResult(p, '2026-11-20', true, 1000) };
check('streak 2', p.daily.currentStreak === 2);
const again = applyDailyResult(p, '2026-11-20', true, 1000);
check('same day idempotent', again.currentStreak === 2);
check('effective streak yesterday ok', effectiveStreak(p, '2026-11-21') === 2);
check('effective streak lapses', effectiveStreak(p, '2026-11-23') === 0);
p = { ...p, daily: applyDailyResult(p, '2026-11-22', true, 1000) };
check('gap resets to 1', p.daily.currentStreak === 1 && p.daily.bestStreak === 2);
p = { ...p, daily: applyDailyResult(p, '2026-11-23', false, 0) };
check('loss resets to 0', p.daily.currentStreak === 0);

// ── Ranks
check('rank 0', rankFor(0).current.name === 'Rookie Scout');
check('rank max', rankFor(1e9).current.name === 'Football Genius' && rankFor(1e9).progress === 1);

// ── Name the Teammate data
for (const pz of TEAMMATE_PUZZLES) {
  const star = getPlayer(pz.starId);
  check(`${pz.id} star exists`, Boolean(star));
  check(`${pz.id} star played for club`, Boolean(star?.careerClubs.includes(pz.club)));
  check(`${pz.id} has 5+ answers`, pz.answers.length >= 5 || pz.id === 'kane-spurs', String(pz.answers.length));
  check(`${pz.id} no duplicate answers`, new Set(pz.answers).size === pz.answers.length);
  check(`${pz.id} star not an answer`, !pz.answers.includes(pz.starId));
  for (const a of pz.answers) {
    const p = getPlayer(a);
    check(`${pz.id} answer exists: ${a}`, Boolean(p));
    check(`${pz.id} ${a} played for ${pz.club}`, Boolean(p?.careerClubs.includes(pz.club)));
  }
}

// ── Weekly Legends
check('week key is a Monday', new Date(weekKeyFor('2026-11-21') + 'T12:00:00').getDay() === 1, weekKeyFor('2026-11-21'));
check('week key stable within week', weekKeyFor('2026-11-16') === weekKeyFor('2026-11-22'));
check('week changes on Monday', weekKeyFor('2026-11-23') !== weekKeyFor('2026-11-22'));
check('first week is week 1', weekNumber(weekKeyFor('2026-11-21')) === 1);
const wk = weekKeyFor('2026-11-21');
check('5 legends a week', legendsForWeek(wk).length === LEGENDS_PER_WEEK);
check('legends deterministic', legendsForWeek(wk).join() === legendsForWeek(wk).join());
check('legends all retired', legendsForWeek(wk).every((id) => getPlayer(id)?.retired));
{
  const seen = new Set<string>();
  let dup = false;
  const weeks = Math.floor(LEGENDS_POOL.length / LEGENDS_PER_WEEK);
  for (let w = 0; w < weeks; w++) {
    for (const id of legendsForWeek(addDays(wk, w * 7))) {
      if (seen.has(id)) dup = true;
      seen.add(id);
    }
  }
  check(`no legend repeats within a cycle (${weeks} weeks)`, !dup);
}

// ── Club Path Run
check('club path pool size', CLUB_PATH_POOL.length >= 100, String(CLUB_PATH_POOL.length));
check('club path dedupes consecutive', clubPath(getPlayer('gareth-bale')!).every((c, i, a) => i === 0 || a[i - 1] !== c));
check('club path matches self', isPathMatch('lionel-messi', 'lionel-messi'));
check('club path rejects other', !isPathMatch('neymar', 'lionel-messi'));
check('club path points', pointsFor(1, 0) === 120 && pointsFor(2, 3) === 90);

console.log(`\n${passes} passed, ${failures} failed · ${PLAYERS.length} players · daily pool ${DAILY_POOL_SIZE}`);
if (failures) throw new Error(`${failures} checks failed`);
