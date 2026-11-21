import type { RoundState } from '@/types';
import { getPlayer } from '@/data';
import { FEEDBACK_EMOJI } from './feedback';
import { MODES, feedbackFor } from './engine';
import { nativeShare } from '@/utils/native';

export function buildShareText(state: RoundState, opts: { includeName: boolean; url?: string }): string {
  const mode = MODES[state.mode];
  const title =
    state.mode === 'daily' ? `Daily Case #${String(state.caseNumber).padStart(3, '0')}` : `${mode.name} Case #${state.caseNumber}`;
  const result =
    state.status === 'won' ? `Solved in ${state.guesses.length}/${state.maxAttempts} guesses` : `Case unsolved (X/${state.maxAttempts})`;
  const rows = feedbackFor(state).map((f) => (f.correct ? '🟩🟩🟩🟩🟩 ✅' : f.cells.map((c) => FEEDBACK_EMOJI[c.status]).join('')));

  const lines = [
    'FOOTBALL DETECTIVE 🔎',
    title,
    '',
    result,
    `Clues revealed: ${state.revealed}`,
    `Score: ${state.score?.total ?? 0} XP`,
    '',
    ...rows,
    '',
  ];
  if (opts.includeName) {
    const p = getPlayer(state.playerId);
    if (p) lines.push(`Mystery player: ${p.name}`, '');
  }
  lines.push(state.mode === 'daily' ? "Can you solve today's mystery?" : 'Can you crack the case?');
  if (opts.url) lines.push(opts.url);
  return lines.join('\n');
}

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

export async function shareText(text: string): Promise<ShareOutcome> {
  const native = await nativeShare(text);
  if (native) return native;
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  if (nav?.share) {
    try {
      await nav.share({ text });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
      // fall through to clipboard
    }
  }
  return copyText(text);
}

export async function copyText(text: string): Promise<ShareOutcome> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return 'copied';
    }
  } catch {
    /* fall back below */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok ? 'copied' : 'failed';
  } catch {
    return 'failed';
  }
}
