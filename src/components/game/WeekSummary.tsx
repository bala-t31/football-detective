import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import { getPlayer } from '@/data';
import { LEGENDS_PER_WEEK, daysUntilNextWeek, weekNumber, type LegendResult } from '@/game/weekly';
import { ShareImageButton } from './ShareImageButton';

export function WeekSummary({ weekKey, results }: { weekKey: string; results: LegendResult[] }) {
  const total = results.reduce((s, r) => s + r.score, 0);
  const solved = results.filter((r) => r.won).length;
  const complete = results.length >= LEGENDS_PER_WEEK;
  const days = daysUntilNextWeek();
  return (
    <div className="mt-2 rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4 text-left">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-[17px] font-bold tracking-[-0.02em]">Week {weekNumber(weekKey)}</h3>
        <span className="text-[13px] tabular-nums text-ink-muted">
          {solved}/{LEGENDS_PER_WEEK} solved · {total} XP
        </span>
      </div>
      <ol className="mt-3 space-y-1.5">
        {Array.from({ length: LEGENDS_PER_WEEK }).map((_, i) => {
          const r = results[i];
          const p = r ? getPlayer(r.playerId) : null;
          return (
            <li key={i} className="flex items-center gap-2.5 text-[14px]">
              {r ? r.won ? <CheckCircle2 size={17} className="text-ok" /> : <XCircle size={17} className="text-bad" /> : <Circle size={17} className="text-ink-faint" />}
              <span className={r ? 'text-ink' : 'text-ink-faint'}>{p ? p.name : `Legend ${i + 1}`}</span>
              {r && <span className="ml-auto tabular-nums text-ink-muted">{r.score} XP</span>}
            </li>
          );
        })}
      </ol>
      {complete && (
        <>
          <p className="mt-3 text-[13px] text-ink-muted">
            Week complete. New legends in {days} day{days === 1 ? '' : 's'}.
          </p>
          <ShareImageButton
            className="mt-3 w-full"
            data={() => ({
              eyebrow: `Weekly Legends · Week ${weekNumber(weekKey)}`,
              headline: `${solved} of ${LEGENDS_PER_WEEK} legends solved`,
              won: solved > 0,
              score: total,
              detail: `${results.reduce((s, r) => s + r.guesses, 0)} guesses across the week`,
              tiles: results.map((r) => (r.won ? 'hit' : 'miss')),
              cta: 'Can you name all five?',
            })}
          />
        </>
      )}
    </div>
  );
}
