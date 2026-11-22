import { runVerdict } from '@/game/levels';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, Flame, Play, RotateCcw } from 'lucide-react';
import type { Route } from '@/hooks/useRouter';
import { getPlayer } from '@/data';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { GuessInput } from '@/components/game/GuessInput';
import { ModeHeader } from '@/components/game/ModeHeader';
import { PlayerAvatar } from '@/components/game/PlayerAvatar';
import { ShareImageButton } from '@/components/game/ShareImageButton';
import { Confetti } from '@/components/game/Celebration';
import { randomId } from '@/game/random';
import { finishedRound } from '@/game/synthetic';
import {
  POINTS_FIRST_TRY,
  POINTS_SECOND_TRY,
  TRIES_PER_PLAYER,
  bestRun,
  clubPath,
  isPathMatch,
  loadRun,
  nextPathPlayer,
  pointsFor,
  runScore,
  saveBest,
  saveRun,
  type PathRun,
} from '@/game/clubpath';
import { play } from '@/utils/sound';
import { haptic } from '@/utils/haptics';
import { enter, isReducedMotion } from '@/ui/motion';

function newRun(): PathRun {
  return { id: randomId(), startedAt: Date.now(), solved: [], current: nextPathPlayer([], 0), guesses: [], status: 'playing' };
}

