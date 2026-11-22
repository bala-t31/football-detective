import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, Crown, Dumbbell, Route as RouteIcon, Skull, Users, Waypoints, XCircle } from 'lucide-react';
import { LEGENDS_PER_WEEK, daysUntilNextWeek, legendsProgress, weekKeyFor, weekNumber } from '@/game/weekly';
import type { GameMode } from '@/types';
import type { Route } from '@/hooks/useRouter';
import { useProfile } from '@/hooks/useProfile';
import { useMidnightCountdown } from '@/hooks/useCountdown';
import { peekDailyRound } from '@/hooks/useRound';
import { caseNumberFor } from '@/game/daily';
import { ACHIEVEMENTS, effectiveStreak } from '@/game/progression';
import { MODES } from '@/game/engine';
import { formatCountdown, fromDateKey } from '@/utils/date';
import { Button } from '@/components/ui/Button';
import { AchievementIcon } from '@/components/ui/AchievementIcon';
import { RankCard } from '@/components/RankCard';
import { PlayerAvatar } from '@/components/game/PlayerAvatar';

const MODE_META: Record<Exclude<GameMode, 'daily' | 'legends'>, { icon: typeof Dumbbell; tint: string; blurb: string; isNew?: boolean }> = {
  practice: { icon: Dumbbell, tint: 'from-[#7ff0bf] to-[#2fc785] text-[#052016]', blurb: 'Pick your level, from Casual to Elite Ball Knowledge.' },
  hardcore: { icon: Skull, tint: 'from-[#ff9d9d] to-[#e0525a] text-[#2a0507]', blurb: 'One clue, three guesses, no hints. 1.5× XP.' },
  career: { icon: RouteIcon, tint: 'from-[#f8dc8a] to-[#e0ac35] text-[#3a2600]', blurb: 'Clubs revealed one at a time, with hints.' },
  clubpath: { icon: Waypoints, tint: 'from-[#9fd8ff] to-[#3d8fe0] text-[#03182c]', blurb: 'Every club at once. One miss ends the run.', isNew: true },
  teammate: { icon: Users, tint: 'from-[#e2b6ff] to-[#9b5ce6] text-[#1d0533]', blurb: 'Name players who shared a dressing room with a star.', isNew: true },
};

