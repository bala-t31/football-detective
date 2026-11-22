import { useCallback, useEffect, useState } from 'react';
import type { GameMode } from '@/types';
import { decodeChallenge, startChallenge } from '@/game/challenge';

export type Route =
  | { name: 'home' }
  | { name: 'play'; mode: GameMode }
  | { name: 'stats' }
  | { name: 'players' }
  | { name: 'about' };

const MODES: GameMode[] = ['daily', 'practice', 'hardcore', 'career', 'legends', 'clubpath', 'teammate', 'higherlower', 'emoji', 'transfer', 'xi'];

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'play' && MODES.includes(parts[1] as GameMode)) return { name: 'play', mode: parts[1] as GameMode };
  if (parts[0] === 'stats') return { name: 'stats' };
  if (parts[0] === 'players') return { name: 'players' };
  if (parts[0] === 'about') return { name: 'about' };
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
    case 'about':
      return '#/about';
    default:
      return '#/';
  }
}

/**
 * A challenge link (#/challenge/<code>) sets up the round and is then replaced by the game screen,
 * so Back doesn't land on the link again.
 */
function resolveChallenge(): void {
  const m = window.location.hash.match(/^#\/challenge\/([A-Za-z0-9_-]+)/);
  if (!m) return;
  const challenge = decodeChallenge(m[1]);
  const target = challenge ? `#/play/${startChallenge(challenge)}` : '#/';
  window.history.replaceState(null, '', target);
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => {
    resolveChallenge();
    return parseHash(window.location.hash);
  });

  useEffect(() => {
    const onHash = () => {
      resolveChallenge();
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
