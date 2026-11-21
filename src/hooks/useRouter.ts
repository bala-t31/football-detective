import { useCallback, useEffect, useState } from 'react';
import type { GameMode } from '@/types';

export type Route =
  | { name: 'home' }
  | { name: 'play'; mode: GameMode }
  | { name: 'stats' }
  | { name: 'players' };

const MODES: GameMode[] = ['daily', 'practice', 'hardcore', 'career'];

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'play' && MODES.includes(parts[1] as GameMode)) return { name: 'play', mode: parts[1] as GameMode };
  if (parts[0] === 'stats') return { name: 'stats' };
  if (parts[0] === 'players') return { name: 'players' };
  return { name: 'home' };
}

export function routeToHash(r: Route): string {
  switch (r.name) {
    case 'play':
      return `#/play/${r.mode}`;
    case 'stats':
      return '#/stats';
    case 'players':
      return '#/players';
    default:
      return '#/';
  }
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((r: Route) => {
    const hash = routeToHash(r);
    if (window.location.hash === hash) return;
    window.location.hash = hash;
  }, []);

  return { route, navigate };
}
