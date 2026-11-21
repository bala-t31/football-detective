export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="14" fill="#171C18" stroke="#272D28" />
      <circle cx="28" cy="28" r="13" fill="none" stroke="#B7FF35" strokeWidth="4.5" />
      <path d="M37.5 37.5L49 49" stroke="#B7FF35" strokeWidth="6" strokeLinecap="round" />
      <path d="M28 20.5l5.6 4.1-2.1 6.6h-7l-2.1-6.6z" fill="#B7FF35" />
    </svg>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      <div className="leading-none">
        <div className="text-[15px] font-black tracking-[-0.04em] text-ink">
          FOOTBALL <span className="text-lime">DETECTIVE</span>
        </div>
        <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.25em] text-ink-faint">Case files · est. 2026</div>
      </div>
    </div>
  );
}
