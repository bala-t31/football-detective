import { motion, AnimatePresence } from 'framer-motion';
import type { Player } from '@/types';
import { nationInfo } from '@/data/nations';
import { POSITION_SHORT } from '@/data/positions';

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Silhouette() {
  return (
    <svg viewBox="0 0 120 140" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="sil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2b332c" />
          <stop offset="100%" stopColor="#171c18" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="44" r="22" fill="url(#sil)" />
      <path d="M14 140c2-34 20-52 46-52s44 18 46 52z" fill="url(#sil)" />
      <path d="M44 92l16 14 16-14" stroke="#0b0d0c" strokeWidth="3" fill="none" opacity="0.6" />
    </svg>
  );
}

interface Props {
  player?: Player;
  revealed: boolean;
  size?: 'md' | 'lg';
  scanning?: boolean;
}

/** The mystery "dossier photo". Shows a silhouette until revealed, then a monogram card. */
export function PlayerAvatar({ player, revealed, size = 'md', scanning = false }: Props) {
  const dims = size === 'lg' ? 'h-40 w-32 sm:h-48 sm:w-40' : 'h-28 w-24';
  const shirt = player?.shirtNumbers[player.shirtNumbers.length - 1];
  return (
    <div className={`relative ${dims} shrink-0 overflow-hidden rounded-2xl border border-pitch-700 bg-pitch-900`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#b7ff3514,transparent_65%)]" />
      <AnimatePresence mode="wait" initial={false}>
        {revealed && player ? (
          <motion.div
            key="revealed"
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.85, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute right-2 top-2 text-lg leading-none">{nationInfo(player.nationality).flag}</div>
            {shirt !== undefined && (
              <div className="absolute left-2.5 top-2 font-mono text-[11px] font-bold text-lime/80">#{shirt}</div>
            )}
            <div className={`${size === 'lg' ? 'text-5xl' : 'text-3xl'} font-black tracking-tighter text-ink`}>
              {initials(player.name)}
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
              {POSITION_SHORT[player.position]}
            </div>
          </motion.div>
        ) : (
          <motion.div key="mystery" className="absolute inset-0 pt-4" exit={{ opacity: 0 }}>
            <Silhouette />
            <div className="absolute inset-0 grid place-items-center pb-6">
              <span className="font-black text-4xl text-lime/80 drop-shadow-[0_0_12px_#b7ff3566]">?</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {scanning && !revealed && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 h-1/3 animate-scan bg-gradient-to-b from-transparent via-lime/10 to-transparent" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
    </div>
  );
}
