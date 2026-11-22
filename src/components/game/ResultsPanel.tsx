import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Copy, Crown, Image as ImageIcon, RotateCcw, Share2, Trophy } from 'lucide-react';
import type { Achievement, Clue, Player, RoundState } from '@/types';
import { POSITION_LABEL } from '@/data/positions';
import { MODES, wrongGuessCount } from '@/game/engine';
import { caseExplanation } from '@/game/dossier';
import { roundVerdict } from '@/game/levels';
import { buildShareText, cardForRound, copyText, shareCard, shareText } from '@/game/share';
import { formatCountdown } from '@/utils/date';
import { useMidnightCountdown } from '@/hooks/useCountdown';
import { isNative } from '@/utils/native';
import { Button } from '@/components/ui/Button';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useToast } from '@/components/ui/Toast';
import { AchievementIcon } from '@/components/ui/AchievementIcon';
import { PlayerAvatar } from './PlayerAvatar';
import { ClueList } from './ClueList';
import { Confetti } from './Celebration';

interface Props {
  round: RoundState;
  player: Player;
  clues: Clue[];
  unlocked: Achievement[];
  onPlayAgain?: () => void;
  playAgainLabel?: string;
  /** Extra content shown under the actions (e.g. the weekly summary). */
  footer?: ReactNode;
  onHome: () => void;
  onPractice: () => void;
}

/** The web address is meaningless inside the APK, so only include it on the web. */
function shareUrl(): string | undefined {
  return isNative() ? undefined : window.location.origin + window.location.pathname;
}

const spring = { type: 'spring', stiffness: 260, damping: 26 } as const;

