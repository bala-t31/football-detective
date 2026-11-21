import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Check } from 'lucide-react';
import type { FeedbackStatus, GuessFeedback } from '@/types';
import { getPlayer } from '@/data';
import { nationInfo } from '@/data/nations';

const STATUS_STYLE: Record<FeedbackStatus, string> = {
  correct: 'bg-ok/15 border-ok/50 text-ok',
  partial: 'bg-warn/10 border-warn/45 text-warn',
  wrong: 'bg-pitch-900 border-pitch-700 text-ink-muted',
};

const HEADERS = ['Nation', 'Position', 'Club', 'League', 'Era'];

export function FeedbackGrid({ feedback, maxAttempts }: { feedback: GuessFeedback[]; maxAttempts: number }) {
  const empty = Math.max(0, maxAttempts - feedback.length);
  return (
    <div>
      <div className="mb-2 hidden grid-cols-[minmax(0,1.7fr)_repeat(5,minmax(0,1fr))] gap-1.5 px-1 sm:grid">
        <span className="label">Suspect</span>
        {HEADERS.map((h) => (
          <span key={h} className="label text-center">
            {h}
          </span>
        ))}
      </div>
      <div className="space-y-2">
        {feedback.map((f, rowIdx) => (
          <GuessRow key={f.playerId} feedback={f} index={rowIdx} />
        ))}
        {Array.from({ length: empty }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex h-12 items-center rounded-xl border border-dashed border-pitch-700/70 px-3 font-mono text-[11px] text-ink-faint sm:h-14"
          >
            ATTEMPT {String(feedback.length + i + 1).padStart(2, '0')}
          </div>
        ))}
      </div>
      <Legend />
    </div>
  );
}

function GuessRow({ feedback, index }: { feedback: GuessFeedback; index: number }) {
  const player = getPlayer(feedback.playerId);
  if (!player) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-2 sm:grid sm:grid-cols-[minmax(0,1.7fr)_repeat(5,minmax(0,1fr))] sm:items-stretch sm:gap-1.5 sm:p-1.5 ${
        feedback.correct ? 'border-ok/50 bg-ok/[0.06]' : 'border-pitch-700 bg-pitch-850'
      }`}
    >
      <div className="mb-2 flex items-center gap-2 px-1 sm:mb-0">
        <span className="font-mono text-[10px] text-ink-faint">{String(index + 1).padStart(2, '0')}</span>
        <span className="text-base">{nationInfo(player.nationality).flag}</span>
        <span className="line-clamp-2 text-sm font-bold leading-tight text-ink">{player.name}</span>
        {feedback.correct && <Check size={16} className="ml-auto shrink-0 text-ok sm:ml-0" />}
      </div>
      <div className="grid grid-cols-5 gap-1.5 sm:contents">
        {feedback.cells.map((cell, i) => (
          <motion.div
            key={cell.key}
            initial={{ rotateX: 90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            transition={{ delay: i * 0.09, duration: 0.35, ease: 'easeOut' }}
            style={{ transformPerspective: 600 }}
            className={`flex min-h-[48px] flex-col items-center justify-center rounded-lg border px-1 py-1.5 text-center ${STATUS_STYLE[cell.status]}`}
            title={`${cell.label}: ${cell.value} (${cell.status})`}
          >
            <span className="label !text-[8.5px] !tracking-[0.12em] opacity-70 sm:hidden">{cell.label}</span>
            <span className="flex items-center gap-0.5 text-[11px] font-semibold leading-tight sm:text-xs">
              <span className="line-clamp-2 break-words">{cell.key === 'nationality' ? nationInfo(cell.value).code : cell.value}</span>
              {cell.direction === 'earlier' && <ArrowDown size={11} className="shrink-0" aria-label="Mystery player is earlier" />}
              {cell.direction === 'later' && <ArrowUp size={11} className="shrink-0" aria-label="Mystery player is later" />}
            </span>
            {cell.shared && <span className="mt-0.5 font-mono text-[8.5px] uppercase tracking-wider opacity-70">shared</span>}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 text-[11px] text-ink-muted">
      <span className="flex items-center gap-1.5">
        <i className="h-2.5 w-2.5 rounded-sm bg-ok" /> Match
      </span>
      <span className="flex items-center gap-1.5">
        <i className="h-2.5 w-2.5 rounded-sm bg-warn" /> Close — same confederation or position group, a shared club/league (shown), or overlapping era
      </span>
      <span className="flex items-center gap-1.5">
        <ArrowUp size={11} /> <ArrowDown size={11} /> Mystery player's era is later / earlier · club & league show the most recent unless shared
      </span>
    </div>
  );
}
