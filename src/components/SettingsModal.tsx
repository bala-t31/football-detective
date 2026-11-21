import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Info, RotateCcw, Smartphone, Volume2, Wind } from 'lucide-react';
import { haptic, hapticsSupported } from '@/utils/haptics';
import { play } from '@/utils/sound';
import { useProfile } from '@/hooks/useProfile';
import { storage } from '@/utils/storage';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export function SettingsModal({
  open,
  onClose,
  onReset,
  onOpenAbout,
}: {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  onOpenAbout: () => void;
}) {
  const { profile, updateSettings, resetProgress } = useProfile();
  const [confirm, setConfirm] = useState(false);
  const toast = useToast();

  return (
    <>
      <Modal open={open && !confirm} onClose={onClose} title="Settings">
        <div className="space-y-2">
          <Toggle
            icon={<Volume2 size={16} />}
            label="Sound effects"
            description="Soft chimes for guesses, clues and wins."
            checked={profile.settings.sound}
            onChange={(v) => {
              updateSettings({ sound: v });
              if (v) window.setTimeout(() => play('reveal'), 30);
            }}
          />
          {hapticsSupported() && (
            <Toggle
              icon={<Smartphone size={16} />}
              label="Haptic feedback"
              description="Gentle vibrations when you guess, reveal and win."
              checked={profile.settings.haptics}
              onChange={(v) => {
                updateSettings({ haptics: v });
                if (v) window.setTimeout(() => void haptic('medium'), 30);
              }}
            />
          )}
          <Toggle
            icon={<Wind size={16} />}
            label="Reduce animations"
            description="Minimise motion. System reduced-motion is respected automatically."
            checked={profile.settings.reducedMotion}
            onChange={(v) => updateSettings({ reducedMotion: v })}
          />
        </div>

        <div className="mt-5 rounded-[20px] border border-bad/20 bg-bad/[0.06] p-4">
          <div className="text-[15px] font-semibold text-ink">Reset game progress</div>
          <p className="mt-1 text-[13.5px] text-ink-muted">Deletes XP, streaks, achievements, history and discovered players on this device.</p>
          <Button variant="danger" size="sm" className="mt-3" icon={<RotateCcw size={14} />} onClick={() => setConfirm(true)}>
            Reset progress…
          </Button>
        </div>

        <button
          onClick={() => {
            onClose();
            onOpenAbout();
          }}
          className="mt-5 flex w-full items-center gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.05] p-3.5 text-left transition-colors hover:bg-white/[0.08]"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.08] text-ink">
            <Info size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold text-ink">About and feedback</div>
            <div className="text-[12.5px] text-ink-muted">How to play, the developer, and send feedback on Instagram</div>
          </div>
          <ChevronRight size={18} className="text-ink-faint" />
        </button>
        {!storage.available() && (
          <p className="mt-4 text-[13.5px] text-warn">This device isn’t letting the game save. Progress will be lost when you close it.</p>
        )}
      </Modal>

      <Modal
        open={open && confirm}
        onClose={() => setConfirm(false)}
        title="Reset all progress?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetProgress();
                setConfirm(false);
                onClose();
                onReset();
                toast('Progress reset', 'success');
              }}
            >
              Yes, reset everything
            </Button>
          </>
        }
      >
        <p className="text-[14.5px] leading-relaxed text-ink-muted">
          This permanently deletes your {profile.xp.toLocaleString()} XP, {profile.history.length} case records and{' '}
          {Object.keys(profile.achievements).length} achievements. This cannot be undone.
        </p>
      </Modal>
    </>
  );
}

function Toggle({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.05] p-3.5 text-left transition-colors hover:bg-white/[0.08]"
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.08] text-ink">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold text-ink">{label}</div>
        <div className="text-[12.5px] text-ink-muted">{description}</div>
      </div>
      <span
        className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-300 ${
          checked ? 'bg-[linear-gradient(180deg,#5ef0ad,#2fc785)]' : 'bg-white/[0.16]'
        } shadow-[inset_0_1px_2px_rgb(0_0_0/0.3)]`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 600, damping: 32 }}
          className={`absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.35)] ${checked ? 'right-[2px]' : 'left-[2px]'}`}
        />
      </span>
    </button>
  );
}
