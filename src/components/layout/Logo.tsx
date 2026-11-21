import { useId } from 'react';

/**
 * The mark: a football seen through a glass magnifying lens, lit from the top-left like a
 * floodlit pitch. The Android app icon is rendered from this same artwork.
 */
export function LogoMark({ size = 34, plate = true }: { size?: number; plate?: boolean }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <defs>
        <radialGradient id={`bg${id}`} cx="28%" cy="18%" r="95%">
          <stop offset="0" stopColor="#2c7d5a" />
          <stop offset="0.45" stopColor="#0f2c21" />
          <stop offset="1" stopColor="#06100d" />
        </radialGradient>
        <radialGradient id={`lens${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.30" />
          <stop offset="0.55" stopColor="#bff5dc" stopOpacity="0.10" />
          <stop offset="1" stopColor="#4be3a0" stopOpacity="0.16" />
        </radialGradient>
        <linearGradient id={`ring${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#d9f7ea" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id={`handle${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8ff7c9" />
          <stop offset="1" stopColor="#21a56d" />
        </linearGradient>
        <clipPath id={`clip${id}`}>
          <circle cx="44" cy="44" r="23" />
        </clipPath>
      </defs>
      {plate && <rect width="100" height="100" rx="24" fill={`url(#bg${id})`} />}
      <rect x="57" y="64" width="34" height="12" rx="6" transform="rotate(45 57 64)" fill={`url(#handle${id})`} />
      <rect x="60" y="64.5" width="24" height="3" rx="1.5" transform="rotate(45 57 64)" fill="#ffffff" opacity="0.45" />
      <g clipPath={`url(#clip${id})`}>
        <circle cx="44" cy="44" r="23" fill="#0b2219" opacity="0.55" />
        <g stroke="#e9fff5" strokeOpacity="0.85" strokeWidth="1.8" fill="none" strokeLinejoin="round">
          <path d="M44 35.5l8.1 5.9-3.1 9.5h-10l-3.1-9.5z" fill="#e9fff5" fillOpacity="0.9" />
          <path d="M44 35.5V24M52.1 41.4l11-3.6M49 50.9l6.8 9.3M39 50.9l-6.8 9.3M35.9 41.4l-11-3.6" />
          <path d="M44 24l-9 -3M44 24l9 -3M63.1 37.8l2.5-9.3M63.1 37.8l7 6.2M55.8 60.2l9.2 1M55.8 60.2l-2 9M32.2 60.2l-9.2 1M32.2 60.2l2 9M24.9 37.8l-2.5-9.3M24.9 37.8l-7 6.2" />
        </g>
        <circle cx="44" cy="44" r="23" fill={`url(#lens${id})`} />
        <ellipse cx="35" cy="33" rx="11" ry="6.5" transform="rotate(-35 35 33)" fill="#ffffff" opacity="0.28" />
      </g>
      <circle cx="44" cy="44" r="25.5" fill="none" stroke={`url(#ring${id})`} strokeWidth="5" />
      <circle cx="44" cy="44" r="28.2" fill="none" stroke="#000" strokeOpacity="0.18" strokeWidth="0.8" />
    </svg>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={34} />
      <div className="whitespace-nowrap font-display text-[17px] font-bold leading-none tracking-[-0.03em] text-ink">
        Football Detective
      </div>
    </div>
  );
}
