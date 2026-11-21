import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Flame, Home, Info, Settings, Users } from 'lucide-react';
import type { Route } from '@/hooks/useRouter';
import { useProfile } from '@/hooks/useProfile';
import { effectiveStreak } from '@/game/progression';
import { toDateKey } from '@/utils/date';
import { Logo } from './Logo';
import { haptic } from '@/utils/haptics';
import { play } from '@/utils/sound';
import { PitchBackdrop } from './PitchBackdrop';

interface Props {
  route: Route;
  navigate: (r: Route) => void;
  onOpenSettings: () => void;
  children: ReactNode;
}

const NAV: { route: Route; label: string; icon: typeof Home }[] = [
  { route: { name: 'home' }, label: 'Today', icon: Home },
  { route: { name: 'stats' }, label: 'Stats', icon: BarChart3 },
  { route: { name: 'players' }, label: 'Players', icon: Users },
  { route: { name: 'about' }, label: 'About', icon: Info },
];

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return scrolled;
}

export function AppShell({ route, navigate, onOpenSettings, children }: Props) {
  const { profile } = useProfile();
  const streak = effectiveStreak(profile, toDateKey());
  const inGame = route.name === 'play';
  const scrolled = useScrolled();
  const activeName = route.name === 'play' ? 'home' : route.name;

  return (
    <div className="grain relative min-h-dvh">
      <PitchBackdrop />

      {/* Top bar: transparent at rest, frosted once content scrolls under it */}
      <header
        className={`sticky top-0 z-40 transition-[background,border-color,backdrop-filter] duration-300 ${
          scrolled ? 'border-b border-white/[0.07] bg-pitch-950/55 backdrop-blur-2xl backdrop-saturate-150' : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <button onClick={() => navigate({ name: 'home' })} className="rounded-xl" aria-label="Football Detective home">
            <Logo />
          </button>

          {/* Desktop: glass segmented control */}
          <nav className="glass ml-6 hidden h-10 items-center gap-0.5 rounded-full p-1 md:flex" aria-label="Main">
            {NAV.map((n) => {
              const active = activeName === n.route.name;
              return (
                <button
                  key={n.label}
                  onClick={() => {
                  if (activeName !== n.route.name) {
                    void haptic('selection');
                    play('select');
                  }
                  navigate(n.route);
                }}
                  className={`relative flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13.5px] font-medium transition-colors ${
                    active ? 'text-ink' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="desk-pill"
                      className="absolute inset-0 rounded-full bg-white/[0.13] shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <n.icon size={15} className="relative" />
                  <span className="relative">{n.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div
              className={`flex h-10 items-center gap-1.5 rounded-full border px-3 text-[14px] font-semibold tabular-nums backdrop-blur-xl ${
                streak > 0 ? 'border-warn/30 bg-warn/[0.1] text-warn' : 'border-white/[0.1] bg-white/[0.06] text-ink-muted'
              }`}
              title="Daily streak"
              aria-label={`Daily streak: ${streak}`}
            >
              <Flame size={16} className={streak > 0 ? 'fill-warn/40' : ''} /> {streak}
            </div>
            <button
              onClick={onOpenSettings}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.1] bg-white/[0.06] text-ink-muted backdrop-blur-xl transition-colors hover:text-ink"
              aria-label="Settings"
            >
              <Settings size={17} />
            </button>
          </div>
        </div>
      </header>

      <main className={`relative mx-auto max-w-6xl px-4 pt-2 sm:px-6 sm:pt-6 md:pb-16 ${inGame ? 'pb-10' : 'pb-32'}`}>{children}</main>

      {/* Phones: floating glass tab bar (hidden during a case so the game gets the whole screen) */}
      <nav hidden={inGame} className="fixed inset-x-0 bottom-0 z-40 px-5 pb-[calc(env(safe-area-inset-bottom)+14px)] md:hidden" aria-label="Main">
        <div className="glass-strong mx-auto grid h-[62px] max-w-[380px] grid-cols-4 rounded-full p-1.5">
          {NAV.map((n) => {
            const active = activeName === n.route.name;
            return (
              <button
                key={n.label}
                onClick={() => {
                  if (activeName !== n.route.name) {
                    void haptic('selection');
                    play('select');
                  }
                  navigate(n.route);
                }}
                className={`relative flex flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium transition-colors ${
                  active ? 'text-ink' : 'text-ink-muted'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-white/[0.12] shadow-[inset_0_1px_0_rgb(255_255_255/0.22)]"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <n.icon size={20} className={`relative ${active ? 'text-lime' : ''}`} strokeWidth={active ? 2.3 : 2} />
                <span className="relative">{n.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
