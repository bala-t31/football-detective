import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Achievement, GameMode, RoundState } from '@/types';
import { getPlayer } from '@/data';
import { storage } from '@/utils/storage';
import { toDateKey } from '@/utils/date';
import { play } from '@/utils/sound';
import { haptic } from '@/utils/haptics';
import {
  cluesForRound,
  createRound,
  feedbackFor,
  hintsRemaining,
  isValidRound,
  revealNextClue,
  submitGuess,
  type GuessResult,
} from '@/game/engine';
import { useProfile } from './useProfile';

const PROCESS_DELAY_MS = 380;

function keyFor(mode: GameMode, date: string) {
  return mode === 'daily' ? `round.daily.${date}` : `round.active.${mode}`;
}

export function useRound(mode: GameMode) {
  const { profile, recordRound } = useProfile();
  const [today] = useState(toDateKey);
  const storageKey = keyFor(mode, today);

  const recentIds = useMemo(
    () => profile.history.filter((h) => h.mode === mode).slice(0, 20).map((h) => h.playerId),
    // Only needed when creating a round, so it is computed once per mode.
    [mode], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const [round, setRound] = useState<RoundState>(() => {
    const saved = storage.get<unknown>(storageKey, null);
    if (isValidRound(saved) && saved.mode === mode && (mode !== 'daily' || saved.date === today)) return saved;
    return createRound(mode, { date: today, exclude: recentIds });
  });
  const [busy, setBusy] = useState(false);
  const [lastUnlocked, setLastUnlocked] = useState<Achievement[]>([]);
  const busyRef = useRef(false);

  useEffect(() => {
    storage.set(storageKey, round);
  }, [round, storageKey]);

  // If a finished round was restored (e.g. after refresh) make sure it's recorded exactly once.
  useEffect(() => {
    if (round.status !== 'playing') recordRound(round);
  }, [round, recordRound]);

  const player = getPlayer(round.playerId)!;
  const clues = useMemo(() => cluesForRound(player, round.mode), [player, round.mode]);
  const feedback = useMemo(() => feedbackFor(round), [round]);

  const submit = useCallback(
    (guessId: string): Promise<GuessResult> => {
      if (busyRef.current) return Promise.resolve({ ok: false, error: 'finished', message: 'Processing previous guess…' });
      const check = submitGuess(round, guessId);
      if (!check.ok) return Promise.resolve(check);
      busyRef.current = true;
      setBusy(true);
      play('tap');
      void haptic('light');
      return new Promise((resolve) => {
        window.setTimeout(() => {
          setRound(check.state);
          if (check.state.status === 'won') {
            play('win');
            void haptic('success');
          } else if (check.state.status === 'lost') {
            play('lose');
            void haptic('error');
          } else {
            play('wrong');
            void haptic('warning');
          }
          if (check.state.status !== 'playing') setLastUnlocked(recordRound(check.state));
          busyRef.current = false;
          setBusy(false);
          resolve(check);
        }, PROCESS_DELAY_MS);
      });
    },
    [round, recordRound],
  );

  const reveal = useCallback(() => {
    if (busyRef.current) return;
    setRound((r) => {
      const next = revealNextClue(r);
      if (next !== r) {
        play('reveal');
        void haptic('medium');
      }
      return next;
    });
  }, []);

  const newRound = useCallback(() => {
    if (mode === 'daily') return;
    const exclude = [round.playerId, ...recentIds];
    setLastUnlocked([]);
    setRound(createRound(mode, { exclude }));
  }, [mode, round.playerId, recentIds]);

  return {
    round,
    player,
    clues,
    feedback,
    busy,
    hintsLeft: hintsRemaining(round),
    attemptsLeft: round.maxAttempts - round.guesses.length,
    submit,
    reveal,
    newRound,
    lastUnlocked,
  };
}

/** Read-only peek at today's daily round (used by the dashboard). */
export function peekDailyRound(date: string = toDateKey()): RoundState | null {
  const saved = storage.get<unknown>(keyFor('daily', date), null);
  return isValidRound(saved) && saved.date === date ? saved : null;
}
