import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, FileSearch, Lightbulb, Skull, Sparkles } from 'lucide-react';
import type { Difficulty, GameMode } from '@/types';
import { useRound } from '@/hooks/useRound';
import { useProfile } from '@/hooks/useProfile';
import { MODES } from '@/game/engine';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { PlayerAvatar } from '@/components/game/PlayerAvatar';
import { ClueList } from '@/components/game/ClueList';
import { GuessInput } from '@/components/game/GuessInput';
import { FeedbackGrid } from '@/components/game/FeedbackGrid';
import { ResultsPanel } from '@/components/game/ResultsPanel';
import type { Route } from '@/hooks/useRouter';

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  easy: '!text-ok !border-ok/30',
  medium: '!text-warn !border-warn/30',
  hard: '!text-bad !border-bad/30',
};

interface Props {
  mode: GameMode;
  navigate: (r: Route) => void;
}

export function GamePage({ mode, navigate }: Props) {
  const { round, player, clues, feedback, busy, hintsLeft, attemptsLeft, submit, reveal, newRound, lastUnlocked } = useRound(mode);
  const toast = useToast();
  const { profile } = useProfile();
  const cfg = MODES[mode];
  const finished = round.status !== 'playing';
  // Daily already closed on this device but the saved round was lost: don't allow a replay.
  const dailyLocked = mode === 'daily' && !finished && Boolean(round.date && profile.daily.completed[round.date]);
  const totalClues = cfg.hintsAllowed ? clues.length : 1;
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (finished) topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [finished]);

  const handleSubmit = async (id: string) => {
    const res = await submit(id);
    if (!res.ok) return { ok: false, message: res.message };
    if (!res.correct && res.state.status === 'playing') {
      const left = res.state.maxAttempts - res.state.guesses.length;
      toast(`Not them. ${left} attempt${left === 1 ? '' : 's'} left.`, 'info');
    }
    return { ok: true };
  };

  const caseCode = mode === 'daily' ? `DC-${String(round.caseNumber).padStart(3, '0')}` : `${mode.slice(0, 2).toUpperCase()}-${round.caseNumber}`;

  return (
    <div ref={topRef} className="scroll-mt-20">
      {/* Case header */}
      <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-6">
        <button
          onClick={() => navigate({ name: 'home' })}
          className="mr-1 grid h-9 w-9 place-items-center rounded-lg border border-pitch-700 text-ink-muted hover:text-ink"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="mr-auto">
          <div className="label flex items-center gap-1.5">
            {mode === 'hardcore' ? <Skull size={11} /> : <FileSearch size={11} />} {cfg.name}
          </div>
          <div className="font-mono text-lg font-bold text-ink">CASE #{caseCode}</div>
        </div>
        <span className={`chip ${DIFFICULTY_STYLE[player.difficulty]}`}>{player.difficulty}</span>
      </div>

      {dailyLocked ? (
        <div className="card mx-auto max-w-md p-6 text-center">
          <div className="label">Case closed</div>
          <h2 className="heading mt-2 text-2xl">You&apos;ve already played today&apos;s case</h2>
          <p className="mt-2 text-sm text-ink-muted">A new Daily Case unlocks at midnight. Keep sharpening your instincts in Practice.</p>
          <div className="mt-5 grid gap-2">
            <Button variant="primary" onClick={() => navigate({ name: 'play', mode: 'practice' })}>
              Play practice
            </Button>
            <Button variant="ghost" onClick={() => navigate({ name: 'home' })}>
              Back to headquarters
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
            onPlayAgain={mode === 'daily' ? undefined : newRound}
            onHome={() => navigate({ name: 'home' })}
            onPractice={() => navigate({ name: 'play', mode: 'practice' })}
          />
          {feedback.length > 0 && (
            <div className="card mt-4 p-4 sm:p-5">
              <div className="label mb-3">Your investigation</div>
              <FeedbackGrid feedback={feedback} maxAttempts={feedback.length} />
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-6">
          {/* Dossier column */}
          <aside className="space-y-4">
            <div className="card p-4">
              <div className="flex gap-4">
                <PlayerAvatar revealed={false} scanning={busy} />
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <div className="label">Subject</div>
                    <div className="heading text-xl">Unknown footballer</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Meter label="Attempts" value={attemptsLeft} max={round.maxAttempts} tone={attemptsLeft <= 1 ? 'bad' : 'lime'} />
                    <div>
                      <div className="label">Clues</div>
                      <div className="font-mono text-lg font-bold text-ink">
                        {round.revealed}
                        <span className="text-ink-faint">/{totalClues}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="label flex items-center gap-1.5">
                  <Sparkles size={11} /> {mode === 'career' ? 'Career trail' : 'Evidence board'}
                </div>
                <span className="font-mono text-[11px] text-ink-faint">
                  {cfg.hintsAllowed ? `${hintsLeft} hint${hintsLeft === 1 ? '' : 's'} left` : 'hints disabled'}
                </span>
              </div>
              {/* Hardcore never reveals more, so don't show locked slots that can't be opened. */}
              <ClueList clues={cfg.hintsAllowed ? clues : clues.slice(0, 1)} revealed={round.revealed} mode={mode} />
              {cfg.hintsAllowed ? (
                <Button
                  className="mt-3 w-full"
                  onClick={reveal}
                  disabled={hintsLeft === 0 || busy}
                  icon={<Lightbulb size={16} />}
                >
                  {hintsLeft === 0 ? 'All clues revealed' : `Reveal next clue  ·  −75 XP`}
                </Button>
              ) : (
                <p className="mt-3 flex items-center gap-2 rounded-lg bg-pitch-900 px-3 py-2.5 text-xs text-ink-muted">
                  <Eye size={13} /> Hardcore: one clue only. Trust your instincts.
                </p>
              )}
            </div>
          </aside>

          {/* Investigation column */}
          <section className="space-y-4">
            <motion.div layout className="card relative z-20 p-4">
              <div className="label mb-2">Identify the suspect</div>
              <GuessInput onSubmit={handleSubmit} disabled={finished} busy={busy} guessedIds={round.guesses} />
              <p className="mt-2 text-xs text-ink-faint">
                <span className="hidden sm:inline">Type to search · ↑ ↓ to navigate · Enter to select and submit. </span>
                <span className="sm:hidden">Type a name and pick from the list. </span>
                Wrong guesses cost 100 XP.
              </p>
            </motion.div>
            <div className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="label">Guess history</div>
                <span className="font-mono text-[11px] text-ink-faint">
                  {round.guesses.length}/{round.maxAttempts}
                </span>
              </div>
              <FeedbackGrid feedback={feedback} maxAttempts={round.maxAttempts} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Meter({ label, value, max, tone }: { label: string; value: number; max: number; tone: 'lime' | 'bad' }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="mt-1.5 flex gap-1" aria-label={`${value} of ${max} attempts remaining`}>
        {Array.from({ length: max }).map((_, i) => (
          <motion.span
            key={i}
            animate={{ opacity: i < value ? 1 : 0.25, scale: i < value ? 1 : 0.85 }}
            className={`h-2.5 flex-1 rounded-sm ${i < value ? (tone === 'bad' ? 'bg-bad' : 'bg-lime') : 'bg-pitch-600'}`}
          />
        ))}
      </div>
    </div>
  );
}
