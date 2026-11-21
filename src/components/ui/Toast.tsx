import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { play } from '@/utils/sound';
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

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((message: string, tone: Tone = 'info') => {
    const id = nextId++;
    setItems((xs) => [...xs.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 2800);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+12px)] z-[60] flex flex-col items-center gap-2 px-3" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              className="pointer-events-auto flex max-w-md items-center gap-2.5 rounded-xl border border-pitch-700 bg-pitch-850/95 px-4 py-3 text-sm text-ink shadow-2xl backdrop-blur"
            >
              {t.tone === 'success' && <CheckCircle2 size={16} className="shrink-0 text-ok" />}
              {t.tone === 'error' && <AlertCircle size={16} className="shrink-0 text-bad" />}
              {t.tone === 'info' && <Info size={16} className="shrink-0 text-ink-muted" />}
              <span>{t.message}</span>
            </motion.div>
          ))}
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
    const t = window.setTimeout(dismissAchievement, 3600);
    return () => window.clearTimeout(t);
  }, [current, dismissAchievement]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-3 sm:bottom-6" aria-live="polite">
      <AnimatePresence mode="wait">
        {current && (
          <motion.button
            key={current.id}
            onClick={dismissAchievement}
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-lime/40 bg-pitch-850/95 py-3 pl-3 pr-5 text-left shadow-glow backdrop-blur"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-lime text-pitch-950">
              <AchievementIcon icon={current.icon} size={20} />
            </div>
            <div>
              <div className="label !text-lime">Achievement unlocked</div>
              <div className="font-bold text-ink">{current.title}</div>
              <div className="text-xs text-ink-muted">{current.description}</div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
