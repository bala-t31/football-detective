import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, Search } from 'lucide-react';
import type { Difficulty, PositionGroup } from '@/types';
import { PLAYERS } from '@/data';
import { nationInfo } from '@/data/nations';
import { GROUP_LABEL, POSITION_GROUP, POSITION_LABEL } from '@/data/positions';
import { normalize } from '@/game/search';
import { useProfile } from '@/hooks/useProfile';

type DiscFilter = 'all' | 'found' | 'unknown';

const DIFF_STYLE: Record<Difficulty, string> = {
  easy: 'text-ok border-ok/30',
  medium: 'text-warn border-warn/30',
  hard: 'text-bad border-bad/30',
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label">Case archive</div>
          <h1 className="heading mt-1 text-3xl">Player database</h1>
          <p className="mt-1 text-sm text-ink-muted">Solve a case to unlock that player&apos;s full career file.</p>
        </div>
        <div className="card-inset px-4 py-2.5 text-right">
          <div className="label">Identified</div>
          <div className="font-mono text-xl font-bold text-lime">
            {found}
            <span className="text-ink-faint">/{PLAYERS.length}</span>
          </div>
        </div>
      </div>

      <div className="card space-y-3 p-3 sm:p-4">
        <div className="flex h-12 items-center rounded-xl border border-pitch-700 bg-pitch-900 focus-within:border-pitch-600">
          <Search size={16} className="ml-3.5 text-ink-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or nation"
            className="h-full flex-1 bg-transparent px-3 text-[16px] text-ink placeholder:text-ink-faint focus:outline-none"
            aria-label="Search players"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Seg value={group} onChange={setGroup} options={[['all', 'All'], ...(['GK', 'DEF', 'MID', 'FWD'] as const).map((g) => [g, GROUP_LABEL[g]] as [PositionGroup, string])]} />
          <Seg value={diff} onChange={setDiff} options={[['all', 'Any'], ['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']]} />
          <Seg value={disc} onChange={setDisc} options={[['all', 'All'], ['found', 'Identified'], ['unknown', 'Unidentified']]} />
        </div>
      </div>

      <div className="font-mono text-xs text-ink-muted">{list.length} players</div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p, i) => {
          const isFound = Boolean(profile.discovered[p.id]);
          const clubs = p.careerClubs.filter((c, j, arr) => j === 0 || arr[j - 1] !== c);
          return (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 12) * 0.02 }}
              className={`card p-4 ${isFound ? '' : 'opacity-90'}`}
            >
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-pitch-900 text-xl">{nationInfo(p.nationality).flag}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate font-bold text-ink">{p.name}</h3>
                    {isFound && <CheckCircle2 size={14} className="shrink-0 text-lime" aria-label="Identified" />}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {p.nationality} · {POSITION_LABEL[p.position]}
                  </div>
                </div>
                <span className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] uppercase ${DIFF_STYLE[p.difficulty]}`}>{p.difficulty}</span>
              </div>
              <div className="mt-3 border-t border-pitch-700 pt-3">
                {isFound ? (
                  <p className="text-[13px] leading-relaxed text-ink-muted">{clubs.join(' → ')}</p>
                ) : (
                  <p className="flex items-center gap-2 text-[13px] text-ink-faint">
                    <Lock size={12} /> Career file classified — {clubs.length} club{clubs.length === 1 ? '' : 's'}
                  </p>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>
      {list.length === 0 && <p className="py-10 text-center text-sm text-ink-muted">No players match those filters.</p>}
    </div>
  );
}

function Seg<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="flex rounded-lg border border-pitch-700 bg-pitch-900 p-0.5">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`h-8 rounded-md px-2.5 text-xs font-medium transition-colors ${value === v ? 'bg-pitch-700 text-ink' : 'text-ink-muted hover:text-ink'}`}
          aria-pressed={value === v}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
