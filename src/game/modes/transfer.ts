/** Transfer Fee: pick the reported fee from four options. */
import { TRANSFERS, type Transfer } from '@/data/transfers';
import { PLAYER_BY_ID } from '@/data';
import { storage } from '@/utils/storage';

export const TRANSFER_QUESTIONS = 8;
export const TRANSFER_POINTS = 50;

export const TRANSFER_POOL: Transfer[] = TRANSFERS.filter((t) => PLAYER_BY_ID[t.playerId]);

export function formatFee(t: { fee: number; cur: string }, fee = t.fee): string {
  return `${t.cur}${fee % 1 ? fee.toFixed(1) : fee}m`;
}

function niceRound(n: number): number {
  if (n < 20) return Math.max(1, Math.round(n));
  if (n < 60) return Math.round(n / 2.5) * 2.5;
  return Math.round(n / 5) * 5;
}

/**
 * Four options: the real fee and three others at least 20% away from it and from each other,
 * so the usual differences between sources never make two options both "right".
 */
export function feeOptions(t: Transfer, rand: () => number = Math.random): number[] {
  const factors = [0.45, 0.6, 0.75, 1.3, 1.5, 1.75, 2.1];
  const picked: number[] = [t.fee];
  const shuffled = [...factors].sort(() => rand() - 0.5);
  for (const f of shuffled) {
    if (picked.length === 4) break;
    const v = niceRound(t.fee * f);
    if (picked.every((x) => Math.abs(x - v) / Math.max(x, v) >= 0.2)) picked.push(v);
  }
  return picked.sort((a, b) => a - b);
}

export interface TransferGame {
  id: string;
  order: string[]; // playerIds
  answers: { playerId: string; picked: number; correct: boolean }[];
  options: number[];
  status: 'playing' | 'over';
  startedAt: number;
}

export function transferFor(playerId: string): Transfer | undefined {
  return TRANSFER_POOL.find((t) => t.playerId === playerId);
}

export function newTransferGame(id: string): TransferGame {
  const order = [...TRANSFER_POOL].sort(() => Math.random() - 0.5).slice(0, TRANSFER_QUESTIONS).map((t) => t.playerId);
  return { id, order, answers: [], options: feeOptions(transferFor(order[0])!), status: 'playing', startedAt: Date.now() };
}

const KEY = 'transfer.game';
export const loadTransferGame = (): TransferGame | null => {
  const g = storage.get<TransferGame | null>(KEY, null);
  return g && Array.isArray(g.order) && g.order.every((id) => transferFor(id)) ? g : null;
};
export const saveTransferGame = (g: TransferGame) => storage.set(KEY, g);
