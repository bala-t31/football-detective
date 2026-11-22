import { motion } from 'framer-motion';
import {
  Award, Building2, Flag, Footprints, Globe2, Lock, Milestone, Shirt, ArrowRightLeft, Trophy, Users, BarChart3, type LucideIcon,
} from 'lucide-react';
import type { Clue, ClueCategory, GameMode } from '@/types';

const CATEGORY: Record<ClueCategory, { label: string; icon: LucideIcon }> = {
  nationality: { label: 'Nationality', icon: Flag },
  position: { label: 'Profile', icon: Footprints },
  clubs: { label: 'Clubs', icon: Building2 },
  league: { label: 'Leagues', icon: Globe2 },
  international: { label: 'International', icon: Trophy },
  awards: { label: 'Awards', icon: Award },
  teammates: { label: 'Connections', icon: Users },
  shirt: { label: 'Shirt number', icon: Shirt },
  transfer: { label: 'Transfer', icon: ArrowRightLeft },
  milestone: { label: 'Milestone', icon: Milestone },
  record: { label: 'Record', icon: BarChart3 },
};

// Placeholder lines shown blurred behind locked clues (never real content).
const REDACTED = ['Played in a final that is still talked about today', 'Won a major honour with a club in the capital', 'Known for a famous moment against old rivals'];

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
      {clues.map((clue, i) => {
        const open = i < visible;
        const newest = open && i === visible - 1 && !showAll && visible > 1;
        const meta = CATEGORY[clue.category];
        const Icon = meta.icon;
        if (!open) {
          return (
            <li key={clue.id} className="relative flex h-11 items-center gap-3 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3">
              <Lock size={14} className="shrink-0 text-ink-faint" />
              <span className="select-none truncate text-[14px] text-transparent [text-shadow:0_0_7px_rgb(242_251_246/0.55)]" aria-hidden>
                {REDACTED[i % REDACTED.length]}
              </span>
              <span className="sr-only">Locked clue {i + 1}</span>
            </li>
          );
        }
        return (
          <motion.li
            key={clue.id}
            initial={showAll ? false : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className={`flex gap-3 rounded-2xl border p-3 ${
              newest ? 'border-lime/30 bg-lime/[0.07] shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]' : 'border-white/[0.08] bg-white/[0.045]'
            }`}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.08] text-lime shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]">
              <Icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-medium text-ink-muted">
                Clue {i + 1}
                <span className="text-ink-faint"> / {meta.label}</span>
              </div>
              <p className="mt-0.5 text-[15px] leading-snug text-ink">{clue.text}</p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

function CareerTimeline({ clues, revealed }: { clues: Clue[]; revealed: number }) {
  return (
    <ol className="relative space-y-2 pl-6">
      <div className="absolute bottom-4 left-[9px] top-4 w-[2px] rounded-full bg-gradient-to-b from-lime/60 via-white/15 to-white/5" aria-hidden />
      {clues.map((clue, i) => {
        const open = i < revealed;
        const isNat = clue.category === 'nationality';
        return (
          <li key={clue.id} className="relative">
            <span
              className={`absolute -left-6 top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full border-2 ${
                open ? 'border-lime bg-pitch-950 shadow-[0_0_10px_rgb(75_227_160/0.6)]' : 'border-white/20 bg-pitch-900'
              }`}
              aria-hidden
            />
            {open ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 ${
                  i === revealed - 1 ? 'border-lime/30 bg-lime/[0.07]' : 'border-white/[0.08] bg-white/[0.045]'
                }`}
              >
                <span className="w-12 shrink-0 text-[12px] font-medium text-ink-muted">{isNat ? 'Nation' : `Club ${i + 1}`}</span>
                <span className="text-[15px] font-semibold text-ink">{clue.text}</span>
              </motion.div>
            ) : (
              <div className="flex h-11 items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3.5">
                <Lock size={14} className="text-ink-faint" />
                <span className="text-[14px] text-ink-faint">{isNat ? 'Nationality' : 'Next club'}</span>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
