import { useState } from 'react';
import { Bug, Database, Instagram, Lightbulb, MessageCircle, UserPlus } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { copyText } from '@/game/share';
import { APP_VERSION, DEVELOPER, openExternal } from '@/utils/external';
import { haptic } from '@/utils/haptics';

const TOPICS = [
  { id: 'bug', label: 'Bug', icon: Bug },
  { id: 'idea', label: 'Idea', icon: Lightbulb },
  { id: 'player', label: 'Add a player', icon: UserPlus },
  { id: 'data', label: 'Wrong fact', icon: Database },
  { id: 'other', label: 'Something else', icon: MessageCircle },
] as const;

type TopicId = (typeof TOPICS)[number]['id'];

const PLACEHOLDER: Record<TopicId, string> = {
  bug: 'What happened, and what did you expect to happen?',
  idea: 'What would make the game better?',
  player: 'Which footballer should be added?',
  data: 'Which player and clue is wrong, and what is correct?',
  other: 'Tell the developer anything.',
};

/**
 * Instagram has no way for an app to pre-fill a message, so the sheet writes the message here,
 * copies it, and opens the developer's Instagram chat ready to paste.
 */
export function FeedbackSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [topic, setTopic] = useState<TopicId>('idea');
  const [text, setText] = useState('');
  const toast = useToast();

  const compose = () => {
    const label = TOPICS.find((t) => t.id === topic)?.label ?? 'Feedback';
    const platform = Capacitor.isNativePlatform() ? 'Android app' : 'web';
    return `Football Detective feedback: ${label}\n\n${text.trim()}\n\n(v${APP_VERSION}, ${platform})`;
  };

  const send = async () => {
    if (!text.trim()) {
      void haptic('error');
      toast('Write a few words first', 'error');
      return;
    }
    const res = await copyText(compose());
    void haptic('success');
    toast(res === 'copied' ? 'Copied. Paste it into the Instagram chat.' : 'Opening Instagram…', res === 'copied' ? 'success' : 'info');
    window.setTimeout(() => {
      openExternal(DEVELOPER.instagramDm);
      setText('');
      onClose();
    }, 900);
  };

  return (
    <Modal open={open} onClose={onClose} title="Send feedback">
      <p className="text-[14.5px] leading-relaxed text-ink-muted">
        Your message goes straight to the developer, <span className="font-semibold text-ink">@{DEVELOPER.handle}</span>, on Instagram.
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Topic">
        {TOPICS.map((t) => {
          const on = topic === t.id;
          return (
            <button
              key={t.id}
              role="radio"
              aria-checked={on}
              onClick={() => {
                setTopic(t.id);
                void haptic('selection');
              }}
              className={`flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13.5px] font-medium transition-colors ${
                on ? 'border-lime/40 bg-lime/15 text-ink' : 'border-white/[0.1] bg-white/[0.05] text-ink-muted hover:text-ink'
              }`}
            >
              <t.icon size={14} className={on ? 'text-lime' : ''} />
              {t.label}
            </button>
          );
        })}
      </div>

      <label className="mt-4 block">
        <span className="sr-only">Your message</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          rows={5}
          placeholder={PLACEHOLDER[topic]}
          className="w-full resize-none rounded-[22px] border border-white/[0.1] bg-black/25 px-4 py-3.5 text-[16px] leading-relaxed text-ink shadow-[inset_0_2px_6px_rgb(0_0_0/0.3)] placeholder:text-ink-faint focus:border-white/[0.22] focus:outline-none"
        />
      </label>
      <div className="mt-1 text-right text-[12px] tabular-nums text-ink-faint">{text.length} / 1000</div>

      <Button variant="primary" size="lg" className="mt-3 w-full" onClick={send} icon={<Instagram size={18} />}>
        Copy and open Instagram
      </Button>
      <p className="mt-3 text-center text-[12.5px] leading-relaxed text-ink-faint">
        Instagram opens a chat with @{DEVELOPER.handle}. Your message is already copied, so just paste and send.
      </p>
    </Modal>
  );
}
