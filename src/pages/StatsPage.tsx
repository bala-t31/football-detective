import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { GameMode } from '@/types';
import { useProfile } from '@/hooks/useProfile';
import { ACHIEVEMENTS, effectiveStreak } from '@/game/progression';
import { MODES } from '@/game/engine';
import { getPlayer, PLAYERS } from '@/data';
import { toDateKey } from '@/utils/date';
import { RankCard } from '@/components/RankCard';
import { AchievementIcon } from '@/components/ui/AchievementIcon';

export function StatsPage() {
  const { profile } = useProfile();
  const h = profile.history;
  const wins = h.filter((g) => g.won);
  const played = h.length;
  const winPct = played ? Math.round((wins.length / played) * 100) : 0;
  const avg = (xs: number[]) => (xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1) : '—');
  const discovered = Object.keys(profile.discovered).length;

  const maxGuess = 6;
  const dist = Array.from({ length: maxGuess }, (_, i) => wins.filter((g) => g.guesses === i + 1).length);
  const distMax = Math.max(1, ...dist);
  const losses = played - wins.length;

  const byMode = (Object.keys(MODES) as GameMode[]).map((m) => {
    const games = h.filter((g) => g.mode === m);
    return { mode: m, played: games.length, won: games.filter((g) => g.won).length };
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <div className="label">Detective record</div>
        <h1 className="heading mt-1 text-3xl">Statistics</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Tile label="Games played" value={played} />
        <Tile label="Games won" value={wins.length} />
        <Tile label="Win %" value={`${winPct}%`} />
        <Tile label="Current streak" value={effectiveStreak(profile, toDateKey())} />
        <Tile label="Best streak" value={profile.daily.bestStreak} />
        <Tile label="Avg guesses (wins)" value={avg(wins.map((g) => g.guesses))} />
        <Tile label="Avg clues used" value={avg(h.map((g) => g.cluesRevealed))} />
        <Tile label="Players identified" value={`${discovered}/${PLAYERS.length}`} />
        <Tile label="Total XP" value={profile.xp.toLocaleString()} />
        <Tile label="Achievements" value={`${Object.keys(profile.achievements).length}/${ACHIEVEMENTS.length}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <section className="card p-4 sm:p-5">
          <h2 className="font-bold text-ink">Guess distribution</h2>
          <p className="text-xs text-ink-muted">Solved cases by number of guesses</p>
          <div className="mt-4 space-y-2">
            {dist.map((count, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-4 font-mono text-xs text-ink-muted">{i + 1}</span>
                <div className="h-7 flex-1 rounded-md bg-pitch-900">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(count ? 8 : 0, (count / distMax) * 100)}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className={`flex h-full items-center justify-end rounded-md font-mono text-xs font-bold text-pitch-950 ${count ? 'bg-lime/80 px-2' : ''}`}
                  >
                    {count > 0 && count}
                  </motion.div>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <span className="w-4 font-mono text-xs text-bad">X</span>
              <div className="h-7 flex-1 rounded-md bg-pitch-900">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${losses ? Math.max(8, (losses / Math.max(distMax, losses)) * 100) : 0}%` }}
                  transition={{ duration: 0.8, delay: 0.35 }}
                  className={`flex h-full items-center justify-end rounded-md font-mono text-xs font-bold text-pitch-950 ${losses ? 'bg-bad/70 px-2' : ''}`}
                >
                  {losses > 0 && losses}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <RankCard xp={profile.xp} />
          <section className="card p-4 sm:p-5">
            <h2 className="mb-3 font-bold text-ink">By mode</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {byMode.map((m) => (
                <div key={m.mode} className="card-inset p-3">
                  <div className="label">{MODES[m.mode].name}</div>
                  <div className="mt-1 font-mono text-lg font-bold text-ink">
                    {m.won}
                    <span className="text-ink-faint">/{m.played}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="card p-4 sm:p-5">
        <h2 className="mb-3 font-bold text-ink">Achievements</h2>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
          {ACHIEVEMENTS.map((a) => {
            const at = profile.achievements[a.id];
            return (
              <div key={a.id} className={`rounded-xl border p-3 ${at ? 'border-lime/25 bg-lime/[0.04]' : 'border-pitch-700 bg-pitch-900 opacity-60'}`}>
                <div className={`grid h-9 w-9 place-items-center rounded-lg ${at ? 'bg-lime text-pitch-950' : 'bg-pitch-800 text-ink-faint'}`}>
                  <AchievementIcon icon={a.icon} size={16} />
                </div>
                <div className="mt-2 text-sm font-semibold text-ink">{a.title}</div>
                <div className="text-xs text-ink-muted">{a.description}</div>
                {at && <div className="mt-1 font-mono text-[10px] text-lime">{new Date(at).toLocaleDateString()}</div>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="card p-4 sm:p-5">
        <h2 className="mb-3 font-bold text-ink">Recent cases</h2>
        {h.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-muted">No cases closed yet. Your investigation history will appear here.</p>
        ) : (
          <ul className="divide-y divide-pitch-700">
            {h.slice(0, 15).map((g) => {
              const p = getPlayer(g.playerId);
              return (
                <li key={g.id} className="flex items-center gap-3 py-2.5">
                  {g.won ? <CheckCircle2 size={16} className="shrink-0 text-ok" /> : <XCircle size={16} className="shrink-0 text-bad" />}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">{p?.name ?? 'Unknown player'}</div>
                    <div className="font-mono text-[11px] text-ink-muted">
                      {MODES[g.mode].name} · {g.date} · {g.guesses} guess{g.guesses === 1 ? '' : 'es'} · {g.cluesRevealed} clue{g.cluesRevealed === 1 ? '' : 's'}
                    </div>
                  </div>
                  <span className={`font-mono text-sm font-bold ${g.won ? 'text-lime' : 'text-ink-faint'}`}>{g.score}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4">
      <div className="label">{label}</div>
      <div className="mt-1.5 font-mono text-2xl font-bold text-ink">{value}</div>
    </div>
  );
}
