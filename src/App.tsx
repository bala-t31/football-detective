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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {route.name === 'home' && <HomePage navigate={navigate} />}
            {route.name === 'play' && <GamePage mode={route.mode} navigate={navigate} />}
            {route.name === 'stats' && <StatsPage />}
            {route.name === 'players' && <PlayersPage />}
          </motion.div>
      </AppShell>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} onReset={() => setResetKey((k) => k + 1)} />
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
