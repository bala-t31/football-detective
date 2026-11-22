import { useEffect, useState } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { ProfileProvider, useProfile } from '@/hooks/useProfile';
import { useRouter } from '@/hooks/useRouter';
import { ToastProvider } from '@/components/ui/Toast';
import { AppShell } from '@/components/layout/AppShell';
import { SettingsModal } from '@/components/SettingsModal';
import { OnlineNotices } from '@/components/OnlineNotices';
import { MOTION, ease, setReducedMotion } from '@/ui/motion';
import { HomePage } from '@/pages/HomePage';
import { GamePage } from '@/pages/GamePage';
import { StatsPage } from '@/pages/StatsPage';
import { PlayersPage } from '@/pages/PlayersPage';
import { AboutPage } from '@/pages/AboutPage';
import { ClubPathPage } from '@/pages/ClubPathPage';
import { TeammatePage } from '@/pages/TeammatePage';
import { HigherLowerPage } from '@/pages/HigherLowerPage';
import { EmojiPage } from '@/pages/EmojiPage';
import { TransferPage } from '@/pages/TransferPage';
import { XiPage } from '@/pages/XiPage';

/** Modes with their own screen; everything else is a classic round on the game screen. */
const OWN_SCREEN = ['clubpath', 'teammate', 'higherlower', 'emoji', 'transfer', 'xi'];

function Routes() {
  const { route, navigate } = useRouter();
  const { profile } = useProfile();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  setReducedMotion(profile.settings.reducedMotion);
  useEffect(() => {
    const onChallenge = () => setResetKey((k) => k + 1);
    window.addEventListener('fd:challenge', onChallenge);
    return () => window.removeEventListener('fd:challenge', onChallenge);
  }, []);
  const pageKey = `${route.name}-${route.name === 'play' ? route.mode : ''}-${resetKey}`;

  return (
    <MotionConfig reducedMotion={profile.settings.reducedMotion ? 'always' : 'user'}>
      <AppShell route={route} navigate={navigate} onOpenSettings={() => setSettingsOpen(true)}>
        <motion.div
            key={pageKey}
            // Screens cross-fade only; the blocks inside them do the rising, so there is one
            // motion per moment. Starting from 0.4 keeps the background from flashing.
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={ease(MOTION.fadeIn)}
          >
            {route.name === 'home' && <HomePage navigate={navigate} />}
            {route.name === 'play' && route.mode === 'clubpath' && <ClubPathPage navigate={navigate} />}
            {route.name === 'play' && route.mode === 'teammate' && <TeammatePage navigate={navigate} />}
            {route.name === 'play' && route.mode === 'higherlower' && <HigherLowerPage navigate={navigate} />}
            {route.name === 'play' && route.mode === 'emoji' && <EmojiPage navigate={navigate} />}
            {route.name === 'play' && route.mode === 'transfer' && <TransferPage navigate={navigate} />}
            {route.name === 'play' && route.mode === 'xi' && <XiPage navigate={navigate} />}
            {route.name === 'play' && !OWN_SCREEN.includes(route.mode) && <GamePage mode={route.mode} navigate={navigate} />}
            {route.name === 'stats' && <StatsPage />}
            {route.name === 'players' && <PlayersPage />}
            {route.name === 'about' && <AboutPage />}
          </motion.div>
      </AppShell>
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onReset={() => setResetKey((k) => k + 1)}
        onOpenAbout={() => navigate({ name: 'about' })}
      />
      <OnlineNotices />
    </MotionConfig>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <ToastProvider>
        <Routes />
      </ToastProvider>
    </ProfileProvider>
  );
}
