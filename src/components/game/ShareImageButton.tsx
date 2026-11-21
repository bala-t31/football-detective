import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import type { ShareCardData } from '@/game/shareCard';
import { shareCard } from '@/game/share';
import { isNative } from '@/utils/native';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export function ShareImageButton({ data, className = '' }: { data: () => ShareCardData; className?: string }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const run = async () => {
    setBusy(true);
    try {
      const url = isNative() ? undefined : window.location.origin + window.location.pathname;
      const res = await shareCard(data(), url);
      if (res === 'downloaded') toast('Image saved. Post it anywhere', 'success');
      else if (res === 'failed') toast('Couldn’t share the image here', 'error');
    } catch {
      toast('Couldn’t make the image', 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button variant="primary" size="lg" className={className} onClick={run} disabled={busy} icon={<ImageIcon size={18} />}>
      {busy ? 'Making image…' : 'Share image'}
    </Button>
  );
}
