import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Play, RotateCcw } from 'lucide-react';
import type { Player } from '@/types';
import type { Route } from '@/hooks/useRouter';
import { getPlayer } from '@/data';
import { nationInfo } from '@/data/nations';
import { shortClub } from '@/data/clubs';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/Button';
import { ModeHeader } from '@/components/game/ModeHeader';
import { ShareImageButton } from '@/components/game/ShareImageButton';
import { randomId } from '@/game/random';
import { finishedRound } from '@/game/synthetic';
import { runVerdict } from '@/game/levels';
import { hlAnswer, hlBest, hlPoints, nextHlPlayer, saveHlBest, type HlAnswer } from '@/game/modes/higherlower';
import { play } from '@/utils/sound';
import { haptic } from '@/utils/haptics';
import { MOTION, ease, reveal } from '@/ui/motion';

interface Run {
  id: string;
  startedAt: number;
  current: string;
  next: string;
  seen: string[];
  streak: number;
  points: number;
  status: 'playing' | 'over';
  /** The last answer, shown for a moment before moving on. */
  last?: { playerId: string; right: boolean };
}

function newRun(): Run {
  const a = nextHlPlayer(null, []);
  const b = nextHlPlayer(a, [a.id]);
  return { id: randomId(), startedAt: Date.now(), current: a.id, next: b.id, seen: [a.id, b.id], streak: 0, points: 0, status: 'playing' };
}

function PlayerCard({ player, year, label }: { player: Player; year: number | null; label: string }) {
  return (
    <div className="card flex flex-col items-center px-4 py-6 text-center">
      <p className="text-[12.5px] font-medium text-ink-muted">{label}</p>
      <p className="mt-2 text-[30px] leading-none" aria-hidden>
        {nationInfo(player.nationality).flag}
      </p>
      <h2 className="heading mt-2 text-[22px] leading-tight sm:text-[26px]">{player.name}</h2>
      <p className="mt-1 text-[13px] text-ink-muted">
        {player.position} · {shortClub(player.mostRecentClub)}
      </p>
      <div className="mt-4 grid h-[58px] place-items-center">
        {year !== null ? (
          <div>
            <div className="font-display text-[34px] font-extrabold leading-none tracking-[-0.04em] tabular-nums text-ink">{year}</div>
            <div className="mt-1 text-[12px] text-ink-faint">senior debut</div>
          </div>
        ) : (
          <div className="font-display text-[34px] font-extrabold leading-none text-ink-faint">?</div>
        )}
      </div>
    </div>
  );
}

