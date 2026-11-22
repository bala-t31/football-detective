import { useEffect, useState } from 'react';
import { Download, Megaphone, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { isNative } from '@/utils/native';
import { openExternal } from '@/utils/external';
import { toDateKey } from '@/utils/date';
import {
  checkForUpdate,
  getAnnouncement,
  markAnnouncementSeen,
  snoozeUpdate,
  syncContent,
  type Announcement,
  type UpdateInfo,
} from '@/utils/online';

/**
 * Runs the online checks a moment after start-up: new player data in the background, then at most
 * one pop-up per launch, an app update first (Android app only), otherwise an announcement.
 */
export function OnlineNotices() {
  const toast = useToast();
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [news, setNews] = useState<Announcement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const [content, upd, ann] = await Promise.all([
        syncContent(),
        isNative() ? checkForUpdate() : Promise.resolve(null),
        getAnnouncement(toDateKey()),
      ]);
      if (cancelled) return;
      if (upd) setUpdate(upd);
      else if (ann) setNews(ann);
      if (content.updated && content.newPlayers > 0) {
        toast(`${content.newPlayers} new player${content.newPlayers === 1 ? '' : 's'} downloaded. They join next time you open the game`, 'success');
      }
    }, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [toast]);

  const closeUpdate = () => {
    if (update) snoozeUpdate(update.latest);
    setUpdate(null);
  };
  const closeNews = () => {
    if (news) markAnnouncementSeen(news.id);
    setNews(null);
  };

  return (
    <>
      <Modal
        open={!!update}
        onClose={closeUpdate}
        title={update ? `Version ${update.latest} is out` : 'Update'}
        footer={
          <div className="grid gap-2.5">
            <Button
              variant="primary"
              size="lg"
              icon={<Download size={18} />}
              onClick={() => {
                if (!update) return;
                openExternal(update.url);
                snoozeUpdate(update.latest);
                setUpdate(null);
              }}
            >
              Download update
            </Button>
            <Button variant="ghost" onClick={closeUpdate}>
              Later
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lime/15 text-lime">
            <Sparkles size={20} />
          </span>
          <div>
            <p className="text-[15px] text-ink">What&apos;s new</p>
            <ul className="mt-2 space-y-1.5 text-[14.5px] leading-relaxed text-ink-muted">
              {(update?.notes.length ? update.notes : ['Fixes and improvements.']).map((n) => (
                <li key={n} className="flex gap-2">
                  <span className="text-lime">•</span>
                  {n}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] text-ink-faint">It installs over this version. Your streak, XP and trophies stay.</p>
          </div>
        </div>
      </Modal>

      <Modal
        open={!update && !!news}
        onClose={closeNews}
        title={news?.title ?? 'News'}
        footer={
          <div className="grid gap-2.5">
            {news?.cta && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  if (!news?.cta) return;
                  openExternal(news.cta.url);
                  closeNews();
                }}
              >
                {news.cta.label}
              </Button>
            )}
            <Button variant={news?.cta ? 'ghost' : 'primary'} onClick={closeNews}>
              {news?.cta ? 'Not now' : 'Got it'}
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-warn/15 text-warn">
            <Megaphone size={20} />
          </span>
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-muted">{news?.body}</p>
        </div>
      </Modal>
    </>
  );
}
