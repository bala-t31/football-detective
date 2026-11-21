import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Check } from 'lucide-react';
import type { FeedbackCell, FeedbackStatus, GuessFeedback } from '@/types';
import { getPlayer } from '@/data';
import { nationInfo } from '@/data/nations';
import { shortClub, shortLeague } from '@/data/clubs';
import { POSITION_LABEL, POSITION_SHORT } from '@/data/positions';
import type { PositionCode } from '@/types';

const STATUS_STYLE: Record<FeedbackStatus, string> = {
  correct:
    'border-ok/45 text-[#c9ffe6] bg-[linear-gradient(180deg,rgb(75_227_160/0.32),rgb(75_227_160/0.14))] shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_6px_16px_-8px_rgb(75_227_160/0.6)]',
  partial:
    'border-warn/45 text-[#ffeab5] bg-[linear-gradient(180deg,rgb(244_201_93/0.28),rgb(244_201_93/0.1))] shadow-[inset_0_1px_0_rgb(255_255_255/0.22)]',
  wrong: 'border-white/[0.08] text-ink-muted bg-white/[0.04] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]',
};

/** Phones: nation/position are 2–3 letter codes, so club and league get the room. */
const MOBILE_COLS = 'grid-cols-[minmax(0,0.72fr)_minmax(0,0.72fr)_minmax(0,1.38fr)_minmax(0,1.32fr)_minmax(0,0.92fr)]';

/** Step the size down for a long single word so it fits without breaking mid-word. */
function compactSize(text: string): string {
  const longest = Math.max(...text.split(/\s+/).map((w) => w.length));
  return longest >= 12 ? 'text-[8.5px]' : longest >= 10 ? 'text-[9.5px]' : 'text-[10px]';
}

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
    case 'club':
      return { full: cell.value, compact: shortClub(cell.value) };
    case 'league':
      return { full: cell.value, compact: shortLeague(cell.value) };
    default:
      return { full: cell.value, compact: cell.value };
  }
}

export function FeedbackGrid({ feedback, maxAttempts }: { feedback: GuessFeedback[]; maxAttempts: number }) {
  const empty = Math.max(0, maxAttempts - feedback.length);
  return (
    <div>
      {feedback.length > 0 && (
        <div className={`mb-1.5 grid ${MOBILE_COLS} gap-1 sm:grid-cols-[minmax(0,1.7fr)_repeat(5,minmax(0,1fr))] sm:gap-1.5 sm:px-1`}>
          <span className="label hidden sm:block">Suspect</span>
          {HEADERS.map((h) => (
            <span key={h.full} className="text-center text-[11px] font-medium text-ink-faint sm:text-[12px]">
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
                className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-white/[0.06] bg-white/[0.02] text-[12px] tabular-nums text-ink-faint sm:h-14 sm:justify-start sm:rounded-[20px] sm:px-4"
                aria-label={`Attempt ${feedback.length + i + 1} unused`}
              >
                <span className="sm:hidden">{feedback.length + i + 1}</span>
                <span className="hidden sm:inline">Guess {feedback.length + i + 1}</span>
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
      className={`rounded-[20px] border p-1.5 sm:grid sm:grid-cols-[minmax(0,1.7fr)_repeat(5,minmax(0,1fr))] sm:items-stretch sm:gap-1.5 ${
        feedback.correct ? 'border-ok/40 bg-ok/[0.08]' : 'border-white/[0.07] bg-white/[0.035]'
      }`}
    >
      <div className="mb-1.5 flex min-w-0 items-center gap-2 px-1 sm:mb-0">
        <span className="w-3 text-[11px] font-semibold tabular-nums text-ink-faint">{index + 1}</span>
        <span className="text-base leading-none">{nationInfo(player.nationality).flag}</span>
        <span className="line-clamp-2 text-[14.5px] font-semibold leading-tight tracking-[-0.01em] text-ink">{player.name}</span>
        {feedback.correct && <Check size={16} className="ml-auto shrink-0 text-ok sm:ml-0" />}
      </div>
      <div className={`grid ${MOBILE_COLS} gap-1 sm:contents`}>
        {feedback.cells.map((cell, i) => {
          const text = cellText(cell);
          return (
            <motion.div
              key={cell.key}
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ delay: i * 0.09, duration: 0.35, ease: 'easeOut' }}
              style={{ transformPerspective: 600 }}
              className={`flex min-h-[48px] min-w-0 flex-col items-center justify-center rounded-[14px] border px-0.5 py-1 text-center sm:min-h-[52px] sm:px-1 ${STATUS_STYLE[cell.status]}`}
              title={`${cell.label}: ${cell.value}${cell.shared ? ' (shared)' : ''}`}
              aria-label={`${cell.label}: ${cell.value}, ${cell.status}${cell.direction ? `, mystery player is ${cell.direction}` : ''}`}
            >
              <span className="flex max-w-full items-center justify-center gap-0.5 overflow-hidden font-semibold leading-[1.15] sm:text-xs">
                <span className="line-clamp-3 [overflow-wrap:anywhere] sm:line-clamp-2 sm:[overflow-wrap:normal]">
                  <span className={`sm:hidden ${compactSize(text.compact)}`}>{text.compact}</span>
                  <span className="hidden sm:inline">{text.full}</span>
                </span>
                {cell.direction === 'earlier' && <ArrowDown size={10} className="shrink-0" aria-hidden />}
                {cell.direction === 'later' && <ArrowUp size={10} className="shrink-0" aria-hidden />}
              </span>
              {cell.shared && <span className="mt-0.5 text-[9px] font-medium opacity-75 sm:text-[10px]">shared</span>}
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
          <i className="h-2.5 w-2.5 rounded-full bg-ok" /> Match
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-warn" /> Close
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