export function ResultsPanel({ round, player, clues, unlocked, onPlayAgain, playAgainLabel = 'Next case', footer, onHome, onPractice }: Props) {
  const won = round.status === 'won';
  const score = round.score;
  const toast = useToast();
  const [includeName, setIncludeName] = useState(false);
  const [showFile, setShowFile] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const { ms } = useMidnightCountdown();
  const uniqueClubs = player.careerClubs.filter((c, i, arr) => i === 0 || arr[i - 1] !== c);
  const n = round.guesses.length;

  const verdict = round.gaveUp
    ? 'You revealed the answer'
    : won
      ? n === 1
        ? 'First guess. Brilliant.'
        : `Solved in ${n} guesses`
      : 'Not this time';
  const vibe = roundVerdict(round);

  const doShare = async () => {
    const text = buildShareText(round, { includeName, url: shareUrl() });
    const res = await shareText(text);
    if (res === 'copied') toast('Result copied', 'success');
    else if (res === 'shared') toast('Result shared', 'success');
    else if (res === 'failed') toast('Sharing isn’t available here. Use Copy instead.', 'error');
  };
  const doShareImage = async () => {
    setImageBusy(true);
    try {
      const res = await shareCard(cardForRound(round, includeName), shareUrl());
      if (res === 'downloaded') toast('Image saved. Post it anywhere', 'success');
      else if (res === 'failed') toast('Couldn’t share the image. Try the text option', 'error');
    } catch {
      toast('Couldn’t make the image', 'error');
    } finally {
      setImageBusy(false);
    }
  };
  const doCopy = async () => {
    const res = await copyText(buildShareText(round, { includeName, url: shareUrl() }));
    toast(res === 'copied' ? 'Result copied' : 'Couldn’t copy the result', res === 'copied' ? 'success' : 'error');
  };

  return (
    <section className="relative" aria-label="Case result">
      {won && <Confetti />}

      {/* Reveal */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="card overflow-hidden p-5 text-center sm:p-7">
        <motion.p
          initial={{ opacity: 0 }}
          animate={won ? { opacity: 1 } : { opacity: 1, x: [0, -8, 8, -4, 4, 0] }}
          transition={{ duration: 0.5 }}
          className={`text-[14px] font-semibold ${won ? 'text-ok' : 'text-bad'}`}
        >
          {verdict}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...spring, delay: 0.5 }}
          className="mx-auto mt-2 w-fit rounded-full border border-white/[0.1] bg-white/[0.06] px-3 py-1 text-[13px] font-semibold text-ink"
        >
          {vibe}
        </motion.p>

        <div className="mt-5 flex justify-center">
          <PlayerAvatar player={player} revealed size="lg" />
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...spring, delay: 0.3 }}
          className="heading mt-5 text-[32px] leading-[1.05] sm:text-[40px]"
        >
          {player.name}
        </motion.h2>
        <p className="mt-2 text-[15px] text-ink-muted">
          {POSITION_LABEL[player.position]}, {player.nationality}, {player.to ? `${player.from}–${player.to}` : `since ${player.from}`}
        </p>
        {(player.worldCupWinner || player.ballonDorAwards > 0) && (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {player.worldCupWinner && (
              <span className="chip !border-warn/30 !bg-warn/10 !text-warn">
                <Trophy size={12} /> World Cup winner
              </span>
            )}
            {player.ballonDorAwards > 0 && (
              <span className="chip !border-lime/30 !bg-lime/10 !text-lime">
                <Crown size={12} /> Ballon d&apos;Or ×{player.ballonDorAwards}
              </span>
            )}
          </div>
        )}

        {/* Score */}
        <div className="mx-auto mt-6 max-w-xs rounded-[24px] border border-white/[0.08] bg-black/20 px-5 py-4 shadow-[inset_0_2px_8px_rgb(0_0_0/0.3)]">
          <div className="font-display text-[52px] font-extrabold leading-none tracking-[-0.05em] tabular-nums text-ink">
            <AnimatedNumber value={score?.total ?? 0} />
            <span className="ml-1.5 text-[20px] font-bold tracking-normal text-lime">XP</span>
          </div>
          <p className="mt-1.5 text-[13px] text-ink-muted">
            {round.gaveUp
              ? 'Taken from your total for revealing the answer'
              : `${n} of ${round.maxAttempts} guesses, ${round.revealed} clue${round.revealed === 1 ? '' : 's'}`}
          </p>
        </div>

        {score && won && (
          <dl className="mx-auto mt-4 max-w-xs space-y-1.5 text-left text-[14px] tabular-nums">
            <Row label="Identified the player" value={`+${score.base}`} />
            {score.wrongGuessPenalty > 0 && <Row label={`Wrong guesses (${wrongGuessCount(round)})`} value={`−${score.wrongGuessPenalty}`} tone="bad" />}
            {score.cluePenalty > 0 && <Row label={`Extra clues (${round.revealed - 1})`} value={`−${score.cluePenalty}`} tone="bad" />}
            {score.firstGuessBonus > 0 && <Row label="First-guess bonus" value={`+${score.firstGuessBonus}`} tone="ok" />}
            {score.noHintBonus > 0 && <Row label="No-hint bonus" value={`+${score.noHintBonus}`} tone="ok" />}
            {score.multiplier !== 1 && <Row label={`${MODES[round.mode].name} multiplier`} value={`×${score.multiplier}`} tone="ok" />}
          </dl>
        )}

        {unlocked.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {unlocked.map((a, i) => (
              <motion.span
                key={a.id}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 16, delay: 0.6 + i * 0.12 }}
                className="flex items-center gap-2 rounded-full border border-warn/30 bg-warn/10 py-1.5 pl-1.5 pr-3.5 text-[13.5px] font-medium text-ink"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[linear-gradient(180deg,#f8dc8a,#e0ac35)] text-[#3a2600]">
                  <AchievementIcon icon={a.icon} size={14} />
                </span>
                {a.title}
              </motion.span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-7 grid gap-2.5">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2.5">
            <Button variant="primary" size="lg" onClick={doShareImage} disabled={imageBusy} icon={<ImageIcon size={18} />}>
              {imageBusy ? 'Making image…' : 'Share image'}
            </Button>
            <Button size="lg" onClick={doShare} icon={<Share2 size={18} />} aria-label="Share as text" className="w-14 !px-0">
              <span className="sr-only">Share as text</span>
            </Button>
            <Button size="lg" onClick={doCopy} icon={<Copy size={18} />} aria-label="Copy" className="w-14 !px-0">
              <span className="sr-only">Copy</span>
            </Button>
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-2.5 py-1 text-[13.5px] text-ink-muted">
            <input type="checkbox" checked={includeName} onChange={(e) => setIncludeName(e.target.checked)} className="h-4 w-4 accent-[#4be3a0]" />
            Include the player&apos;s name when sharing (spoiler)
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {onPlayAgain ? (
              <Button onClick={onPlayAgain} icon={<RotateCcw size={17} />}>
                {playAgainLabel}
              </Button>
            ) : (
              <Button onClick={onPractice} icon={<RotateCcw size={17} />}>
                Practice mode
              </Button>
            )}
            <Button variant="ghost" onClick={onHome}>
              Back to today
            </Button>
          </div>
          {footer}
          {round.mode === 'daily' && (
            <p className="pt-1 text-[13px] text-ink-muted">
              Next mystery in <span className="font-semibold tabular-nums text-ink">{formatCountdown(ms)}</span>
            </p>
          )}
        </div>
      </motion.div>

      {/* Career + why */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.15 }} className="card mt-4 p-5">
        <h3 className="font-display text-[18px] font-bold tracking-[-0.02em]">Career</h3>
        <ol className="mt-3 flex flex-wrap items-center gap-1.5">
          {uniqueClubs.map((c, i) => (
            <li key={`${c}-${i}`} className="flex items-center gap-1.5">
              <span className="rounded-full border border-white/[0.09] bg-white/[0.05] px-3 py-1 text-[13.5px] text-ink">{c}</span>
              {i < uniqueClubs.length - 1 && <span className="h-px w-2.5 bg-white/25" aria-hidden />}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[14.5px] leading-relaxed text-ink-muted">{caseExplanation(player, round.mode)}</p>

        <button
          onClick={() => setShowFile((v) => !v)}
          className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3 text-left text-[14.5px] font-semibold text-ink"
          aria-expanded={showFile}
        >
          All {clues.length} clues
          <ChevronDown size={18} className={`text-ink-muted transition-transform ${showFile ? 'rotate-180' : ''}`} />
        </button>
        {showFile && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 overflow-hidden">
            <ClueList clues={clues} revealed={clues.length} mode={round.mode} showAll />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'bad' }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={`font-semibold ${tone === 'ok' ? 'text-ok' : tone === 'bad' ? 'text-bad' : 'text-ink'}`}>{value}</dd>
    </div>
  );
}
