import { ChevronsUp } from 'lucide-react';
import { RANKS, rankFor } from '@/game/progression';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function RankCard({ xp, compact = false }: { xp: number; compact?: boolean }) {
  const r = rankFor(xp);
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="label">Detective rank</div>
          <div className="heading mt-1 text-xl">{r.current.name}</div>
        </div>
        <div className="rounded-lg border border-lime/25 bg-lime/[0.06] px-2.5 py-1 font-mono text-xs font-bold text-lime">
          LV {r.index + 1}
        </div>
      </div>
      <ProgressBar value={r.progress} className="mt-4" />
      <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-muted">
        <span>{xp.toLocaleString()} XP</span>
        <span>{r.next ? `${r.toNext.toLocaleString()} XP to ${r.next.name}` : 'Max rank reached'}</span>
      </div>
      {!compact && (
        <div className="mt-4 grid grid-cols-6 gap-1">
          {RANKS.map((rank, i) => (
            <div key={rank.name} className="text-center" title={`${rank.name} — ${rank.minXp.toLocaleString()} XP`}>
              <div className={`h-1 rounded-full ${i <= r.index ? 'bg-lime' : 'bg-pitch-700'}`} />
              <div className={`mt-1.5 font-mono text-[9px] ${i === r.index ? 'text-lime' : 'text-ink-faint'}`}>
                {i === r.index ? <ChevronsUp size={10} className="mx-auto" /> : i + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
