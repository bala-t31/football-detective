import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Home, RotateCcw, Share2, ShieldCheck, ShieldX, Timer, Trophy, Crown } from 'lucide-react';
import type { Achievement, Clue, Player, RoundState } from '@/types';
import { nationInfo } from '@/data/nations';
import { POSITION_LABEL } from '@/data/positions';
import { MODES, wrongGuessCount } from '@/game/engine';
import { caseExplanation } from '@/game/dossier';
import { buildShareText, copyText, shareText } from '@/game/share';
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
  onHome: () => void;
  onPractice: () => void;
}

/** The web address is meaningless inside the APK, so only include it on the web. */
function shareUrl(): string | undefined {
  return isNative() ? undefined : window.location.origin + window.location.pathname;
}

export function ResultsPanel({ round, player, clues, unlocked, onPlayAgain, onHome, onPractice }: Props) {
  const won = round.status === 'won';
  const score = round.score;
  const toast = useToast();
  const [includeName, setIncludeName] = useState(false);
  const { ms } = useMidnightCountdown();
  const uniqueClubs = player.careerClubs.filter((c, i, arr) => i === 0 || arr[i - 1] !== c);

  const doShare = async () => {
    const text = buildShareText(round, { includeName, url: shareUrl() });
    const res = await shareText(text);
    if (res === 'copied') toast('Result copied to clipboard', 'success');
    else if (res === 'shared') toast('Result shared', 'success');
    else if (res === 'failed') toast('Could not share — try copying instead', 'error');
  };
  const doCopy = async () => {
    const res = await copyText(buildShareText(round, { includeName, url: shareUrl() }));
    toast(res === 'copied' ? 'Result copied to clipboard' : 'Copy failed', res === 'copied' ? 'success' : 'error');
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
      aria-label="Case result"
    >
      {won && <Confetti />}

      {/* Verdict banner */}
      <motion.div
        initial={won ? { scale: 0.9, opacity: 0 } : { x: 0, opacity: 0 }}
        animate={won ? { scale: 1, opacity: 1 } : { x: [0, -10, 10, -6, 6, 0], opacity: 1 }}
        transition={{ duration: won ? 0.5 : 0.5, type: won ? 'spring' : 'tween', stiffness: 300, damping: 18 }}
        className={`mb-4 flex items-center gap-3 rounded-2xl border px-4 py-3 ${
          won ? 'border-ok/40 bg-ok/[0.07]' : 'border-bad/40 bg-bad/[0.07]'
        }`}
      >
        {won ? <ShieldCheck className="text-ok" /> : <ShieldX className="text-bad" />}
        <div>
          <div className={`font-mono text-[11px] font-bold uppercase tracking-[0.2em] ${won ? 'text-ok' : 'text-bad'}`}>
            {won ? 'Case solved' : 'Case unsolved'}
          </div>
          <div className="text-sm text-ink-muted">
            {won
              ? round.guesses.length === 1
                ? 'First-guess identification. Textbook detective work.'
                : `Identified in ${round.guesses.length} of ${round.maxAttempts} attempts.`
              : 'Out of attempts. The file has been declassified.'}
          </div>
        </div>
      </motion.div>

      <div className="card overflow-hidden">
        {/* Profile */}
        <div className="flex gap-4 border-b border-pitch-700 p-4 sm:gap-5 sm:p-5">
          <PlayerAvatar player={player} revealed size="lg" />
          <div className="min-w-0 flex-1">
            <div className="label">Mystery player</div>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="heading mt-1 text-2xl leading-tight sm:text-3xl"
            >
              {player.name}
            </motion.h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="chip !normal-case !tracking-normal !text-ink">
                {nationInfo(player.nationality).flag} {player.nationality}
              </span>
              <span className="chip">{POSITION_LABEL[player.position]}</span>
              <span className="chip">{player.to ? `${player.from}–${player.to}` : `${player.from}–now`}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {player.worldCupWinner && (
                <span className="chip !border-warn/30 !text-warn">
                  <Trophy size={11} /> World Cup
                </span>
              )}
              {player.ballonDorAwards > 0 && (
                <span className="chip !border-lime/30 !text-lime">
                  <Crown size={11} /> Ballon d&apos;Or ×{player.ballonDorAwards}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="border-b border-pitch-700 p-4 sm:p-5">
          <div className="label mb-2">Career clubs</div>
          <div className="flex flex-wrap items-center gap-1.5">
            {uniqueClubs.map((c, i) => (
              <span key={`${c}-${i}`} className="flex items-center gap-1.5">
                <span className="rounded-lg border border-pitch-700 bg-pitch-900 px-2.5 py-1 text-[13px] text-ink">{c}</span>
                {i < uniqueClubs.length - 1 && <span className="text-ink-faint">→</span>}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[14px] leading-relaxed text-ink-muted">{caseExplanation(player, round.mode)}</p>
        </div>

        {/* Score */}
        <div className="grid grid-cols-3 border-b border-pitch-700">
          <Stat label="Guesses" value={`${round.guesses.length}/${round.maxAttempts}`} />
          <Stat label="Clues" value={String(round.revealed)} />
          <div className="border-l border-pitch-700 p-4 text-center">
            <div className="label">Score</div>
            <div className="mt-1 font-mono text-2xl font-bold text-lime">
              <AnimatedNumber value={score?.total ?? 0} />
            </div>
            <div className="font-mono text-[10px] text-ink-faint">XP</div>
          </div>
        </div>

        {score && won && (
          <div className="space-y-1.5 border-b border-pitch-700 p-4 font-mono text-[13px] sm:p-5">
            <Row label="Correct identification" value={`+${score.base}`} />
            {score.wrongGuessPenalty > 0 && (
              <Row label={`Incorrect guesses ×${wrongGuessCount(round)}`} value={`−${score.wrongGuessPenalty}`} tone="bad" />
            )}
            {score.cluePenalty > 0 && <Row label={`Extra clues ×${round.revealed - 1}`} value={`−${score.cluePenalty}`} tone="bad" />}
            {score.firstGuessBonus > 0 && <Row label="First-guess bonus" value={`+${score.firstGuessBonus}`} tone="ok" />}
            {score.noHintBonus > 0 && <Row label="No-hint bonus" value={`+${score.noHintBonus}`} tone="ok" />}
            {score.multiplier !== 1 && <Row label={`${MODES[round.mode].name} multiplier`} value={`×${score.multiplier}`} tone="ok" />}
            <div className="mt-2 flex justify-between border-t border-dashed border-pitch-700 pt-2 font-bold text-ink">
              <span>Total</span>
              <span>{score.total} XP</span>
            </div>
          </div>
        )}

        {unlocked.length > 0 && (
          <div className="border-b border-pitch-700 p-4 sm:p-5">
            <div className="label mb-2">Unlocked this case</div>
            <div className="flex flex-wrap gap-2">
              {unlocked.map((a) => (
                <span key={a.id} className="flex items-center gap-2 rounded-lg border border-lime/30 bg-lime/[0.06] px-2.5 py-1.5 text-sm text-ink">
                  <AchievementIcon icon={a.icon} size={14} className="text-lime" /> {a.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share */}
        <div className="p-4 sm:p-5">
          <label className="mb-3 flex cursor-pointer items-center gap-2.5 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={includeName}
              onChange={(e) => setIncludeName(e.target.checked)}
              className="h-4 w-4 accent-[#B7FF35]"
            />
            Include the player&apos;s name in my shared result (spoiler)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="primary" onClick={doShare} icon={<Share2 size={16} />}>
              Share result
            </Button>
            <Button onClick={doCopy} icon={<Copy size={16} />}>
              Copy
            </Button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {onPlayAgain ? (
              <Button onClick={onPlayAgain} icon={<RotateCcw size={16} />}>
                Next case
              </Button>
            ) : (
              <Button onClick={onPractice} icon={<RotateCcw size={16} />}>
                Practice mode
              </Button>
            )}
            <Button variant="ghost" onClick={onHome} icon={<Home size={16} />}>
              Headquarters
            </Button>
          </div>
          {round.mode === 'daily' && (
            <div className="mt-4 flex items-center justify-center gap-2 font-mono text-xs text-ink-muted">
              <Timer size={13} /> Next daily case in <span className="text-ink">{formatCountdown(ms)}</span>
            </div>
          )}
        </div>
      </div>

      <details className="card mt-4 p-4 sm:p-5">
        <summary className="cursor-pointer select-none font-semibold text-ink">Full case file ({clues.length} clues)</summary>
        <div className="mt-3">
          <ClueList clues={clues} revealed={clues.length} mode={round.mode} showAll />
        </div>
      </details>
    </motion.section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-pitch-700 p-4 text-center first:border-l-0">
      <div className="label">{label}</div>
      <div className="mt-1 font-mono text-2xl font-bold text-ink">{value}</div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'bad' }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className={tone === 'ok' ? 'text-ok' : tone === 'bad' ? 'text-bad' : 'text-ink'}>{value}</span>
    </div>
  );
}
