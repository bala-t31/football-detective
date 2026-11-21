import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Check } from 'lucide-react';
import type { FeedbackCell, FeedbackStatus, GuessFeedback } from '@/types';
import { getPlayer } from '@/data';
import { nationInfo } from '@/data/nations';
import { POSITION_LABEL, POSITION_SHORT } from '@/data/positions';
import type { PositionCode } from '@/types';

const STATUS_STYLE: Record<FeedbackStatus, string> = {
  correct: 'bg-ok/15 border-ok/50 text-ok',
  partial: 'bg-warn/10 border-warn/45 text-warn',
  wrong: 'bg-pitch-900 border-pitch-700 text-ink-muted',
};

const HEADERS: { full: string; short: string }[] = [
  { full: 'Nation', short: 'Nat' },
  { full: 'Position', short: 'Pos' },
  { full: 'Club', short: 'Club' },
  { full: 'League', short: 'League' },
  { full: 'Era', short: 'Era' },
];

const LABEL_TO_CODE = Object.fromEntries(Object.entries(POSITION_LABEL).map(([code, label]) => [label, code])) as Record<
  string,
  PositionCode
>;

/** Desktop shows full values; phones get compact ones so five cells fit a 360px screen. */
function cellText(cell: FeedbackCell): { full: string; compact: string } {
  switch (cell.key) {
    case 'nationality': {
      const code = nationInfo(cell.value).code;
      return { full: code, compact: code };
    }
    case 'position': {
      const code = LABEL_TO_CODE[cell.value];
      return { full: cell.value, compact: code ? POSITION_SHORT[code] : cell.value };
    }
    case 'era':
      // "2000s–20s" → "00s–20s" on phones
      return { full: cell.value, compact: cell.value.replace(/^\d{2}(\d{2}s)/, '$1') };
    default:
      return { full: cell.value, compact: cell.value };
  }
}

export function FeedbackGrid({ feedback, maxAttempts }: { feedback: GuessFeedback[]; maxAttempts: number }) {
  const empty = Math.max(0, maxAttempts - feedback.length);
  return (
    <div>
      {feedback.length > 0 && (
        <div className="mb-1.5 grid grid-cols-5 gap-1 sm:grid-cols-[minmax(0,1.7fr)_repeat(5,minmax(0,1fr))] sm:gap-1.5 sm:px-1">
          <span className="label hidden sm:block">Suspect</span>
          {HEADERS.map((h) => (
            <span key={h.full} className="label text-center !text-[9px] sm:!text-[10px]">
              <span className="sm:hidden">{h.short}</span>
              <span className="hidden sm:inline">{h.full}</span>
            </span>
          ))}
        </div>
      )}
      <div className="space-y-1.5 sm:space-y-2">
        {feedback.map((f, rowIdx) => (
          <GuessRow key={f.playerId} feedback={f} index={rowIdx} />
        ))}
        {empty > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5 sm:block sm:space-y-2">
            {Array.from({ length: empty }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex h-9 flex-1 items-center justify-center rounded-lg border border-dashed border-pitch-700/70 font-mono text-[10px] text-ink-faint sm:h-14 sm:justify-start sm:rounded-xl sm:px-3 sm:text-[11px]"
                aria-label={`Attempt ${feedback.length + i + 1} unused`}
              >
                <span className="sm:hidden">{String(feedback.length + i + 1).padStart(2, '0')}</span>
                <span className="hidden sm:inline">ATTEMPT {String(feedback.length + i + 1).padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        )}
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
      className={`rounded-xl border p-1.5 sm:grid sm:grid-cols-[minmax(0,1.7fr)_repeat(5,minmax(0,1fr))] sm:items-stretch sm:gap-1.5 ${
        feedback.correct ? 'border-ok/50 bg-ok/[0.06]' : 'border-pitch-700 bg-pitch-850'
      }`}
    >
      <div className="mb-1.5 flex min-w-0 items-center gap-2 px-1 sm:mb-0">
        <span className="font-mono text-[10px] text-ink-faint">{String(index + 1).padStart(2, '0')}</span>
        <span className="text-base leading-none">{nationInfo(player.nationality).flag}</span>
        <span className="line-clamp-2 text-sm font-bold leading-tight text-ink">{player.name}</span>
        {feedback.correct && <Check size={16} className="ml-auto shrink-0 text-ok sm:ml-0" />}
      </div>
      <div className="grid grid-cols-5 gap-1 sm:contents">
        {feedback.cells.map((cell, i) => {
          const text = cellText(cell);
          return (
            <motion.div
              key={cell.key}
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ delay: i * 0.09, duration: 0.35, ease: 'easeOut' }}
              style={{ transformPerspective: 600 }}
              className={`flex min-h-[46px] min-w-0 flex-col items-center justify-center rounded-lg border px-0.5 py-1 text-center sm:min-h-[52px] sm:px-1 ${STATUS_STYLE[cell.status]}`}
              title={`${cell.label}: ${cell.value}${cell.shared ? ' (shared)' : ''}`}
              aria-label={`${cell.label}: ${cell.value}, ${cell.status}${cell.direction ? `, mystery player is ${cell.direction}` : ''}`}
            >
              <span className="flex max-w-full items-center justify-center gap-0.5 text-[10px] font-semibold leading-[1.15] sm:text-xs">
                <span className="line-clamp-3 hyphens-auto [overflow-wrap:break-word] sm:line-clamp-2">
                  <span className="sm:hidden">{text.compact}</span>
                  <span className="hidden sm:inline">{text.full}</span>
                </span>
                {cell.direction === 'earlier' && <ArrowDown size={10} className="shrink-0" aria-hidden />}
                {cell.direction === 'later' && <ArrowUp size={10} className="shrink-0" aria-hidden />}
              </span>
              {cell.shared && <span className="mt-0.5 font-mono text-[7.5px] uppercase tracking-wider opacity-70 sm:text-[8.5px]">shared</span>}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function Legend() {
  return (
    <div className="mt-3 space-y-1 px-1 text-[11px] leading-snug text-ink-muted">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-sm bg-ok" /> Match
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-sm bg-warn" /> Close
        </span>
        <span className="flex items-center gap-1">
          <ArrowUp size={11} />
          <ArrowDown size={11} /> Mystery player is later / earlier
        </span>
      </div>
      <p className="text-ink-faint">
        Close = same region, position group, overlapping era, or a club/league they share (marked “shared”).
      </p>
    </div>
  );
}