export function ClubPathPage({ navigate }: { navigate: (r: Route) => void }) {
  const { recordRound } = useProfile();
  const toast = useToast();
  const [run, setRun] = useState<PathRun | null>(loadRun);
  const [best, setBest] = useState(bestRun);
  const [newBest, setNewBest] = useState(false);
  const [justSolved, setJustSolved] = useState<{ playerId: string; points: number } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (run) saveRun(run);
  }, [run]);

  const start = () => {
    setNewBest(false);
    setJustSolved(null);
    setRun(newRun());
  };

  const handleGuess = async (id: string) => {
    if (!run || run.status !== 'playing' || busy) return { ok: false, message: 'Hold on…' };
    if (run.guesses.includes(id)) return { ok: false, message: 'You already tried this player.' };
    setBusy(true);
    setJustSolved(null);
    play('tap');
    await new Promise((r) => window.setTimeout(r, 320));
    const guesses = [...run.guesses, id];
    const target = getPlayer(run.current)!;

    if (isPathMatch(id, run.current)) {
      const points = pointsFor(guesses.length, run.solved.length);
      recordRound(
        finishedRound({ mode: 'clubpath', playerId: run.current, caseNumber: run.solved.length + 1, guesses, maxAttempts: TRIES_PER_PLAYER, won: true, points, startedAt: run.startedAt }),
      );
      play('win');
      void haptic('success');
      const solved = [...run.solved, { playerId: run.current, tries: guesses.length, points }];
      setJustSolved({ playerId: run.current, points });
      setRun({ ...run, solved, current: nextPathPlayer([...solved.map((s) => s.playerId)], solved.length), guesses: [] });
    } else if (guesses.length >= TRIES_PER_PLAYER) {
      recordRound(
        finishedRound({ mode: 'clubpath', playerId: run.current, caseNumber: run.solved.length + 1, guesses, maxAttempts: TRIES_PER_PLAYER, won: false, points: 0, startedAt: run.startedAt }),
      );
      play('lose');
      void haptic('error');
      const over: PathRun = { ...run, guesses, status: 'over', missed: target.id };
      const b = saveBest(over);
      setBest({ solved: b.solved, score: b.score });
      setNewBest(b.isNew && over.solved.length > 0);
      setJustSolved(null);
      setRun(over);
    } else {
      play('wrong');
      void haptic('warning');
      toast('Not them. One more try', 'info');
      setRun({ ...run, guesses });
    }
    setBusy(false);
    return { ok: true };
  };

  const back = () => navigate({ name: 'home' });

  // Intro
  if (!run) {
    return (
      <div className="mx-auto max-w-xl">
        <ModeHeader eyebrow="New mode" title="Club Path Run" onBack={back} />
        <div className="card p-6 sm:p-8">
          <h2 className="heading text-[28px] leading-tight">Name the player from their clubs</h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-ink-muted">
            You only see the clubs, in order. No nationality, no position, no other clues.
          </p>
          <ul className="mt-5 space-y-2.5 text-[15px] text-ink">
            <li className="flex gap-3"><span className="text-lime">•</span>Two tries per player.</li>
            <li className="flex gap-3"><span className="text-lime">•</span>{POINTS_FIRST_TRY} XP first try, {POINTS_SECOND_TRY} XP on the second, plus a bonus for every player in a row.</li>
            <li className="flex gap-3"><span className="text-lime">•</span>One miss ends the run. Players get harder as you go.</li>
          </ul>
          {best.solved > 0 && (
            <p className="mt-5 text-[14px] text-ink-muted">
              Your best run: <span className="font-semibold text-ink">{best.solved} players</span>, {best.score} XP
            </p>
          )}
          <Button variant="primary" size="lg" className="mt-6 w-full" icon={<Play size={18} />} onClick={start}>
            Start a run
          </Button>
        </div>
      </div>
    );
  }

  const score = runScore(run);

  // Run over
  if (run.status === 'over') {
    const missed = getPlayer(run.missed ?? run.current)!;
    return (
      <div className="mx-auto max-w-xl">
        <ModeHeader eyebrow="Club Path Run" title="Run over" onBack={back} />
        {newBest && <Confetti />}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6 text-center sm:p-8">
          <p className={`text-[14px] font-semibold ${newBest ? 'text-warn' : 'text-ink-muted'}`}>{newBest ? 'New best run' : `Best run: ${best.solved} players`}</p>
          <div className="mt-3 font-display text-[64px] font-extrabold leading-none tracking-[-0.05em] tabular-nums">
            {run.solved.length}
          </div>
          <p className="mt-1 text-[15px] text-ink-muted">
            player{run.solved.length === 1 ? '' : 's'} named · <span className="font-semibold text-ink">{score} XP</span>
          </p>

          <div className="mx-auto mt-6 max-w-sm rounded-[24px] bg-white/[0.04] p-4 text-left">
            <p className="text-[13px] font-medium text-ink-muted">The run ended on</p>
            <div className="mt-2 flex items-center gap-3">
              <PlayerAvatar player={missed} revealed size="sm" />
              <div>
                <div className="font-display text-[20px] font-bold leading-tight tracking-[-0.02em]">{missed.name}</div>
                <div className="text-[13.5px] text-ink-muted">{clubPath(missed).join(' → ')}</div>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-2.5">
            <ShareImageButton
              data={() => ({
                eyebrow: 'Club Path Run',
                headline: runVerdict(run.solved.length),
                won: run.solved.length > 0,
                score,
                detail: `${run.solved.length} in a row from club paths alone`,
                tiles: [...run.solved.map(() => 'hit' as const), 'miss' as const],
                cta: 'How far can you go?',
              })}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <Button onClick={start} icon={<RotateCcw size={17} />}>New run</Button>
              <Button variant="ghost" onClick={back}>Back to today</Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const target = getPlayer(run.current)!;
  const path = clubPath(target);
  const triesLeft = TRIES_PER_PLAYER - run.guesses.length;
  const solvedPlayer = justSolved ? getPlayer(justSolved.playerId) : null;

  return (
    <div className="mx-auto max-w-xl">
      <ModeHeader
        eyebrow="Club Path Run"
        title={`Player ${run.solved.length + 1}`}
        onBack={back}
        right={
          <span className="flex items-center gap-1.5 rounded-full border border-warn/30 bg-warn/10 px-3 py-1 text-[13px] font-semibold tabular-nums text-warn">
            <Flame size={14} /> {run.solved.length} · {score} XP
          </span>
        }
      />

      <AnimatePresence>
        {solvedPlayer && justSolved && (
          <motion.div
            key={justSolved.playerId}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="mb-4 flex items-center gap-3 rounded-[22px] border border-ok/30 bg-ok/[0.1] px-4 py-3"
          >
            <PlayerAvatar player={solvedPlayer} revealed size="sm" />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-ok">Correct, +{justSolved.points} XP</div>
              <div className="truncate font-display text-[18px] font-bold tracking-[-0.02em]">{solvedPlayer.name}</div>
            </div>
            <button className="text-[13px] font-semibold text-ink-muted" onClick={() => setJustSolved(null)}>
              Hide
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section key={run.current} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 sm:p-6" aria-label="Club path">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[18px] font-bold tracking-[-0.02em]">Whose career is this?</h2>
          <span className="text-[13px] tabular-nums text-ink-muted">
            {triesLeft} {triesLeft === 1 ? 'try' : 'tries'} left
          </span>
        </div>
        <ol className="mt-4 space-y-1">
          {path.map((club, i) => (
            <motion.li
              key={`${club}-${i}`}
              initial={isReducedMotion() ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={enter(i)}
            >
              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.05] px-4 py-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-lime/15 text-[13px] font-bold tabular-nums text-lime">{i + 1}</span>
                <span className="text-[16px] font-semibold text-ink">{club}</span>
              </div>
              {i < path.length - 1 && (
                <div className="flex justify-center py-0.5 text-ink-faint" aria-hidden>
                  <ArrowDown size={14} />
                </div>
              )}
            </motion.li>
          ))}
        </ol>
      </motion.section>

      <section className="card relative z-20 mt-4 p-4 sm:p-5">
        <GuessInput key={run.current} onSubmit={handleGuess} disabled={false} busy={busy} guessedIds={run.guesses} />
        <p className="mt-2.5 text-[12.5px] text-ink-faint">One miss after your second try ends the run.</p>
      </section>
    </div>
  );
}