export function HigherLowerPage({ navigate }: { navigate: (r: Route) => void }) {
  const { recordRound } = useProfile();
  const [run, setRun] = useState<Run | null>(null);
  const [best, setBest] = useState(hlBest);
  const [newBest, setNewBest] = useState(false);
  const back = () => navigate({ name: 'home' });

  const start = () => {
    setNewBest(false);
    setRun(newRun());
  };

  const answer = (choice: HlAnswer) => {
    if (!run || run.status !== 'playing' || run.last) return;
    const a = getPlayer(run.current)!;
    const b = getPlayer(run.next)!;
    const right = hlAnswer(a, b) === choice;
    if (right) {
      play('win');
      void haptic('success');
      const points = run.points + hlPoints(run.streak);
      setRun({ ...run, streak: run.streak + 1, points, last: { playerId: b.id, right } });
      window.setTimeout(() => {
        setRun((r) => {
          if (!r) return r;
          const c = nextHlPlayer(b, r.seen);
          return { ...r, current: b.id, next: c.id, seen: [...r.seen, c.id].slice(-60), last: undefined };
        });
      }, 900);
    } else {
      play('lose');
      void haptic('error');
      const done: Run = { ...run, status: 'over', last: { playerId: b.id, right } };
      setRun(done);
      recordRound(
        finishedRound({ mode: 'higherlower', playerId: b.id, caseNumber: run.streak, guesses: [], maxAttempts: 1, won: run.streak > 0, points: run.points, startedAt: run.startedAt }),
      );
      if (saveHlBest(run.streak)) {
        setBest(run.streak);
        setNewBest(true);
      }
    }
  };

  if (!run) {
    return (
      <div className="mx-auto max-w-xl">
        <ModeHeader eyebrow="New mode" title="Higher or Lower" onBack={back} />
        <motion.section variants={reveal} custom={0} initial="hidden" animate="show" className="card p-6 text-center">
          <h2 className="heading text-[26px] leading-tight">Who started first?</h2>
          <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-ink-muted">
            You see one player&apos;s senior debut year. Did the next player start his career earlier or later? One wrong answer ends the run.
          </p>
          <p className="mt-4 text-[13.5px] text-ink-muted">
            Best run: <span className="font-semibold tabular-nums text-ink">{best}</span>
          </p>
          <Button variant="primary" size="lg" className="mt-6 w-full" icon={<Play size={18} />} onClick={start}>
            Start a run
          </Button>
        </motion.section>
      </div>
    );
  }

  const a = getPlayer(run.current)!;
  const b = getPlayer(run.next)!;
  const showB = Boolean(run.last);

  return (
    <div className="mx-auto max-w-2xl">
      <ModeHeader
        eyebrow={`Streak ${run.streak} · ${run.points} XP`}
        title="Higher or Lower"
        onBack={back}
        right={<span className="rounded-full bg-white/[0.07] px-3 py-1.5 text-[12.5px] tabular-nums text-ink-muted">Best {best}</span>}
      />

      <div className="grid grid-cols-2 gap-3">
        <PlayerCard player={a} year={a.from} label="Started in" />
        <PlayerCard player={b} year={showB ? b.from : null} label="Started…" />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {run.status === 'playing' ? (
          <motion.div key={`ask-${run.next}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={ease(MOTION.quick)} className="mt-4">
            <p className="mb-3 text-center text-[15px] text-ink-muted">
              Did <span className="font-semibold text-ink">{b.name}</span> start his senior career earlier or later than {a.from}?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button size="lg" icon={<ArrowDown size={18} />} onClick={() => answer('earlier')} disabled={Boolean(run.last)}>
                Earlier
              </Button>
              <Button size="lg" icon={<ArrowUp size={18} />} onClick={() => answer('later')} disabled={Boolean(run.last)}>
                Later
              </Button>
            </div>
            {run.last?.right && <p className="mt-3 text-center text-[14px] font-semibold text-ok">Right. +{hlPoints(run.streak - 1)} XP</p>}
          </motion.div>
        ) : (
          <motion.section key="over" variants={reveal} custom={0} initial="hidden" animate="show" className="card mt-4 p-5 text-center">
            <p className="text-[14px] font-semibold text-bad">
              Wrong. {b.name} started in {b.from}.
            </p>
            <h2 className="heading mt-2 text-[28px] leading-tight">{runVerdict(run.streak)}</h2>
            <p className="mt-1 text-[15px] text-ink-muted">
              {run.streak} right in a row · {run.points} XP{newBest ? ' · new best' : ''}
            </p>
            <div className="mt-5 grid gap-2.5">
              <ShareImageButton
                data={() => ({
                  eyebrow: 'Higher or Lower',
                  headline: runVerdict(run.streak),
                  won: run.streak > 0,
                  score: run.points,
                  detail: `${run.streak} right in a row: who started first?`,
                  tiles: [...Array.from({ length: Math.min(run.streak, 60) }, () => 'hit' as const), 'miss' as const],
                  cta: 'Can you beat my run?',
                })}
              />
              <div className="grid grid-cols-2 gap-2.5">
                <Button onClick={start} icon={<RotateCcw size={17} />}>
                  New run
                </Button>
                <Button variant="ghost" onClick={back}>
                  Back to today
                </Button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
