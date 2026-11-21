import type { FeedbackStatus, RoundState } from '@/types';
import { renderShareCard, type ShareCardData } from './shareCard';
import { weekNumber } from './weekly';
import { getPlayer } from '@/data';
import { FEEDBACK_EMOJI } from './feedback';
import { MODES, feedbackFor } from './engine';
import { isNative, nativeShare, nativeShareImage } from '@/utils/native';

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

/**
 * Shares a result image. Android: native share sheet. Web: Web Share with files where
 * supported (most phones), otherwise the image is downloaded.
 */
export async function shareImage(blob: Blob, text?: string): Promise<ShareOutcome | 'downloaded'> {
  const fileName = `football-detective-${Date.now()}.png`;
  const native = await nativeShareImage(blob, fileName, text);
  if (native) return native;
  if (isNative()) return 'failed';
  const file = new File([blob], fileName, { type: 'image/png' });
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  if (nav?.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file], text });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    return 'downloaded';
  } catch {
    return 'failed';
  }
}

// ─── Result cards ───────────────────────────────────────────────────

export function cardForRound(state: RoundState, includeName: boolean): ShareCardData {
  const won = state.status === 'won';
  const eyebrow =
    state.mode === 'daily'
      ? `Daily mystery #${state.caseNumber}`
      : state.mode === 'legends' && state.date
        ? `Weekly Legends · Week ${weekNumber(state.date)} · Legend ${state.caseNumber}`
        : `${MODES[state.mode].name} · Case ${state.caseNumber}`;
  const rows = feedbackFor(state).map((f) => (f.correct ? (['correct', 'correct', 'correct', 'correct', 'correct'] as FeedbackStatus[]) : f.cells.map((c) => c.status)));
  return {
    eyebrow,
    headline: won ? (state.guesses.length === 1 ? 'Solved first guess' : `Solved in ${state.guesses.length}/${state.maxAttempts}`) : 'Case unsolved',
    won,
    score: state.score?.total ?? 0,
    detail: `${state.guesses.length} guess${state.guesses.length === 1 ? '' : 'es'} · ${state.revealed} clue${state.revealed === 1 ? '' : 's'}`,
    rows,
    reveal: includeName ? getPlayer(state.playerId)?.name : undefined,
    cta: state.mode === 'daily' ? "Can you solve today's mystery?" : 'Can you crack the case?',
  };
}

export async function shareCard(data: ShareCardData, text?: string) {
  const blob = await renderShareCard(data);
  return shareImage(blob, text);
}
