import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Play, RotateCcw, X } from 'lucide-react';
import type { Route } from '@/hooks/useRouter';
import { getPlayer } from '@/data';
import { nationInfo } from '@/data/nations';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/Button';
import { ModeHeader } from '@/components/game/ModeHeader';
import { ShareImageButton } from '@/components/game/ShareImageButton';
import { Confetti } from '@/components/game/Celebration';
import { randomId } from '@/game/random';
import { finishedRound } from '@/game/synthetic';
import {
  TRANSFER_POINTS,
  TRANSFER_QUESTIONS,
  feeOptions,
  formatFee,
  loadTransferGame,
  newTransferGame,
  saveTransferGame,
  transferFor,
  type TransferGame,
} from '@/game/modes/transfer';
import { play } from '@/utils/sound';
import { haptic } from '@/utils/haptics';
import { MOTION, ease, reveal } from '@/ui/motion';

function verdict(correct: number): string {
  if (correct === TRANSFER_QUESTIONS) return 'Transfer guru';
  if (correct >= 6) return 'Knows the market';
  if (correct >= 4) return 'Decent scout';
  if (correct >= 2) return 'Overpaying';
  return 'Panic buyer';
}

export function TransferPage({ navigate }: { navigate: (r: Route) => void }) {
  const { recordRound } = useProfile();
  const [game, setGame] = useState<TransferGame | null>(loadTransferGame);
  const [picked, setPicked] = useState<number | null>(null);
  useEffect(() => {
    if (game) saveTransferGame(game);
  }, [game]);
  const back = () => navigate({ name: 'home' });

  const start = () => {
    setPicked(null);
    setGame(newTransferGame(randomId()));
  };

  if (!game) {
    return (
      <div className="mx-auto max-w-xl">
        <ModeHeader eyebrow="New mode" title="Transfer Fee" onBack={back} />
        <motion.section variants={reveal} custom={0} initial="hidden" animate="show" className="card p-6 text-center">
          <h2 className="heading text-[26px] leading-tight">What did they cost?</h2>
          <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-ink-muted">
            {TRANSFER_QUESTIONS} famous transfers. Pick the reported fee from four options. {TRANSFER_POINTS} XP for each one you get right.
          </p>
          <p className="mx-auto mt-3 max-w-sm text-[12.5px] text-ink-faint">
            Fees are the widely reported initial fee in the currency it was reported in. Sources differ a little, so the options are far apart.
          </p>
          <Button variant="primary" size="lg" className="mt-6 w-full" icon={<Play size={18} />} onClick={start}>
            Start
          </Button>
        </motion.section>
      </div>
    );
  }

  const correct = game.answers.filter((a) => a.correct).length;
  const index = game.answers.length;

  if (game.status === 'over') {
    const points = correct * TRANSFER_POINTS;
    return (
      <div className="mx-auto max-w-xl">
        <ModeHeader eyebrow="Transfer Fee" title="Window closed" onBack={back} />
        {correct >= 6 && <Confetti />}
        <motion.section variants={reveal} custom={0} initial="hidden" animate="show" className="card p-5 text-center sm:p-6">
          <p className="text-[14px] font-semibold text-lime">
            {correct} of {TRANSFER_QUESTIONS} right
          </p>
          <h2 className="heading mt-1 text-[30px] leading-tight">{verdict(correct)}</h2>
          <p className="mt-1 text-[15px] text-ink-muted">+{points} XP</p>
          <ul className="mt-5 space-y-2 text-left">
            {game.answers.map((a) => {
              const t = transferFor(a.playerId)!;
              const p = getPlayer(a.playerId)!;
              return (
                <li key={a.playerId} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${a.correct ? 'bg-ok/15 text-ok' : 'bg-bad/15 text-bad'}`}>
                    {a.correct ? <Check size={15} strokeWidth={2.6} /> : <X size={15} strokeWidth={2.6} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-semibold text-ink">{p.name}</span>
                    <span className="block truncate text-[12.5px] text-ink-muted">
                      {t.from} → {t.to}, {t.year}
                    </span>
                  </span>
                  <span className="shrink-0 text-[14px] font-semibold tabular-nums text-ink">{formatFee(t)}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 grid gap-2.5">
            <ShareImageButton
              data={() => ({
                eyebrow: 'Transfer Fee',
                headline: verdict(correct),
                won: correct >= TRANSFER_QUESTIONS / 2,
                score: points,
                detail: `${correct} of ${TRANSFER_QUESTIONS} reported fees right`,
                tiles: game.answers.map((a) => (a.correct ? 'hit' : 'miss')),
                cta: 'Do you know what they cost?',
              })}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <Button onClick={start} icon={<RotateCcw size={17} />}>
                Play again
              </Button>
              <Button variant="ghost" onClick={back}>
                Back to today
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    );
  }

  const playerId = game.order[index];
  const t = transferFor(playerId)!;
  const p = getPlayer(playerId)!;

  const choose = (fee: number) => {
    if (picked !== null) return;
    setPicked(fee);
    const right = fee === t.fee;
    play(right ? 'win' : 'wrong');
    void haptic(right ? 'success' : 'warning');
    window.setTimeout(() => {
      setPicked(null);
      setGame((g) => {
        if (!g) return g;
        const answers = [...g.answers, { playerId, picked: fee, correct: right }];
        if (answers.length >= g.order.length) {
          const nRight = answers.filter((a) => a.correct).length;
          recordRound(
            finishedRound({
              mode: 'transfer',
              playerId,
              caseNumber: nRight,
              guesses: [],
              maxAttempts: 1,
              won: nRight >= TRANSFER_QUESTIONS / 2,
              points: nRight * TRANSFER_POINTS,
              startedAt: g.startedAt,
            }),
          );
          return { ...g, answers, status: 'over' };
        }
        return { ...g, answers, options: feeOptions(transferFor(g.order[answers.length])!) };
      });
    }, 1100);
  };

  return (
    <div className="mx-auto max-w-xl">
      <ModeHeader
        eyebrow={`Transfer ${index + 1} of ${TRANSFER_QUESTIONS}`}
        title="Transfer Fee"
        onBack={back}
        right={<span className="rounded-full bg-white/[0.07] px-3 py-1.5 text-[12.5px] tabular-nums text-ink-muted">{correct} right</span>}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={playerId}
          initial={{ opacity: 0, y: MOTION.rise }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: ease(MOTION.fadeOut) }}
          transition={ease(MOTION.enter)}
          className="card p-5 sm:p-6"
        >
          <p className="text-center text-[30px] leading-none" aria-hidden>
            {nationInfo(p.nationality).flag}
          </p>
          <h2 className="heading mt-2 text-center text-[26px] leading-tight">{p.name}</h2>
          <p className="mt-2 flex items-center justify-center gap-2 text-center text-[15px] text-ink-muted">
            {t.from} <ArrowRight size={15} className="shrink-0" /> {t.to}
          </p>
          <p className="mt-0.5 text-center text-[13px] text-ink-faint">{t.year} · reported fee</p>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {game.options.map((fee) => {
              const isAnswer = fee === t.fee;
              const state = picked === null ? 'idle' : isAnswer ? 'right' : fee === picked ? 'wrong' : 'dim';
              return (
                <button
                  key={fee}
                  onClick={() => choose(fee)}
                  disabled={picked !== null}
                  className={`h-14 rounded-full border text-[17px] font-semibold tabular-nums transition-colors ${
                    state === 'right'
                      ? 'border-ok/50 bg-ok/[0.18] text-ok'
                      : state === 'wrong'
                        ? 'border-bad/50 bg-bad/[0.15] text-bad'
                        : state === 'dim'
                          ? 'border-white/[0.06] bg-white/[0.03] text-ink-faint'
                          : 'border-white/[0.12] bg-white/[0.07] text-ink hover:bg-white/[0.11]'
                  }`}
                >
                  {formatFee(t, fee)}
                </button>
              );
            })}
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
