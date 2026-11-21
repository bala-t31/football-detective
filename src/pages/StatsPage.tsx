import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { GameMode } from '@/types';
import { useProfile } from '@/hooks/useProfile';
import { ACHIEVEMENTS, CLASSIC_MODES, effectiveStreak } from '@/game/progression';
import { MODES } from '@/game/engine';
import { getPlayer, PLAYERS } from '@/data';
import { toDateKey } from '@/utils/date';
import { RankCard } from '@/components/RankCard';
import { AchievementIcon } from '@/components/ui/AchievementIcon';

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.05 + i * 0.06, type: 'spring', stiffness: 260, damping: 28 } }),
};

export function StatsPage() {
  const { profile } = useProfile();
  const h = profile.history;
  const wins = h.filter((g) => g.won);
  const classicWins = wins.filter((g) => CLASSIC_MODES.includes(g.mode));
  const played = h.length;
  const winPct = played ? Math.round((wins.length / played) * 100) : 0;
  const avg = (xs: number[]) => (xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1) : '–');
  const discovered = Object.keys(profile.discovered).length;

  const maxGuess = 6;
  const dist = Array.from({ length: maxGuess }, (_, i) => classicWins.filter((g) => g.guesses === i + 1).length);
  const losses = h.filter((g) => CLASSIC_MODES.includes(g.mode) && !g.won).length;
  const distMax = Math.max(1, ...dist, losses);

  const byMode = (Object.keys(MODES) as GameMode[]).map((m) => {
    const games = h.filter((g) => g.mode === m);
    return { mode: m, played: games.length, won: games.filter((g) => g.won).length };
  });

  return (
    <div className="space-y-5">
      <motion.header custom={0} variants={rise} initial="hidden" animate="show" className="px-1 pt-1">
        <p className="text-[14px] font-medium text-ink-muted">Your record</p>
        <h1 className="heading mt-0.5 text-[40px] leading-none sm:text-[48px]">Stats</h1>
      </motion.header>

      {/* Headline numbers */}
      <motion.section custom={1} variants={rise} initial="hidden" animate="show" className="card grid grid-cols-2 gap-y-5 p-5 sm:grid-cols-4">
        <Big value={played} label="Played" />
        <Big value={`${winPct}%`} label="Win rate" />
        <Big value={effectiveStreak(profile, toDateKey())} label="Day streak" accent />
        <Big value={profile.daily.bestStreak} label="Best streak" />
      </motion.section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <motion.section custom={2} variants={rise} initial="hidden" animate="show" className="card p-5">
          <h2 className="font-display text-[19px] font-bold tracking-[-0.02em]">Guesses to solve</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">How many guesses your solved cases took</p>
          <div className="mt-4 space-y-2">
            {dist.map((count, i) => (
              <Bar key={i} label={String(i + 1)} count={count} max={distMax} delay={i * 0.05} />
            ))}
            <Bar label="✕" count={losses} max={distMax} delay={0.35} bad />
          </div>
        </motion.section>

        <div className="space-y-5">
          <motion.div custom={3} variants={rise} initial="hidden" animate="show">
            <RankCard xp={profile.xp} />
          </motion.div>
          <motion.section custom={4} variants={rise} initial="hidden" animate="show" className="card p-5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <Small value={avg(classicWins.map((g) => g.guesses))} label="Average guesses" />
              <Small value={avg(h.filter((g) => CLASSIC_MODES.includes(g.mode)).map((g) => g.cluesRevealed))} label="Average clues" />
              <Small value={`${discovered} of ${PLAYERS.length}`} label="Players identified" />
              <Small value={profile.xp.toLocaleString()} label="Total XP" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {byMode.map((m) => (
                <div key={m.mode} className="card-inset px-3 py-2.5">
                  <div className="text-[12px] font-medium text-ink-muted">{MODES[m.mode].name}</div>
                  <div className="mt-0.5 text-[17px] font-semibold tabular-nums text-ink">
                    {m.won}
                    <span className="text-ink-faint"> / {m.played}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>

      <motion.section custom={5} variants={rise} initial="hidden" animate="show" className="card p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[19px] font-bold tracking-[-0.02em]">Trophy cabinet</h2>
          <span className="text-[13px] tabular-nums text-ink-muted">
            {Object.keys(profile.achievements).length} of {ACHIEVEMENTS.length}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {ACHIEVEMENTS.map((a) => {
            const at = profile.achievements[a.id];
            return (
              <div key={a.id} className={`rounded-[20px] border p-3.5 ${at ? 'border-warn/25 bg-warn/[0.07]' : 'border-white/[0.07] bg-white/[0.03]'}`}>
                <div
                  className={`grid h-10 w-10 place-items-center rounded-full ${
                    at ? 'bg-[linear-gradient(180deg,#f8dc8a,#e0ac35)] text-[#3a2600] shadow-[inset_0_1px_0_rgb(255_255_255/0.6)]' : 'bg-white/[0.06] text-ink-faint'
                  }`}
                >
                  <AchievementIcon icon={a.icon} size={18} />
                </div>
                <div className={`mt-2.5 text-[14px] font-semibold ${at ? 'text-ink' : 'text-ink-muted'}`}>{a.title}</div>
                <div className="text-[12.5px] leading-snug text-ink-faint">{a.description}</div>
                {at && <div className="mt-1.5 text-[11.5px] font-medium text-warn">{new Date(at).toLocaleDateString()}</div>}
              </div>
            );
          })}
        </div>
      </motion.section>

      <motion.section custom={6} variants={rise} initial="hidden" animate="show" className="card p-5">
        <h2 className="font-display text-[19px] font-bold tracking-[-0.02em]">Recent cases</h2>
        {h.length === 0 ? (
          <p className="py-8 text-center text-[14.5px] text-ink-muted">Solve your first case and it will show up here.</p>
        ) : (
          <ul className="mt-2 divide-y divide-white/[0.07]">
            {h.slice(0, 15).map((g) => {
              const p = getPlayer(g.playerId);
              return (
                <li key={g.id} className="flex items-center gap-3 py-3">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${g.won ? 'bg-ok/15 text-ok' : 'bg-bad/15 text-bad'}`}>
                    {g.won ? <Check size={16} strokeWidth={2.6} /> : <X size={16} strokeWidth={2.6} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold text-ink">{p?.name ?? 'Unknown player'}</div>
                    <div className="text-[12.5px] text-ink-muted">
                      {MODES[g.mode].name},{' '}
                      {g.mode === 'teammate'
                        ? `${g.caseNumber} teammate${g.caseNumber === 1 ? '' : 's'} named`
                        : g.mode === 'clubpath'
                          ? `player ${g.caseNumber} of a run`
                          : `${g.guesses} guess${g.guesses === 1 ? '' : 'es'}, ${g.cluesRevealed} clue${g.cluesRevealed === 1 ? '' : 's'}`}
                    </div>
                  </div>
                  <span className={`text-[15px] font-semibold tabular-nums ${g.won ? 'text-lime' : 'text-ink-faint'}`}>{g.score}</span>
                </li>
              );
            })}
          </ul>
        )}
      </motion.section>
    </div>
  );
}

function Big({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div className="text-center">
      <div className={`font-display text-[34px] font-bold leading-none tracking-[-0.04em] tabular-nums ${accent ? 'text-warn' : 'text-ink'}`}>{value}</div>
      <div className="mt-1.5 text-[13px] font-medium text-ink-muted">{label}</div>
    </div>
  );
}

function Small({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <div className="text-[20px] font-semibold tracking-[-0.02em] tabular-nums text-ink">{value}</div>
      <div className="text-[12.5px] text-ink-muted">{label}</div>
    </div>
  );
}

function Bar({ label, count, max, delay, bad }: { label: string; count: number; max: number; delay: number; bad?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`w-4 text-center text-[13px] font-semibold tabular-nums ${bad ? 'text-bad' : 'text-ink-muted'}`}>{label}</span>
      <div className="h-8 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
        {count > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(12, (count / max) * 100)}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20, delay }}
            className={`flex h-full items-center justify-end rounded-full px-3 text-[13px] font-bold tabular-nums ${
              bad
                ? 'bg-[linear-gradient(90deg,#c94848,#ff7a7a)] text-[#2a0507]'
                : 'bg-[linear-gradient(90deg,#2fc785,#7ff0bf)] text-[#052016] shadow-[inset_0_1px_0_rgb(255_255_255/0.5)]'
            }`}
          >
            {count}
          </motion.div>
        )}
      </div>
    </div>
  );
}
