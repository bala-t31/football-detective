import { useId } from 'react';
import { LOGO_PATHS } from './logoPaths';

/**
 * The mark: a football inside a magnifying glass, perfectly symmetric.
 * The Android icon, themed (monochrome) icon, splash screen and website all use these same paths.
 */
export function LogoMark({ size = 34, plate = true }: { size?: number; plate?: boolean }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 108 108" aria-hidden>
      <defs>
        <radialGradient id={`bg${id}`} cx="50%" cy="38%" r="70%">
          <stop offset="0" stopColor="#14402C" />
          <stop offset="1" stopColor="#06100D" />
        </radialGradient>
        <linearGradient id={`ring${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8FF5C8" />
          <stop offset="1" stopColor="#22B574" />
        </linearGradient>
        <linearGradient id={`handle${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3BD08C" />
          <stop offset="1" stopColor="#1A9A61" />
        </linearGradient>
      </defs>
      {plate && <rect width="108" height="108" rx="26" fill={`url(#bg${id})`} />}
      <path d={LOGO_PATHS.handle} fill={`url(#handle${id})`} />
      <path d={LOGO_PATHS.ring} fill={`url(#ring${id})`} fillRule="evenodd" />
      <path d={LOGO_PATHS.ball} fill="#F2FBF6" fillRule="evenodd" />
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
