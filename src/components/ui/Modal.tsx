import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md';
}

/** A frosted sheet: slides up from the bottom on phones, floats centred on larger screens. */
export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useDragControls();

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true }), 50);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
      document.body.style.overflow = overflow;
      prevFocus?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
        >
          <div className="absolute inset-0 bg-black/65" onClick={onClose} aria-hidden />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`glass-strong relative flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[32px] ${size === 'sm' ? 'sm:max-w-sm' : 'sm:max-w-lg'} sm:rounded-[32px]`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%', transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            drag="y"
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose();
            }}
          >
            {/* Grab handle + header: drag down to dismiss (content below scrolls normally) */}
            <div className="touch-none" onPointerDown={(e) => drag.start(e)}>
              <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden>
                <span className="h-1.5 w-10 rounded-full bg-white/25" />
              </div>
              <div className="flex items-center justify-between px-5 pb-2 pt-3 sm:pt-5">
              <h2 className="heading text-[22px]">{title}</h2>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.08] text-ink-muted hover:text-ink"
                aria-label="Close"
              >
                <X size={17} />
              </button>
              </div>
            </div>
            <div className="overflow-y-auto overscroll-contain px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-2 scrollbar-thin">{children}</div>
            {footer && <div className="flex justify-end gap-2 border-t border-white/[0.08] px-5 py-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
