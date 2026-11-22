import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Eye, Lightbulb, Swords } from 'lucide-react';
import type { Difficulty, GameMode } from '@/types';
import { useRound } from '@/hooks/useRound';
import { useProfile } from '@/hooks/useProfile';
import { MODES, getPracticeLevel, setPracticeLevel } from '@/game/engine';
import { PRACTICE_LEVELS } from '@/game/levels';
import { REVEAL_ANSWER_COST } from '@/game/scoring';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { PlayerAvatar } from '@/components/game/PlayerAvatar';
import { ClueList } from '@/components/game/ClueList';
import { GuessInput } from '@/components/game/GuessInput';
import { FeedbackGrid } from '@/components/game/FeedbackGrid';
import { ResultsPanel } from '@/components/game/ResultsPanel';
import type { Route } from '@/hooks/useRouter';
import { WeekSummary } from '@/components/game/WeekSummary';
import { LEGENDS_PER_WEEK, weekNumber } from '@/game/weekly';
import { MOTION, ease } from '@/ui/motion';
import { dailyTheme } from '@/game/daily';

const DIFFICULTY: Record<Difficulty, { label: string; style: string }> = {
  easy: { label: 'Casual', style: 'border-ok/30 bg-ok/10 text-ok' },
  medium: { label: 'Ball Knower', style: 'border-warn/30 bg-warn/10 text-warn' },
  hard: { label: 'Elite', style: 'border-bad/30 bg-bad/10 text-bad' },
};

const MODE_TITLE: Record<GameMode, string> = {
  daily: 'Daily mystery',
  practice: 'Practice',
  hardcore: 'Hardcore',
  career: 'Career Detective',
  legends: 'Weekly Legends',
  clubpath: 'Club Path Run',
  teammate: 'Name the Teammate',
  higherlower: 'Higher or Lower',
  emoji: 'Emoji Clue',
  transfer: 'Transfer Fee',
  xi: 'Guess the XI',
};

interface Props {
  mode: GameMode;
  navigate: (r: Route) => void;
}

