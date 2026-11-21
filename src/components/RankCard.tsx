import { RANKS, rankFor } from '@/game/progression';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function RankCard({ xp }: { xp: number; compact?: boolean }) {
  const r = rankFor(xp);
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-ink-muted">Your rank</p>
          <div className="heading mt-0.5 text-[24px] leading-tight">{r.current.name}</div>
        </div>
        <div className="rounded-full border border-lime/30 bg-lime/10 px-3 py-1 text-[12.5px] font-semibold tabular-nums text-lime">
          Level {r.index + 1}
        </div>
      </div>
      <ProgressBar value={r.progress} className="mt-5" />
      <div className="mt-2.5 flex justify-between text-[12.5px] tabular-nums text-ink-muted">
        <span>
          <span className="font-semibold text-ink">{xp.toLocaleString()}</span> XP
        </span>
        <span>{r.next ? `${r.toNext.toLocaleString()} XP to ${r.next.name}` : 'Top rank reached'}</span>
      </div>
      <div className="mt-4 flex gap-1" aria-hidden>
        {RANKS.map((rank, i) => (
          <div key={rank.name} className={`h-1 flex-1 rounded-full ${i <= r.index ? 'bg-lime/80' : 'bg-white/[0.08]'}`} title={rank.name} />
        ))}
      </div>
    </div>
  );
}
