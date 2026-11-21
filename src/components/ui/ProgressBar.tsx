import { motion } from 'framer-motion';

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div
      className={`h-2.5 overflow-hidden rounded-full bg-white/[0.08] shadow-[inset_0_1px_2px_rgb(0_0_0/0.4)] ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full bg-[linear-gradient(90deg,#2fc785,#7ff0bf)] shadow-[0_0_12px_rgb(75_227_160/0.6),inset_0_1px_0_rgb(255_255_255/0.5)]"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(3, value * 100)}%` }}
        transition={{ type: 'spring', stiffness: 90, damping: 20, delay: 0.2 }}
      />
    </div>
  );
}
