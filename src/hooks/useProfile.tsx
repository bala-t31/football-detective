import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Achievement, GameRecord, Profile, RoundState, Settings } from '@/types';
import { storage } from '@/utils/storage';
import { toDateKey } from '@/utils/date';
import { setSoundEnabled } from '@/utils/sound';
import { setHapticsEnabled } from '@/utils/haptics';
import { applyDailyResult, newlyUnlocked } from '@/game/progression';

const PROFILE_KEY = 'profile.v1';
const HISTORY_CAP = 300;

export function defaultProfile(): Profile {
  return {
    version: 1,
    xp: 0,
    achievements: {},
    discovered: {},
    history: [],
    daily: { currentStreak: 0, bestStreak: 0, lastWinDate: null, lastCompletedDate: null, completed: {} },
    settings: { sound: true, haptics: true, reducedMotion: false },
  };
}

function loadProfile(): Profile {
  const raw = storage.get<Partial<Profile> | null>(PROFILE_KEY, null);
  const base = defaultProfile();
  if (!raw || raw.version !== 1) return base;
  return {
    ...base,
    ...raw,
    daily: { ...base.daily, ...(raw.daily ?? {}) },
    settings: { ...base.settings, ...(raw.settings ?? {}) },
    history: Array.isArray(raw.history) ? raw.history : [],
    achievements: raw.achievements ?? {},
    discovered: raw.discovered ?? {},
  };
}

interface ProfileContextValue {
  profile: Profile;
  /** Records a finished round. Safe to call more than once for the same round. */
  recordRound: (round: RoundState) => Achievement[];
  updateSettings: (patch: Partial<Settings>) => void;
  resetProgress: () => void;
  achievementQueue: Achievement[];
  dismissAchievement: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [achievementQueue, setQueue] = useState<Achievement[]>([]);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  useEffect(() => {
    storage.set(PROFILE_KEY, profile);
    setSoundEnabled(profile.settings.sound);
    setHapticsEnabled(profile.settings.haptics);
  }, [profile]);

  const recordRound = useCallback((round: RoundState): Achievement[] => {
    const prev = profileRef.current;
    if (round.status === 'playing') return [];
    if (prev.history.some((h) => h.id === round.id)) return [];
    if (round.mode === 'daily' && round.date && prev.daily.completed[round.date]) return [];

    const won = round.status === 'won';
    const score = round.score?.total ?? 0;
    const record: GameRecord = {
      id: round.id,
      mode: round.mode,
      playerId: round.playerId,
      caseNumber: round.caseNumber,
      date: round.date ?? toDateKey(new Date(round.finishedAt ?? Date.now())),
      won,
      guesses: round.guesses.length,
      cluesRevealed: round.revealed,
      score,
      finishedAt: round.finishedAt ?? Date.now(),
    };

    let next: Profile = {
      ...prev,
      xp: prev.xp + score,
      history: [record, ...prev.history].slice(0, HISTORY_CAP),
      discovered: won && !prev.discovered[round.playerId] ? { ...prev.discovered, [round.playerId]: record.finishedAt } : prev.discovered,
    };
    if (round.mode === 'daily' && round.date) next = { ...next, daily: applyDailyResult(next, round.date, won, score) };

    const unlocked = newlyUnlocked(next, record);
    if (unlocked.length) {
      const now = Date.now();
      next = { ...next, achievements: { ...next.achievements, ...Object.fromEntries(unlocked.map((a) => [a.id, now])) } };
      setQueue((q) => [...q, ...unlocked]);
    }
    profileRef.current = next;
    setProfile(next);
    return unlocked;
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setProfile((p) => ({ ...p, settings: { ...p.settings, ...patch } }));
  }, []);

  const resetProgress = useCallback(() => {
    const keepSettings = profileRef.current.settings;
    storage.clearAll();
    const fresh = { ...defaultProfile(), settings: keepSettings };
    profileRef.current = fresh;
    setProfile(fresh);
    setQueue([]);
  }, []);

  const dismissAchievement = useCallback(() => setQueue((q) => q.slice(1)), []);

  const value = useMemo(
    () => ({ profile, recordRound, updateSettings, resetProgress, achievementQueue, dismissAchievement }),
    [profile, recordRound, updateSettings, resetProgress, achievementQueue, dismissAchievement],
  );
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
