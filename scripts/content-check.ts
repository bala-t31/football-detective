/**
 * Checks website/data/content.json before it is published: `npm run content:check`.
 * It loads the file the same way the app does, then runs the full test suite on the merged data,
 * so a typo can never ship a broken player.
 */
import { readFileSync } from 'node:fs';

const raw = JSON.parse(readFileSync(new URL('../website/data/content.json', import.meta.url), 'utf8'));
const KEY = 'football-detective:content.v1';
const mem = new Map<string, string>([[KEY, JSON.stringify(raw)]]);
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
  key: () => null,
  clear: () => mem.clear(),
  length: 0,
};
(globalThis as { __APP_VERSION__?: string }).__APP_VERSION__ = '99.0.0';

const problems: string[] = [];
const { sanitizeContent } = await import('../src/data/remote');
const { PLAYER_BY_ID, CONTENT_REV, SCHEDULED_DAYS } = await import('../src/data');
const { CLUB_LEAGUE } = await import('../src/data/clubs');
const { NATIONS } = await import('../src/data/nations');

const clean = sanitizeContent(raw);
if (!clean) problems.push('file is not valid content (rev missing?)');
else {
  if (CONTENT_REV !== clean.rev) problems.push(`content was not loaded (rev ${CONTENT_REV})`);
  const rawPlayers: { id?: string }[] = Array.isArray(raw.players) ? raw.players : [];
  if (rawPlayers.length !== (clean.players ?? []).length) {
    const ok = new Set((clean.players ?? []).map((p) => p.id));
    for (const p of rawPlayers) if (!ok.has(p.id ?? '')) problems.push(`player ${p.id ?? '?'} has a bad shape (check every field)`);
  }
  for (const p of clean.players ?? []) {
    if (!NATIONS[p.nationality]) problems.push(`${p.id}: unknown nation "${p.nationality}" (add it under "nations")`);
    for (const c of p.careerClubs) if (!(c in CLUB_LEAGUE)) problems.push(`${p.id}: unknown club "${c}" (add it under "clubs")`);
    if (!PLAYER_BY_ID[p.id]) problems.push(`${p.id}: was not added`);
  }
  const days = Object.keys(raw.daily ?? {});
  if (days.length !== Object.keys(clean.daily ?? {}).length) problems.push('a daily entry has a bad date or shape');
  for (const [day, s] of Object.entries(SCHEDULED_DAYS)) {
    if (!PLAYER_BY_ID[s.playerId]) problems.push(`daily ${day}: unknown player "${s.playerId}"`);
    if (s.theme && s.theme.length > 48) problems.push(`daily ${day}: theme is too long (${s.theme.length}/48)`);
  }
  const { dailyPlayerId } = await import('../src/game/daily');
  const { addDays } = await import('../src/utils/date');
  for (const day of Object.keys(SCHEDULED_DAYS)) {
    for (const n of [-1, 1]) {
      if (dailyPlayerId(addDays(day, n)) === dailyPlayerId(day)) problems.push(`daily ${day}: same player as ${addDays(day, n)}`);
    }
  }
}

if (problems.length) {
  console.error(`✗ content.json has ${problems.length} problem(s):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ content.json rev ${clean!.rev}: ${clean!.players?.length ?? 0} players, ${Object.keys(clean!.daily ?? {}).length} scheduled days`);
// The full suite, on the merged data.
await import('./test-engine');
