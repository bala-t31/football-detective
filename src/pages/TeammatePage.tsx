import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Heart, RotateCcw, X } from 'lucide-react';
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
  POINTS_PER_TEAMMATE,
  TEAMMATE_LIVES,
  TEAMMATE_TARGET,
  loadTeammateGame,
  nextPuzzleId,
  puzzleById,
  saveTeammateGame,
  teammateScore,
  teammateWon,
  type TeammateGame,
} from '@/game/teammate';
import { play } from '@/utils/sound';
import { haptic } from '@/utils/haptics';

function newGame(current?: string): TeammateGame {
  return { id: randomId(), puzzleId: nextPuzzleId(current), found: [], wrong: [], status: 'playing', startedAt: Date.now() };
}

export function TeammatePage({ navigate }: { navigate: (r: Route) => void }) {
  const { recordRound } = useProfile();
  const toast = useToast();
  const [game, setGame] = useState<TeammateGame>(() => loadTeammateGame() ?? newGame());
  const [busy, setBusy] = useState(false);

  useEffect(() => saveTeammateGame(game), [game]);

  const puzzle = puzzleById(game.puzzleId)!;
  const star = getPlayer(puzzle.starId)!;
  const lives = TEAMMATE_LIVES - game.wrong.length;
  const score = teammateScore(game);
  const won = teammateWon(game);
  const back = () => navigate({ name: 'home' });

  const finish = (g: TeammateGame) => {
    const done: TeammateGame = { ...g, status: 'over' };
    recordRound(
      finishedRound({
        mode: 'teammate',
        playerId: puzzle.starId,
        caseNumber: done.found.length,
        guesses: [...done.found, ...done.wrong],
        maxAttempts: TEAMMATE_LIVES,
        won: teammateWon(done),
        points: teammateScore(done),
        startedAt: done.startedAt,
      }),
    );
    if (teammateWon(done)) {
      play('win');
      void haptic('success');
    } else {
      play('lose');
      void haptic('error');
    }
    setGame(done);
  };

  const handleGuess = async (id: string) => {
    if (game.status !== 'playing' || busy) return { ok: false, message: 'Hold on…' };
    if (id === puzzle.starId) return { ok: false, message: `That's ${star.name} himself. Name a teammate.` };
    if (game.found.includes(id) || game.wrong.includes(id)) return { ok: false, message: 'You already named this player.' };
    setBusy(true);
    play('tap');
    await new Promise((r) => window.setTimeout(r, 300));
    let next: TeammateGame;
    if (puzzle.answers.includes(id)) {
      next = { ...game, found: [...game.found, id] };
      play('select');
      void haptic('success');
      if (next.found.length === TEAMMATE_TARGET) toast('Target reached. Keep going for more XP', 'success');
    } else {
      next = { ...game, wrong: [...game.wrong, id] };
      play('wrong');
      void haptic('warning');
      const left = TEAMMATE_LIVES - next.wrong.length;
      if (left > 0) toast(`Never played together there. ${left} ${left === 1 ? 'life' : 'lives'} left`, 'info');
    }
    setBusy(false);
    if (next.wrong.length >= TEAMMATE_LIVES || next.found.length >= puzzle.answers.length) finish(next);
    else setGame(next);
    return { ok: true };
  };

  if (game.status === 'over') {
    const missed = puzzle.answers.filter((a) => !game.found.includes(a));
    return (
      <div className="mx-auto max-w-xl">
        <ModeHeader eyebrow="Name the Teammate" title={won ? 'Well played' : 'Out of lives'} onBack={back} />
        {won && <Confetti />}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6 text-center sm:p-8">
          <p className={`text-[14px] font-semibold ${won ? 'text-ok' : 'text-bad'}`}>
            {star.name} at {puzzle.club}
          </p>
          <div className="mt-3 font-display text-[64px] font-extrabold leading-none tracking-[-0.05em] tabular-nums">
            {game.found.length}
            <span className="text-[28px] text-ink-faint">/{puzzle.answers.length}</span>
          </div>
          <p className="mt-1 text-[15px] text-ink-muted">
            teammates named · <span className="font-semibold text-ink">{score} XP</span>
          </p>

          {missed.length > 0 && (
            <div className="mt-6 text-left">
              <p className="text-[13px] font-medium text-ink-muted">Teammates you could have named</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {missed.map((id) => (
                  <span key={id} className="rounded-full border border-white/[0.09] bg-white/[0.05] px-3 py-1 text-[13.5px] text-ink">
                    {getPlayer(id)?.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 grid gap-2.5">
            <ShareImageButton
              data={() => ({
                eyebrow: `Name the Teammate · ${puzzle.club}`,
                headline: `${game.found.length} of ${star.name}'s teammates`,
                won,
                score,
                detail: `${game.found.length} named · ${game.wrong.length} wrong`,
                tiles: [...game.found.map(() => 'hit' as const), ...game.wrong.map(() => 'miss' as const)],
                cta: 'How many can you name?',
              })}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <Button onClick={() => setGame(newGame(puzzle.id))} icon={<RotateCcw size={17} />}>
                Another star
              </Button>
              <Button variant="ghost" onClick={back}>
                Back to today
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <ModeHeader
        eyebrow="Name the Teammate"
        title={puzzle.club}
        onBack={back}
        right={
          <span className="flex items-center gap-1" role="img" aria-label={`${lives} lives left`}>
            {Array.from({ length: TEAMMATE_LIVES }).map((_, i) => (
              <motion.span key={i} animate={{ scale: i < lives ? 1 : 0.75, opacity: i < lives ? 1 : 0.3 }}>
                <Heart size={20} className={i < lives ? 'fill-bad text-bad' : 'text-ink-faint'} />
              </motion.span>
            ))}
          </span>
        }
      />

      <section className="card p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <PlayerAvatar player={star} revealed size="sm" />
          <div className="min-w-0">
            <h2 className="heading text-[22px] leading-tight">Who played with {star.name}?</h2>
            <p className="mt-1 text-[14px] text-ink-muted">
              At {puzzle.club}, {puzzle.years}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <div className="flex items-baseline justify-between text-[13px]">
            <span className="font-medium text-ink">
              {game.found.length} found {game.found.length < TEAMMATE_TARGET ? `· ${TEAMMATE_TARGET} to win` : '· target reached'}
            </span>
            <span className="tabular-nums text-ink-muted">{score} XP</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,#2fc785,#7ff0bf)]"
              animate={{ width: `${Math.min(100, (game.found.length / puzzle.answers.length) * 100)}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            />
          </div>
          <p className="mt-1.5 text-[12.5px] text-ink-faint">
            {puzzle.answers.length} teammates in the database · {POINTS_PER_TEAMMATE} XP each
          </p>
        </div>
      </section>

      <section className="card relative z-20 mt-4 p-4 sm:p-5">
        <GuessInput onSubmit={handleGuess} disabled={false} busy={busy} guessedIds={[...game.found, ...game.wrong]} />
        <div className="mt-4 flex flex-wrap gap-1.5">
          <AnimatePresence>
            {game.found.map((id) => (
              <motion.span
                key={id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 rounded-full border border-ok/30 bg-ok/[0.1] py-1 pl-2 pr-3 text-[13.5px] font-medium text-ink"
              >
                <Check size={14} className="text-ok" /> {getPlayer(id)?.name}
              </motion.span>
            ))}
            {game.wrong.map((id) => (
              <motion.span
                key={id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 rounded-full border border-bad/25 bg-bad/[0.08] py-1 pl-2 pr-3 text-[13.5px] text-ink-muted line-through"
              >
                <X size={14} className="text-bad" /> {getPlayer(id)?.name}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <Button variant={game.found.length >= TEAMMATE_TARGET ? 'secondary' : 'ghost'} className="mt-4 w-full" onClick={() => finish(game)}>
          {game.found.length >= TEAMMATE_TARGET ? 'I’m done, show the rest' : 'Give up and show answers'}
        </Button>
      </section>
    </div>
  );
}
