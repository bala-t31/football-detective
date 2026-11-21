import { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player } from '@/types';
import { nationInfo } from '@/data/nations';

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Silhouette() {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6f5e6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#d6f5e6" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="47" r="19" fill={`url(#s${id})`} />
      <path d="M22 120c2-28 18-44 38-44s36 16 38 44z" fill={`url(#s${id})`} />
    </svg>
  );
}

const SIZES = {
  sm: 'h-[84px] w-[84px]',
  md: 'h-[104px] w-[104px]',
  lg: 'h-[132px] w-[132px] sm:h-[148px] sm:w-[148px]',
} as const;

interface Props {
  player?: Player;
  revealed: boolean;
  size?: keyof typeof SIZES;
  scanning?: boolean;
}

/**
 * The mystery portrait as a glass lens: a frosted silhouette while the case is open, which
 * pulls into focus as the player's monogram once it is solved.
 */
export function PlayerAvatar({ player, revealed, size = 'md', scanning = false }: Props) {
  const shirt = player?.shirtNumbers[player.shirtNumbers.length - 1];
  const big = size === 'lg';
  return (
    <div className={`relative ${SIZES[size]} shrink-0`}>
      {/* floodlight halo */}
      <div className="absolute -inset-3 rounded-full bg-[radial-gradient(closest-side,rgb(75_227_160/0.22),transparent)]" aria-hidden />
      <div className="absolute inset-0 overflow-hidden rounded-full border border-white/20 bg-[radial-gradient(circle_at_35%_25%,rgb(255_255_255/0.18),rgb(255_255_255/0.04)_55%,rgb(0_0_0/0.25))] shadow-[inset_0_2px_0_rgb(255_255_255/0.25),inset_0_-10px_30px_rgb(0_0_0/0.35),0_20px_40px_-18px_rgb(0_0_0/0.9)]">
        <AnimatePresence mode="wait" initial={false}>
          {revealed && player ? (
            <motion.div
              key="revealed"
              className="absolute inset-0 grid place-items-center"
              initial={{ opacity: 0, scale: 1.25, filter: 'blur(14px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-center">
                <div className={`font-display font-extrabold leading-none tracking-[-0.06em] text-ink ${big ? 'text-[46px] sm:text-[52px]' : 'text-[32px]'}`}>
                  {initials(player.name)}
                </div>
                {shirt !== undefined && size !== 'sm' && <div className="mt-1 text-[12px] font-semibold tabular-nums text-lime">No. {shirt}</div>}
              </div>
            </motion.div>
          ) : (
            <motion.div key="mystery" className="absolute inset-0" exit={{ opacity: 0, filter: 'blur(10px)' }}>
              <div className="absolute inset-x-0 bottom-0 top-[12%] blur-[1.5px]">
                <Silhouette />
              </div>
              <div className="absolute inset-0 grid place-items-center">
                <span className={`font-display font-extrabold text-white/90 drop-shadow-[0_0_18px_rgb(75_227_160/0.7)] ${big ? 'text-5xl' : 'text-4xl'}`}>?</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {scanning && !revealed && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute inset-x-0 h-1/2 animate-scan bg-gradient-to-b from-transparent via-lime/25 to-transparent" />
          </div>
        )}
        {/* lens specular */}
        <div className="pointer-events-none absolute left-[14%] top-[8%] h-[28%] w-[46%] -rotate-[25deg] rounded-full bg-gradient-to-b from-white/35 to-transparent" />
      </div>
      {revealed && player && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.45 }}
          className={`absolute grid place-items-center rounded-full border border-white/25 bg-pitch-900/80 shadow-lg backdrop-blur ${big ? '-bottom-0.5 -right-0.5 h-11 w-11 text-[22px]' : 'bottom-0 right-0 h-8 w-8 text-base'}`}
        >
          {nationInfo(player.nationality).flag}
        </motion.div>
      )}
    </div>
  );
}
