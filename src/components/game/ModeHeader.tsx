import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

export function ModeHeader({ eyebrow, title, onBack, right }: { eyebrow: string; title: string; onBack: () => void; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3 sm:mb-6">
      <button
        onClick={onBack}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/[0.1] bg-white/[0.07] text-ink transition-colors hover:bg-white/[0.12]"
        aria-label="Back to dashboard"
      >
        <ChevronLeft size={20} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-ink-muted">{eyebrow}</p>
        <h1 className="heading truncate text-[24px] leading-tight">{title}</h1>
      </div>
      {right}
    </div>
  );
}
