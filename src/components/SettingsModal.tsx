import { useState } from 'react';
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

        <div className="mt-5 rounded-xl border border-bad/25 bg-bad/[0.04] p-4">
          <div className="font-semibold text-ink">Reset game progress</div>
          <p className="mt-1 text-sm text-ink-muted">Deletes XP, streaks, achievements, history and discovered players on this device.</p>
          <Button variant="danger" size="sm" className="mt-3" icon={<RotateCcw size={14} />} onClick={() => setConfirm(true)}>
            Reset progress…
          </Button>
        </div>

        <div className="mt-5 space-y-2 text-sm text-ink-muted">
          <div className="font-semibold text-ink">About</div>
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
            <p className="text-warn">Browser storage is unavailable — progress will be lost when you close this tab.</p>
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
        <p className="text-sm text-ink-muted">
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
      className="flex w-full items-center gap-3 rounded-xl border border-pitch-700 bg-pitch-850 p-3.5 text-left hover:border-pitch-600"
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-pitch-800 text-ink-muted">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-ink">{label}</div>
        <div className="text-xs text-ink-muted">{description}</div>
      </div>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-lime' : 'bg-pitch-600'}`}>
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-pitch-950 transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
        />
      </span>
    </button>
  );
}