const rise = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.12 + i * 0.07, type: 'spring', stiffness: 260, damping: 28 } }),
};

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
  const week = weekKeyFor(date);
  const legendResults = legendsProgress(week);
  const legendsDone = legendResults.length;
  const dayLabel = fromDateKey(date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  const unlocked = ACHIEVEMENTS.filter((a) => profile.achievements[a.id]);
  const shelf = [...unlocked.sort((a, b) => profile.achievements[b.id] - profile.achievements[a.id]), ...ACHIEVEMENTS.filter((a) => !profile.achievements[a.id])];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-7">
      <div className="space-y-5">
        {/* Large title */}
        <motion.header custom={0} variants={rise} initial="hidden" animate="show" className="px-1 pt-1">
          <p className="text-[14px] font-medium text-ink-muted">{dayLabel}</p>
          <h1 className="heading mt-0.5 text-[40px] leading-none sm:text-[48px]">Today</h1>
        </motion.header>

        {/* Daily mystery */}
        <motion.section custom={1} variants={rise} initial="hidden" animate="show" className="card overflow-hidden p-5 sm:p-7">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-lime">Daily mystery #{caseNo}</p>
              <h2 className="heading mt-2 text-[27px] leading-[1.08] sm:text-[34px]">Who is today&apos;s mystery footballer?</h2>
              <p className="mt-2.5 max-w-sm text-[15px] leading-relaxed text-ink-muted">
                Six guesses. Ask for another clue whenever you&apos;re stuck.
              </p>
            </div>
            <PlayerAvatar revealed={false} size="sm" />
          </div>

          <div className="mt-6">
            {done ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div
                  className={`flex h-14 flex-1 items-center gap-2.5 rounded-full border px-5 font-semibold ${
                    done.won ? 'border-ok/30 bg-ok/[0.1] text-ok' : 'border-bad/30 bg-bad/[0.1] text-bad'
                  }`}
                >
                  {done.won ? <CheckCircle2 size={19} /> : <XCircle size={19} />}
                  {done.won ? `Solved for ${done.score} XP` : 'Not solved today'}
                </div>
                <Button size="lg" onClick={() => navigate({ name: 'play', mode: 'daily' })}>
                  See the result
                </Button>
              </div>
            ) : (
              <Button variant="primary" size="lg" className="w-full sm:w-auto sm:min-w-[280px]" onClick={() => navigate({ name: 'play', mode: 'daily' })}>
                {inProgress ? 'Continue investigating' : 'Start investigating'}
              </Button>
            )}
            <p className="mt-3.5 text-[13px] text-ink-muted">
              {done ? 'Next mystery in ' : 'Mystery changes in '}
              <span className="font-semibold tabular-nums text-ink">{formatCountdown(ms)}</span>
            </p>
          </div>
        </motion.section>

        {/* Weekly Legends */}
        <motion.section custom={2} variants={rise} initial="hidden" animate="show">
          <motion.button
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate({ name: 'play', mode: 'legends' })}
            className="card relative flex w-full items-center gap-4 overflow-hidden p-5 text-left"
          >
            <span className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgb(244_201_93/0.22),transparent)]" aria-hidden />
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-[linear-gradient(180deg,#f8dc8a,#e0ac35)] text-[#3a2600] shadow-[inset_0_1px_0_rgb(255_255_255/0.6),0_10px_24px_-10px_rgb(224_172_53/0.8)]">
              <Crown size={24} strokeWidth={2.2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-warn">Weekly Legends · Week {weekNumber(week)}</span>
              <span className="mt-0.5 block font-display text-[20px] font-bold leading-tight tracking-[-0.02em] text-ink">
                {legendsDone >= LEGENDS_PER_WEEK ? 'All five legends played' : legendsDone > 0 ? 'Continue this week’s legends' : 'Five retired greats, same for everyone'}
              </span>
              <span className="mt-2 flex items-center gap-1.5" aria-label={`${legendsDone} of ${LEGENDS_PER_WEEK} played`}>
                {Array.from({ length: LEGENDS_PER_WEEK }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${i < legendsDone ? (legendResults[i]?.won ? 'bg-ok' : 'bg-bad') : 'bg-white/[0.12]'}`}
                  />
                ))}
                <span className="ml-2 shrink-0 text-[12.5px] tabular-nums text-ink-muted">
                  {legendsDone >= LEGENDS_PER_WEEK ? `New in ${daysUntilNextWeek(date)}d` : `${legendsDone}/${LEGENDS_PER_WEEK}`}
                </span>
              </span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-ink-faint" />
          </motion.button>
        </motion.section>

        {/* Your record — one panel, three numbers */}
        <motion.section custom={3} variants={rise} initial="hidden" animate="show" className="card grid grid-cols-3 divide-x divide-white/[0.08] py-4">
          <Stat value={streak} label="Day streak" sub={`Best ${profile.daily.bestStreak}`} accent={streak > 0 ? 'text-warn' : undefined} />
          <Stat value={won} label="Solved" sub={`of ${played}`} />
          <Stat value={`${winPct}%`} label="Win rate" sub="all modes" />
        </motion.section>

        {/* Other modes as a grouped list */}
        <motion.section custom={4} variants={rise} initial="hidden" animate="show">
          <h2 className="mb-2.5 px-1 font-display text-[20px] font-bold tracking-[-0.02em]">More ways to play</h2>
          <div className="card divide-y divide-white/[0.07] overflow-hidden p-1.5">
            {(['clubpath', 'teammate', 'practice', 'hardcore', 'career'] as const).map((m) => {
              const meta = MODE_META[m];
              const Icon = meta.icon;
              return (
                <motion.button
                  key={m}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => navigate({ name: 'play', mode: m })}
                  className="flex w-full items-center gap-3.5 rounded-[22px] px-3 py-3.5 text-left transition-colors hover:bg-white/[0.05]"
                >
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-gradient-to-b shadow-[inset_0_1px_0_rgb(255_255_255/0.55)] ${meta.tint}`}>
                    <Icon size={20} strokeWidth={2.2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-[16px] font-semibold tracking-[-0.01em] text-ink">
                      {MODES[m].name}
                      {meta.isNew && <span className="rounded-full bg-lime/15 px-2 py-0.5 text-[11px] font-semibold text-lime">New</span>}
                    </span>
                    <span className="block text-[13.5px] leading-snug text-ink-muted">{meta.blurb}</span>
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-ink-faint" />
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      </div>

      <aside className="space-y-5 lg:pt-[96px]">
        <motion.div custom={4} variants={rise} initial="hidden" animate="show">
          <RankCard xp={profile.xp} />
        </motion.div>

        <motion.section custom={5} variants={rise} initial="hidden" animate="show" className="card p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[19px] font-bold tracking-[-0.02em]">Trophy cabinet</h2>
            <span className="text-[13px] tabular-nums text-ink-muted">
              {unlocked.length} of {ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="-mx-5 mt-4 flex snap-x gap-3 overflow-x-auto px-5 pb-1 scrollbar-thin">
            {shelf.slice(0, 8).map((a) => {
              const got = Boolean(profile.achievements[a.id]);
              return (
                <div key={a.id} className="w-[76px] shrink-0 snap-start text-center" title={a.description}>
                  <div
                    className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${
                      got
                        ? 'bg-[linear-gradient(180deg,#f8dc8a,#e0ac35)] text-[#3a2600] shadow-[inset_0_1px_0_rgb(255_255_255/0.6),0_8px_20px_-8px_rgb(224_172_53/0.8)]'
                        : 'border border-white/[0.1] bg-white/[0.05] text-ink-faint'
                    }`}
                  >
                    <AchievementIcon icon={a.icon} size={22} />
                  </div>
                  <div className={`mt-2 text-[11.5px] font-medium leading-tight ${got ? 'text-ink' : 'text-ink-faint'}`}>{a.title}</div>
                </div>
              );
            })}
          </div>
          <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => navigate({ name: 'stats' })}>
            See all stats
          </Button>
        </motion.section>
      </aside>
    </div>
  );
}

function Stat({ value, label, sub, accent }: { value: string | number; label: string; sub: string; accent?: string }) {
  return (
    <div className="px-3 text-center">
      <div className={`font-display text-[28px] font-bold leading-none tracking-[-0.03em] tabular-nums ${accent ?? 'text-ink'}`}>{value}</div>
      <div className="mt-1.5 text-[12.5px] font-medium text-ink">{label}</div>
      <div className="text-[11.5px] text-ink-faint">{sub}</div>
    </div>
  );
}
