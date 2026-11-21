import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Volume2, Wind } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { storage } from '@/utils/storage';
import { PLAYERS } from '@/data';
import { SCORING } from '@/game/scoring';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export function SettingsModal({ open, onClose, onReset }: { open: boolean; onClose: () => void; onReset: () => void }) {
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
            description="Subtle synthesized cues for guesses and reveals."
            checked={profile.settings.sound}
            onChange={(v) => updateSettings({ sound: v })}
          />
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

        <div className="mt-6 space-y-2 text-[13.5px] leading-relaxed text-ink-muted">
          <div className="font-display text-[17px] font-bold tracking-[-0.02em] text-ink">About</div>
          <p>
            Football Detective is a daily football mystery. Identify the footballer from progressive clues in six attempts. Every
            incorrect guess reveals how close you were on nationality, position, club, league and era.
          </p>
          <p>
            Scoring: {SCORING.base} for a solve, −{SCORING.wrongGuess} per wrong guess, −{SCORING.extraClue} per extra clue, +
            {SCORING.firstGuessBonus} first-guess bonus, +{SCORING.noHintBonus} no-hint bonus.
          </p>
          <p>
            {PLAYERS.length} curated players. Career data is correct to the 2025–26 season; club lists show senior clubs with some very
            short loans omitted. &ldquo;League&rdquo; feedback uses each club&apos;s main division. The Daily Case is the same for every player
            on the same local date.
          </p>
          {!storage.available() && (
            <p className="text-warn">This device isn’t letting the game save. Progress will be lost when you close it.</p>
          )}
        </div>
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
