import { useState } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { ProfileProvider, useProfile } from '@/hooks/useProfile';
import { useRouter } from '@/hooks/useRouter';
import { ToastProvider } from '@/components/ui/Toast';
import { AppShell } from '@/components/layout/AppShell';
import { SettingsModal } from '@/components/SettingsModal';
import { HomePage } from '@/pages/HomePage';
import { GamePage } from '@/pages/GamePage';
import { StatsPage } from '@/pages/StatsPage';
import { PlayersPage } from '@/pages/PlayersPage';
import { AboutPage } from '@/pages/AboutPage';

function Routes() {
  const { route, navigate } = useRouter();
  const { profile } = useProfile();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const pageKey = `${route.name}-${route.name === 'play' ? route.mode : ''}-${resetKey}`;

  return (
    <MotionConfig reducedMotion={profile.settings.reducedMotion ? 'always' : 'user'}>
      <AppShell route={route} navigate={navigate} onOpenSettings={() => setSettingsOpen(true)}>
        <motion.div
            key={pageKey}
            // Never fade fully out: the new screen starts mostly visible and settles in,
            // so switching tabs doesn't flash the background.
            initial={{ opacity: 0.55, y: 10, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.7 }}
          >
            {route.name === 'home' && <HomePage navigate={navigate} />}
            {route.name === 'play' && <GamePage mode={route.mode} navigate={navigate} />}
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
