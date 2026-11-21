import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, CheckCircle2, Dumbbell, Flame, Route as RouteIcon, Skull, Target, Timer, Trophy, XCircle } from 'lucide-react';
import type { GameMode } from '@/types';
import type { Route } from '@/hooks/useRouter';
import { useProfile } from '@/hooks/useProfile';
import { useMidnightCountdown } from '@/hooks/useCountdown';
import { peekDailyRound } from '@/hooks/useRound';
import { caseNumberFor } from '@/game/daily';
import { ACHIEVEMENTS, effectiveStreak, rankFor } from '@/game/progression';
import { MODES } from '@/game/engine';
import { formatCountdown, formatDateLong } from '@/utils/date';
import { PLAYERS } from '@/data';
import { Button } from '@/components/ui/Button';
import { AchievementIcon } from '@/components/ui/AchievementIcon';
import { RankCard } from '@/components/RankCard';

const MODE_ICON: Record<Exclude<GameMode, 'daily'>, typeof Dumbbell> = {
  practice: Dumbbell,
  hardcore: Skull,
  career: RouteIcon,
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };

export function HomePage({ navigate }: { navigate: (r: Route) => void }) {
  const { profile } = useProfile();
  const { ms, date } = useMidnightCountdown();
  const caseNo = caseNumberFor(date);
  const daily = peekDailyRound(date);
  const done = profile.daily.completed[date];
  const inProgress = !done && daily && daily.status === 'playing' && (daily.guesses.length > 0 || daily.revealed > 1);
  const streak = effectiveStreak(profile, date);
  const played = profile.history.length;
  const won = profile.history.filter((h) => h.won).length;
  const winPct = played ? Math.round((won / played) * 100) : 0;
  const rank = rankFor(profile.xp);

  const recentAchievements = ACHIEVEMENTS.filter((a) => profile.achievements[a.id])
    .sort((a, b) => profile.achievements[b.id] - profile.achievements[a.id])
    .slice(0, 4);
  const nextAchievements = ACHIEVEMENTS.filter((a) => !profile.achievements[a.id]).slice(0, 4 - recentAchievements.length);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
      <div className="space-y-4 lg:space-y-6">
        {/* Daily case hero */}
        <motion.section variants={item} className="card relative overflow-hidden p-5 sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime/10 blur-3xl" />
          <svg className="pointer-events-none absolute -bottom-10 right-0 h-56 w-56 opacity-[0.06] sm:h-72 sm:w-72" viewBox="0 0 200 200" aria-hidden>
            <circle cx="100" cy="100" r="60" fill="none" stroke="#B7FF35" strokeWidth="2" />
            <circle cx="100" cy="100" r="3" fill="#B7FF35" />
            <path d="M0 100h200M100 0v200" stroke="#B7FF35" strokeWidth="2" />
          </svg>
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip !border-lime/30 !text-lime">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" /> Daily case
              </span>
              <span className="chip">#{String(caseNo).padStart(3, '0')}</span>
              <span className="chip">
                <CalendarDays size={11} /> {formatDateLong(date)}
              </span>
            </div>
            <h1 className="heading mt-5 text-[34px] leading-[1.02] sm:text-5xl">DAILY CASE</h1>
            <p className="mt-3 max-w-md text-[15px] text-ink-muted sm:text-base">One mystery. Six attempts. Can you solve it?</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              {done ? (
                <>
                  <div
                    className={`flex h-14 items-center gap-2 rounded-xl border px-4 font-semibold ${
                      done.won ? 'border-ok/40 bg-ok/[0.07] text-ok' : 'border-bad/40 bg-bad/[0.07] text-bad'
                    }`}
                  >
                    {done.won ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    {done.won ? `Solved · ${done.score} XP` : 'Unsolved today'}
                  </div>
                  <Button size="lg" onClick={() => navigate({ name: 'play', mode: 'daily' })} icon={<Target size={18} />}>
                    View case file
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate({ name: 'play', mode: 'daily' })}
                  className="sm:min-w-[260px]"
                >
                  {inProgress ? 'RESUME INVESTIGATION' : 'START INVESTIGATION'} <ArrowRight size={18} />
                </Button>
              )}
              <div className="flex items-center gap-2 font-mono text-xs text-ink-muted sm:ml-2">
                <Timer size={13} />
                {done ? 'Next case in' : 'Case closes in'} <span className="text-ink">{formatCountdown(ms)}</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stat strip */}
        <motion.section variants={item} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile icon={<Flame size={15} className="text-warn" />} label="Streak" value={String(streak)} sub={`Best ${profile.daily.bestStreak}`} />
          <StatTile icon={<Trophy size={15} className="text-lime" />} label="Rank" value={`LV ${rank.index + 1}`} sub={rank.current.name} />
          <StatTile icon={<CheckCircle2 size={15} className="text-ok" />} label="Solved" value={String(won)} sub={`${played} played`} />
          <StatTile icon={<Target size={15} className="text-ink" />} label="Win rate" value={`${winPct}%`} sub="All modes" />
        </motion.section>

        {/* Modes */}
        <motion.section variants={item}>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="heading text-lg">Game modes</h2>
            <span className="label">{PLAYERS.length} players on file</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {(['practice', 'hardcore', 'career'] as const).map((m) => {
              const Icon = MODE_ICON[m];
              const cfg = MODES[m];
              return (
                <motion.button
                  key={m}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate({ name: 'play', mode: m })}
                  className="card group flex flex-col items-start p-4 text-left transition-colors hover:border-pitch-600"
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-pitch-800 text-lime">
                      <Icon size={18} />
                    </div>
                    <ArrowRight size={16} className="text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-lime" />
                  </div>
                  <div className="mt-4 font-bold text-ink">{cfg.name}</div>
                  <p className="mt-1 text-sm leading-snug text-ink-muted">{cfg.tagline}</p>
                  <div className="mt-3 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                    {cfg.maxAttempts} attempts · {cfg.hintsAllowed ? 'hints on' : 'no hints'}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4 lg:space-y-6">
        <motion.div variants={item}>
          <RankCard xp={profile.xp} />
        </motion.div>
        <motion.section variants={item} className="card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-ink">Achievements</h2>
            <span className="font-mono text-[11px] text-ink-muted">
              {Object.keys(profile.achievements).length}/{ACHIEVEMENTS.length}
            </span>
          </div>
          <ul className="space-y-2">
            {[...recentAchievements, ...nextAchievements].map((a) => {
              const unlocked = Boolean(profile.achievements[a.id]);
              return (
                <li key={a.id} className={`flex items-center gap-3 rounded-xl border p-2.5 ${unlocked ? 'border-lime/25 bg-lime/[0.04]' : 'border-pitch-700 bg-pitch-900 opacity-70'}`}>
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${unlocked ? 'bg-lime text-pitch-950' : 'bg-pitch-800 text-ink-faint'}`}>
                    <AchievementIcon icon={a.icon} size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink">{a.title}</div>
                    <div className="truncate text-xs text-ink-muted">{a.description}</div>
                  </div>
                  {!unlocked && <span className="label ml-auto shrink-0">Locked</span>}
                </li>
              );
            })}
          </ul>
          <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => navigate({ name: 'stats' })}>
            View all stats
          </Button>
        </motion.section>
      </aside>
    </motion.div>
  );
}

function StatTile({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="label">{label}</span>
      </div>
      <div className="mt-2 font-mono text-2xl font-bold text-ink">{value}</div>
      <div className="truncate text-xs text-ink-muted">{sub}</div>
    </div>
  );
}
