import type { ReactNode } from 'react';
import { BarChart3, Flame, LayoutDashboard, Settings, Users } from 'lucide-react';
import type { Route } from '@/hooks/useRouter';
import { useProfile } from '@/hooks/useProfile';
import { effectiveStreak } from '@/game/progression';
import { toDateKey } from '@/utils/date';
import { Logo } from './Logo';

interface Props {
  route: Route;
  navigate: (r: Route) => void;
  onOpenSettings: () => void;
  children: ReactNode;
}

const NAV: { route: Route; label: string; icon: typeof LayoutDashboard }[] = [
  { route: { name: 'home' }, label: 'HQ', icon: LayoutDashboard },
  { route: { name: 'stats' }, label: 'Stats', icon: BarChart3 },
  { route: { name: 'players' }, label: 'Players', icon: Users },
];

export function AppShell({ route, navigate, onOpenSettings, children }: Props) {
  const { profile } = useProfile();
  const streak = effectiveStreak(profile, toDateKey());
  const inGame = route.name === 'play';
  const isActive = (r: Route) => r.name === route.name || (r.name === 'home' && route.name === 'play');

  return (
    <div className="app-backdrop relative min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-pitch-700/70 bg-pitch-950/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <button onClick={() => navigate({ name: 'home' })} className="rounded-lg" aria-label="Football Detective home">
            <Logo />
          </button>
          <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV.map((n) => (
              <button
                key={n.label}
                onClick={() => navigate(n.route)}
                className={`flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
                  isActive(n.route) ? 'bg-pitch-800 text-ink' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <n.icon size={15} /> {n.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div
              className={`flex h-9 items-center gap-1.5 rounded-lg border px-2.5 font-mono text-sm font-bold ${
                streak > 0 ? 'border-warn/30 bg-warn/[0.06] text-warn' : 'border-pitch-700 text-ink-faint'
              }`}
              title="Daily streak"
              aria-label={`Daily streak: ${streak}`}
            >
              <Flame size={15} className={streak > 0 ? 'fill-warn/30' : ''} /> {streak}
            </div>
            <button
              onClick={onOpenSettings}
              className="grid h-9 w-9 place-items-center rounded-lg border border-pitch-700 text-ink-muted hover:text-ink"
              aria-label="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className={`relative mx-auto max-w-6xl px-3.5 pt-4 sm:px-6 sm:pt-8 md:pb-16 ${inGame ? 'pb-10' : 'pb-28'}`}>{children}</main>

      {/* Mobile tab bar (hidden during a case so the game gets the whole screen) */}
      <nav
        hidden={inGame}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-pitch-700 bg-pitch-950/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="Main"
      >
        <div className="grid grid-cols-3">
          {NAV.map((n) => (
            <button
              key={n.label}
              onClick={() => navigate(n.route)}
              className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                isActive(n.route) ? 'text-lime' : 'text-ink-muted'
              }`}
            >
              <n.icon size={20} />
              {n.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
