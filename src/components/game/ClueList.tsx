import { AnimatePresence, motion } from 'framer-motion';
import {
  Award, Building2, CalendarClock, Flag, Footprints, Globe2, Lock, Milestone, Shirt, ArrowRightLeft, Trophy, Users,
  BarChart3, type LucideIcon,
} from 'lucide-react';
import type { Clue, ClueCategory, GameMode } from '@/types';

const CATEGORY: Record<ClueCategory, { label: string; icon: LucideIcon }> = {
  nationality: { label: 'Nationality', icon: Flag },
  position: { label: 'Profile', icon: Footprints },
  clubs: { label: 'Career clubs', icon: Building2 },
  league: { label: 'League history', icon: Globe2 },
  international: { label: 'International', icon: Trophy },
  awards: { label: 'Individual award', icon: Award },
  teammates: { label: 'Connections', icon: Users },
  shirt: { label: 'Shirt number', icon: Shirt },
  transfer: { label: 'Transfer', icon: ArrowRightLeft },
  milestone: { label: 'Career milestone', icon: Milestone },
  record: { label: 'Record', icon: BarChart3 },
};

interface Props {
  clues: Clue[];
  revealed: number;
  mode: GameMode;
  showAll?: boolean;
}

export function ClueList({ clues, revealed, mode, showAll = false }: Props) {
  if (mode === 'career') return <CareerTimeline clues={clues} revealed={showAll ? clues.length : revealed} />;
  const visible = showAll ? clues.length : revealed;
  return (
    <ol className="space-y-2">
      <AnimatePresence initial={false}>
        {clues.map((clue, i) => {
          const open = i < visible;
          const meta = CATEGORY[clue.category];
          const Icon = meta.icon;
          return (
            <motion.li
              key={clue.id + (open ? '-open' : '-locked')}
              layout
              initial={open ? { opacity: 0, y: 10, rotateX: -25 } : { opacity: 0 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={
                open
                  ? `flex gap-3 rounded-xl border p-3 ${i === visible - 1 && !showAll ? 'border-lime/30 bg-lime/[0.04]' : 'border-pitch-700 bg-pitch-900'}`
                  : 'flex items-center gap-3 rounded-xl border border-dashed border-pitch-700 bg-pitch-900/40 px-3 py-1.5'
              }
            >
              <div
                className={`grid shrink-0 place-items-center rounded-lg ${open ? 'h-8 w-8 bg-pitch-800 text-lime' : 'h-6 w-8 text-ink-faint'}`}
              >
                {open ? <Icon size={15} /> : <Lock size={13} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-ink-faint">#{String(i + 1).padStart(2, '0')}</span>
                  <span className="label">{open ? meta.label : 'Classified'}</span>
                </div>
                {open ? (
                  <p className="mt-0.5 text-[14px] leading-snug text-ink">{clue.text}</p>
                ) : null}
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ol>
  );
}

function CareerTimeline({ clues, revealed }: { clues: Clue[]; revealed: number }) {
  return (
    <ol className="relative space-y-2 pl-5">
      <div className="absolute bottom-3 left-[7px] top-3 w-px bg-pitch-700" />
      {clues.map((clue, i) => {
        const open = i < revealed;
        const isNat = clue.category === 'nationality';
        return (
          <motion.li
            key={clue.id + (open ? '-o' : '-l')}
            initial={open ? { opacity: 0, x: -8 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="relative"
          >
            <span
              className={`absolute -left-5 top-3.5 h-3.5 w-3.5 rounded-full border-2 ${open ? 'border-lime bg-pitch-950' : 'border-pitch-700 bg-pitch-900'}`}
            />
            <div
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${open ? (i === revealed - 1 ? 'border-lime/30 bg-lime/[0.04]' : 'border-pitch-700 bg-pitch-900') : 'border-dashed border-pitch-700 bg-pitch-900/40'}`}
            >
              <span className="font-mono text-[10px] text-ink-faint">{isNat ? 'ID' : `STOP ${String(i + 1).padStart(2, '0')}`}</span>
              {open ? (
                <span className="font-semibold text-ink">{clue.text}</span>
              ) : (
                <span className="flex items-center gap-2 text-sm text-ink-faint">
                  <Lock size={12} /> {isNat ? 'Nationality' : 'Next club'}
                </span>
              )}
              {open && i === 0 && !isNat && <CalendarClock size={14} className="ml-auto text-ink-faint" aria-label="Earliest club" />}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
