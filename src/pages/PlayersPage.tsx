import { useMemo, useState } from 'react';
import { Check, Lock, Search } from 'lucide-react';
import type { Difficulty, PositionGroup } from '@/types';
import { PLAYERS } from '@/data';
import { nationInfo } from '@/data/nations';
import { GROUP_LABEL, POSITION_GROUP, POSITION_LABEL } from '@/data/positions';
import { normalize } from '@/game/search';
import { useProfile } from '@/hooks/useProfile';

const LEVEL_SHORT: Record<Difficulty, string> = { easy: 'Casual', medium: 'Ball Knower', hard: 'Elite' };

type DiscFilter = 'all' | 'found' | 'unknown';

const DIFF_STYLE: Record<Difficulty, string> = {
  easy: 'text-ok border-ok/25 bg-ok/10',
  medium: 'text-warn border-warn/25 bg-warn/10',
  hard: 'text-bad border-bad/25 bg-bad/10',
};

export function PlayersPage() {
  const { profile } = useProfile();
  const [q, setQ] = useState('');
  const [group, setGroup] = useState<PositionGroup | 'all'>('all');
  const [diff, setDiff] = useState<Difficulty | 'all'>('all');
  const [disc, setDisc] = useState<DiscFilter>('all');
  const found = Object.keys(profile.discovered).length;

  const list = useMemo(() => {
    const nq = normalize(q);
    return PLAYERS.filter((p) => {
      if (group !== 'all' && POSITION_GROUP[p.position] !== group) return false;
      if (diff !== 'all' && p.difficulty !== diff) return false;
      const isFound = Boolean(profile.discovered[p.id]);
      if (disc === 'found' && !isFound) return false;
      if (disc === 'unknown' && isFound) return false;
      if (nq && !normalize(`${p.name} ${p.aka.join(' ')} ${p.nationality}`).includes(nq)) return false;
      return true;
    });
  }, [q, group, diff, disc, profile.discovered]);

  return (
    <div className="space-y-5">
      <header className="px-1 pt-1">
        <p className="text-[14px] font-medium text-ink-muted">
          {found} of {PLAYERS.length} identified
        </p>
        <h1 className="heading mt-0.5 text-[40px] leading-none sm:text-[48px]">Players</h1>
        <p className="mt-2 text-[14.5px] text-ink-muted">Solve a case to unlock that player&apos;s career.</p>
      </header>

      <div className="space-y-3">
        <div className="flex h-12 items-center rounded-full border border-white/[0.1] bg-black/25 shadow-[inset_0_2px_6px_rgb(0_0_0/0.3)] focus-within:border-white/[0.22]">
          <Search size={17} className="ml-4 text-ink-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or country"
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-[16px] text-ink placeholder:text-ink-faint focus:outline-none"
            aria-label="Search players"
          />
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-thin">
          <Seg value={disc} onChange={setDisc} options={[['all', 'All'], ['found', 'Identified'], ['unknown', 'Unidentified']]} />
          <Seg value={group} onChange={setGroup} options={[['all', 'Any position'], ...(['GK', 'DEF', 'MID', 'FWD'] as const).map((g) => [g, GROUP_LABEL[g]] as [PositionGroup, string])]} />
          <Seg value={diff} onChange={setDiff} options={[['all', 'Any level'], ['easy', 'Casual'], ['medium', 'Ball Knower'], ['hard', 'Elite']]} />
        </div>
      </div>

      <div className="px-1 text-[13px] text-ink-muted">{list.length} players</div>
      {list.length > 0 && (
        <ul className="card divide-y divide-white/[0.06] overflow-hidden p-1.5 sm:grid sm:grid-cols-2 sm:gap-x-2 sm:divide-y-0">
          {list.map((p) => {
            const isFound = Boolean(profile.discovered[p.id]);
            const clubs = p.careerClubs.filter((c, j, arr) => j === 0 || arr[j - 1] !== c);
            return (
              <li key={p.id} className="flex items-start gap-3 rounded-[20px] px-3 py-3 [content-visibility:auto] [contain-intrinsic-size:auto_72px]">
                <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/[0.06] text-[22px]">
                  {nationInfo(p.nationality).flag}
                  {isFound && (
                    <span className="absolute -bottom-0.5 -right-0.5 grid h-[18px] w-[18px] place-items-center rounded-full bg-lime text-[#052016] ring-2 ring-pitch-950">
                      <Check size={11} strokeWidth={3.2} aria-label="Identified" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-[15.5px] font-semibold tracking-[-0.01em] text-ink">{p.name}</h3>
                    <span className={`ml-auto shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${DIFF_STYLE[p.difficulty]}`}>
                      {LEVEL_SHORT[p.difficulty]}
                    </span>
                  </div>
                  <div className="text-[13px] text-ink-muted">
                    {POSITION_LABEL[p.position]}, {p.nationality}
                  </div>
                  {isFound ? (
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink-faint">{clubs.join(' / ')}</p>
                  ) : (
                    <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-faint">
                      <Lock size={11} /> {clubs.length} club{clubs.length === 1 ? '' : 's'} hidden until solved
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {list.length === 0 && <p className="py-10 text-center text-[14.5px] text-ink-muted">No players match. Try clearing a filter.</p>}
    </div>
  );
}

function Seg<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="flex shrink-0 rounded-full border border-white/[0.1] bg-white/[0.06] p-1">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`h-8 whitespace-nowrap rounded-full px-3 text-[13px] font-medium transition-colors ${
            value === v ? 'bg-white/[0.14] text-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.18)]' : 'text-ink-muted hover:text-ink'
          }`}
          aria-pressed={value === v}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