export function GamePage({ mode, navigate }: Props) {
  const { round, player, clues, feedback, busy, hintsLeft, attemptsLeft, submit, reveal, revealAnswer, newRound, lastUnlocked, legends } = useRound(mode);
  const [confirmReveal, setConfirmReveal] = useState(false);
  const [practiceLevel, setPracticeLevelState] = useState(getPracticeLevel);
  useEffect(() => {
    if (!confirmReveal) return;
    const t = window.setTimeout(() => setConfirmReveal(false), 4000);
    return () => window.clearTimeout(t);
  }, [confirmReveal]);
  const toast = useToast();
  const { profile } = useProfile();
  const cfg = MODES[mode];
  const finished = round.status !== 'playing';
  // Daily already closed on this device but the saved round was lost: don't allow a replay.
  const dailyLocked = mode === 'daily' && !finished && Boolean(round.date && profile.daily.completed[round.date]);
  const totalClues = cfg.hintsAllowed ? clues.length : 1;
  const isLegends = mode === 'legends';
  const weekDone = isLegends && legends.length >= LEGENDS_PER_WEEK;
  // All five legends played but the saved round is gone: show the week instead of replaying.
  const weekLocked = weekDone && !finished;
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (finished) topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [finished]);

  const handleSubmit = async (id: string) => {
    const res = await submit(id);
    if (!res.ok) return { ok: false, message: res.message };
    if (!res.correct && res.state.status === 'playing') {
      const left = res.state.maxAttempts - res.state.guesses.length;
      toast(`Not them. ${left} guess${left === 1 ? '' : 'es'} left`, 'info');
    }
    return { ok: true };
  };

  const diff = DIFFICULTY[player.difficulty];

  return (
    <div ref={topRef} className="scroll-mt-20">
      {/* Case header */}
      <div className="mb-4 flex items-center gap-3 sm:mb-6">
        <button
          onClick={() => navigate({ name: 'home' })}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/[0.1] bg-white/[0.07] text-ink transition-colors hover:bg-white/[0.12]"
          aria-label="Back to dashboard"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-ink-muted">
            {MODE_TITLE[mode]}
            {isLegends && round.date ? ` · Week ${weekNumber(round.date)}` : ''}
            {mode === 'daily' && round.date && dailyTheme(round.date) ? ` · ${dailyTheme(round.date)}` : ''}
          </p>
          <h1 className="heading text-[24px] leading-tight">
            {isLegends ? (weekLocked ? 'Week complete' : `Legend ${round.caseNumber} of ${LEGENDS_PER_WEEK}`) : `Case ${round.caseNumber}`}
          </h1>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[12.5px] font-semibold ${diff.style}`}>{diff.label}</span>
      </div>

      {mode === 'practice' && !finished && !round.challenge && (
        <div className="mb-4 sm:mb-5">
          <div role="radiogroup" aria-label="Practice level" className="grid grid-cols-4 gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] p-1">
            {PRACTICE_LEVELS.map((l) => {
              const on = practiceLevel === l.id;
              return (
                <button
                  key={l.id}
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    if (on) return;
                    setPracticeLevel(l.id);
                    setPracticeLevelState(l.id);
                    newRound();
                  }}
                  className={`whitespace-nowrap rounded-full px-1 py-2 text-[12.5px] font-semibold transition-colors ${on ? 'bg-white/[0.14] text-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.15)]' : 'text-ink-muted hover:text-ink'}`}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {weekLocked && round.date ? (
        <div className="card mx-auto max-w-md p-6 text-center">
          <h2 className="heading text-[24px] leading-tight">You&apos;ve played this week&apos;s legends</h2>
          <WeekSummary weekKey={round.date} results={legends} />
          <Button variant="ghost" className="mt-4 w-full" onClick={() => navigate({ name: 'home' })}>
            Back to today
          </Button>
        </div>
      ) : dailyLocked ? (
        <div className="card mx-auto max-w-md p-7 text-center">
          <h2 className="heading text-[26px] leading-tight">You&apos;ve already played today&apos;s case</h2>
          <p className="mt-2 text-[15px] text-ink-muted">A new mystery arrives at midnight. Practice keeps your eye in until then.</p>
          <div className="mt-6 grid gap-2">
            <Button variant="primary" onClick={() => navigate({ name: 'play', mode: 'practice' })}>
              Play practice
            </Button>
            <Button variant="ghost" onClick={() => navigate({ name: 'home' })}>
              Back to today
            </Button>
          </div>
        </div>
      ) : finished ? (
        <div className="mx-auto max-w-2xl">
          <ResultsPanel
            round={round}
            player={player}
            clues={clues}
            unlocked={lastUnlocked}
            onPlayAgain={mode === 'daily' || weekDone ? undefined : newRound}
            playAgainLabel={isLegends ? 'Next legend' : 'Next case'}
            footer={isLegends && round.date ? <WeekSummary weekKey={round.date} results={legends} /> : undefined}
            onHome={() => navigate({ name: 'home' })}
            onPractice={() => navigate({ name: 'play', mode: 'practice' })}
          />
          {feedback.length > 0 && (
            <div className="card mt-4 p-4 sm:p-5">
              <h3 className="mb-3 font-display text-[18px] font-bold tracking-[-0.02em]">Your guesses</h3>
              <FeedbackGrid feedback={feedback} maxAttempts={feedback.length} />
            </div>
          )}
        </div>
      ) : (
        <>
        {round.challenge && (
          <div className="mb-4 flex items-center gap-3 rounded-[22px] border border-warn/25 bg-warn/[0.08] px-4 py-3">
            <Swords size={18} className="shrink-0 text-warn" />
            <p className="text-[14px] leading-snug text-ink">
              <span className="font-semibold">Challenge: </span>
              {round.challenge.won
                ? `your friend found this player in ${round.challenge.guesses} guess${round.challenge.guesses === 1 ? '' : 'es'} for ${round.challenge.score} XP. Beat it.`
                : 'this player beat your friend. Find him to win.'}
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-6">
          {/* Evidence */}
          <section className="card p-4 sm:p-5" aria-label="Clues">
            <div className="mb-4 flex items-center gap-4">
              <PlayerAvatar revealed={false} scanning={busy} size="sm" />
              <div className="min-w-0 flex-1">
                <h2 className="heading text-[22px] leading-tight">Who is it?</h2>
                <Beads left={attemptsLeft} max={round.maxAttempts} />
                <p className="mt-1.5 text-[13px] text-ink-muted">
                  {attemptsLeft} guess{attemptsLeft === 1 ? '' : 'es'} left · {round.revealed} of {totalClues} clue{totalClues === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            {/* Hardcore never reveals more, so don't show locked slots that can't be opened. */}
            <ClueList clues={cfg.hintsAllowed ? clues : clues.slice(0, 1)} revealed={round.revealed} mode={mode} />
            {cfg.hintsAllowed ? (
              <Button className="mt-3 w-full" onClick={reveal} disabled={hintsLeft === 0 || busy} icon={<Lightbulb size={17} />}>
                {hintsLeft === 0 ? 'All clues revealed' : 'Reveal next clue (−75 XP)'}
              </Button>
            ) : (
              <p className="mt-3 rounded-2xl bg-white/[0.04] px-4 py-3 text-[13.5px] text-ink-muted">Hardcore gives you one clue. Trust your instincts.</p>
            )}
          </section>

          {/* Guessing */}
          <section className="space-y-4">
            <motion.div className="card relative z-20 p-4 sm:p-5">
              <h2 className="mb-3 font-display text-[18px] font-bold tracking-[-0.02em]">Make a guess</h2>
              <GuessInput onSubmit={handleSubmit} disabled={finished} busy={busy} guessedIds={round.guesses} />
              <p className="mt-2.5 text-[12.5px] text-ink-faint">
                <span className="hidden sm:inline">Use ↑ ↓ and Enter to pick from the list. </span>
                A wrong guess costs 100 XP.
              </p>
              {!finished && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => (confirmReveal ? (setConfirmReveal(false), revealAnswer()) : setConfirmReveal(true))}
                  className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-[14px] font-semibold transition-colors ${
                    confirmReveal ? 'border-bad/40 bg-bad/15 text-bad' : 'border-white/[0.08] bg-white/[0.03] text-ink-muted hover:text-ink'
                  }`}
                >
                  <Eye size={16} />
                  {confirmReveal ? `Tap again to reveal (−${REVEAL_ANSWER_COST} XP from your total)` : `Reveal the player (−${REVEAL_ANSWER_COST} XP)`}
                </button>
              )}
            </motion.div>
            <div className="card p-4 sm:p-5">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-display text-[18px] font-bold tracking-[-0.02em]">Your guesses</h2>
                <span className="text-[13px] tabular-nums text-ink-muted">
                  {round.guesses.length} of {round.maxAttempts}
                </span>
              </div>
              <FeedbackGrid feedback={feedback} maxAttempts={round.maxAttempts} />
            </div>
          </section>
        </div>
        </>
      )}
    </div>
  );
}

/** Remaining guesses as glass beads; the one just spent pops out. */
function Beads({ left, max }: { left: number; max: number }) {
  return (
    <div className="mt-2 flex gap-1.5" role="img" aria-label={`${left} of ${max} attempts remaining`}>
      {Array.from({ length: max }).map((_, i) => {
        const on = i < left;
        return (
          <motion.span
            key={i}
            initial={false}
            animate={{ scale: on ? 1 : 0.7, opacity: on ? 1 : 0.35 }}
            transition={ease(MOTION.quick)}
            className={`h-3 w-3 rounded-full ${
              on
                ? left <= 1
                  ? 'bg-[radial-gradient(circle_at_35%_30%,#ffd0d0,#ff7a7a_60%,#c94848)] shadow-[0_0_8px_rgb(255_122_122/0.7)]'
                  : 'bg-[radial-gradient(circle_at_35%_30%,#d9ffef,#4be3a0_60%,#239563)] shadow-[0_0_8px_rgb(75_227_160/0.6)]'
                : 'bg-white/25'
            }`}
          />
        );
      })}
    </div>
  );
}
