import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { play } from '@/utils/sound';
import { haptic } from '@/utils/haptics';
import { AchievementIcon } from './AchievementIcon';

type Tone = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 1;
const ISLAND = 'bg-black/85 text-white shadow-[0_18px_40px_-12px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-2xl';

/**
 * Notifications appear as a single "island" pill that drops from the top and morphs between
 * messages, instead of a stack of cards.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ToastItem | null>(null);
  const push = useCallback((message: string, tone: Tone = 'info') => {
    const id = nextId++;
    setCurrent({ id, message, tone });
    window.setTimeout(() => setCurrent((c) => (c?.id === id ? null : c)), 2400);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+10px)] z-[60] flex justify-center px-4" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {current && (
            <motion.div
              key={current.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.6 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.7, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 520, damping: 32 }}
              className={`pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full py-2.5 pl-3 pr-5 text-[14px] font-medium ${ISLAND}`}
            >
              {current.tone === 'success' && <CheckCircle2 size={18} className="shrink-0 text-ok" />}
              {current.tone === 'error' && <AlertCircle size={18} className="shrink-0 text-bad" />}
              {current.tone === 'info' && <Info size={18} className="shrink-0 text-white/60" />}
              <span>{current.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AchievementToasts />
    </ToastContext.Provider>
  );
}

function AchievementToasts() {
  const { achievementQueue, dismissAchievement } = useProfile();
  const current = achievementQueue[0];

  useEffect(() => {
    if (!current) return;
    play('unlock');
    void haptic('success');
    const t = window.setTimeout(dismissAchievement, 3400);
    return () => window.clearTimeout(t);
  }, [current, dismissAchievement]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+10px)] z-[61] flex justify-center px-4" aria-live="polite">
      <AnimatePresence mode="wait">
        {current && (
          <motion.button
            key={current.id}
            onClick={dismissAchievement}
            initial={{ opacity: 0, y: -30, scale: 0.5, borderRadius: 999 }}
            animate={{ opacity: 1, y: 0, scale: 1, borderRadius: 28 }}
            exit={{ opacity: 0, y: -20, scale: 0.7, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className={`pointer-events-auto flex w-full max-w-[360px] items-center gap-3 py-3 pl-3 pr-5 text-left ${ISLAND}`}
          >
            <motion.div
              initial={{ rotate: -20, scale: 0.6 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.1 }}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(180deg,#f8dc8a,#e0ac35)] text-[#3a2600] shadow-[inset_0_1px_0_rgb(255_255_255/0.6)]"
            >
              <AchievementIcon icon={current.icon} size={20} />
            </motion.div>
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-warn">Achievement unlocked</div>
              <div className="font-display text-[16px] font-bold tracking-[-0.02em]">{current.title}</div>
              <div className="truncate text-[12.5px] text-white/60">{current.description}</div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
