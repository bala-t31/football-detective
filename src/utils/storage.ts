/**
 * Safe LocalStorage wrapper. Falls back to an in-memory map when storage is unavailable
 * (private mode, disabled cookies, quota errors) so the app never crashes.
 */
const PREFIX = 'football-detective:';
const memory = new Map<string, string>();

function backend(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const probe = `${PREFIX}__probe`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

let cached: Storage | null | undefined;
function store(): Storage | null {
  if (cached === undefined) cached = backend();
  return cached;
}

export const storage = {
  available(): boolean {
    return store() !== null;
  },
  get<T>(key: string, fallback: T): T {
    const k = PREFIX + key;
    try {
      const raw = store()?.getItem(k) ?? memory.get(k) ?? null;
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    const k = PREFIX + key;
    const raw = JSON.stringify(value);
    memory.set(k, raw);
    try {
      store()?.setItem(k, raw);
    } catch {
      /* quota or disabled — memory copy keeps the session working */
    }
  },
  remove(key: string): void {
    const k = PREFIX + key;
    memory.delete(k);
    try {
      store()?.removeItem(k);
    } catch {
      /* ignore */
    }
  },
  clearAll(): void {
    for (const k of Array.from(memory.keys())) if (k.startsWith(PREFIX)) memory.delete(k);
    const s = store();
    if (!s) return;
    try {
      const keys: string[] = [];
      for (let i = 0; i < s.length; i++) {
        const k = s.key(i);
        if (k?.startsWith(PREFIX)) keys.push(k);
      }
      keys.forEach((k) => s.removeItem(k));
    } catch {
      /* ignore */
    }
  },
};
