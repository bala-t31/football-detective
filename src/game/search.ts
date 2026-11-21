import type { Player } from '@/types';

export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[øØ]/g, 'o')
    .replace(/ı/g, 'i')
    .replace(/[’'`.]/g, '')
    .toLowerCase()
    .trim();
}

/** Levenshtein distance capped for short strings. */
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

interface Indexed {
  player: Player;
  full: string;
  words: string[];
}

let index: Indexed[] | null = null;

function buildIndex(players: Player[]): Indexed[] {
  return players.map((player) => {
    const names = [player.name, ...player.aka].map(normalize);
    return { player, full: names.join(' | '), words: Array.from(new Set(names.join(' ').split(/[\s-]+/))) };
  });
}

/**
 * Ranked autocomplete. Prefix matches on any name word rank highest, then substring matches,
 * then typo-tolerant word-prefix matches (edit distance 1 for queries of 3+ characters).
 */
export function searchPlayers(players: Player[], query: string, limit = 8): Player[] {
  const q = normalize(query);
  if (!q) return [];
  if (!index || index.length !== players.length) index = buildIndex(players);
  const qWords = q.split(/\s+/);
  const scored: { p: Player; score: number }[] = [];

  for (const item of index) {
    let score = 0;
    if (item.full.startsWith(q)) score = 100;
    else if (qWords.every((w) => item.words.some((iw) => iw.startsWith(w)))) score = 80;
    else if (item.full.includes(q)) score = 60;
    else if (q.length >= 3) {
      const fuzzy = qWords.every((w) =>
        item.words.some((iw) => iw.length >= w.length && editDistance(iw.slice(0, w.length), w) <= 1),
      );
      if (fuzzy) score = 30;
    }
    if (score > 0) {
      // Prefer well-known players slightly when scores tie.
      const fame = item.player.difficulty === 'easy' ? 3 : item.player.difficulty === 'medium' ? 2 : 1;
      scored.push({ p: item.player, score: score + fame });
    }
  }
  return scored
    .sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name))
    .slice(0, limit)
    .map((s) => s.p);
}
