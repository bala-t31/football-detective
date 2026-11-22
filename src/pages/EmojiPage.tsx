import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, RotateCcw } from 'lucide-react';
import type { Route } from '@/hooks/useRouter';
import { getPlayer } from '@/data';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { GuessInput } from '@/components/game/GuessInput';
import { ModeHeader } from '@/components/game/ModeHeader';
import { PlayerAvatar } from '@/components/game/PlayerAvatar';
import { ShareImageButton } from '@/components/game/ShareImageButton';
import { Confetti } from '@/components/game/Celebration';
import { randomId } from '@/game/random';
import { finishedRound } from '@/game/synthetic';
import { EMOJI_TRIES, emojiHints, emojiPoints, emojiTiles, nextEmojiPlayer } from '@/game/modes/emoji';
import { storage } from '@/utils/storage';
import { play } from '@/utils/sound';
import { haptic } from '@/utils/haptics';
import { MOTION, ease, reveal } from '@/ui/motion';

interface EmojiGame {
  id: string;
  playerId: string;
  guesses: string[];
  status: 'playing' | 'won' | 'lost';
  startedAt: number;
}

const KEY = 'emoji.game';
const RECENT_KEY = 'emoji.recent';

function newGame(): EmojiGame {
  const recent = storage.get<string[]>(RECENT_KEY, []);
  const p = nextEmojiPlayer(recent);
  storage.set(RECENT_KEY, [p.id, ...recent].slice(0, 40));
  return { id: randomId(), playerId: p.id, guesses: [], status: 'playing', startedAt: Date.now() };
}

function loadGame(): EmojiGame {
  const g = storage.get<EmojiGame | null>(KEY, null);
  return g && getPlayer(g.playerId) && Array.isArray(g.guesses) ? g : newGame();
}

export function EmojiPage({ navigate }: { navigate: (r: Route) => void }) {
  const { recordRound } = useProfile();
  const toast = useToast();
  const [game, setGame] = useState<EmojiGame>(loadGame);
  const [legend, setLegend] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => storage.set(KEY, game), [game]);

  const player = getPlayer(game.playerId)!;
  const tiles = emojiTiles(player);
  const hints = emojiHints(player);
  const wrong = game.guesses.filter((g) => g !== game.playerId).length;
  const left = EMOJI_TRIES - game.guesses.length;
  const points = game.status === 'won' ? emojiPoints(game.guesses.length) : 0;
  const back = () => navigate({ name: 'home' });

  const handleGuess = async (id: string) => {
    if (game.status !== 'playing' || busy) return { ok: false, message: 'Hold on…' };
    if (game.guesses.includes(id)) return { ok: false, message: 'You already tried this player.' };
    setBusy(true);
    play('tap');
    await new Promise((r) => window.setTimeout(r, 300));
    const guesses = [...game.guesses, id];
    let next: EmojiGame;
    if (id === game.playerId) {
      next = { ...game, guesses, status: 'won' };
      play('win');
      void haptic('success');
    } else if (guesses.length >= EMOJI_TRIES) {
      next = { ...game, guesses, status: 'lost' };
      play('lose');
      void haptic('error');
    } else {
      next = { ...game, guesses };
      play('wrong');
      void haptic('warning');
      toast('Not him. Here’s another hint', 'info');
    }
    if (next.status !== 'playing') {
      recordRound(
        finishedRound({
          mode: 'emoji',
          playerId: game.playerId,
          caseNumber: 1,
          guesses,
          maxAttempts: EMOJI_TRIES,
          won: next.status === 'won',
          points: next.status === 'won' ? emojiPoints(guesses.length) : 0,
          startedAt: game.startedAt,
        }),
      );
    }
    setGame(next);
    setBusy(false);
    return { ok: true };
  };

  const done = game.status !== 'playing';

  return (
    <div className="mx-auto max-w-xl">
      <ModeHeader
        eyebrow="New mode"
        title="Emoji Clue"
        onBack={back}
        right={
          <button
            onClick={() => setLegend((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.1] bg-white/[0.07] text-ink-muted"
            aria-label="What the emojis mean"
            aria-pressed={legend}
          >
            <HelpCircle size={19} />
          </button>
        }
      />
      {game.status === 'won' && <Confetti />}

      <motion.section variants={reveal} custom={0} initial="hidden" animate="show" className="card p-5 text-center sm:p-6">
        <p className="text-[13px] font-medium text-ink-muted">Whose career is this?</p>
        <ul className="mt-4 flex flex-wrap justify-center gap-2.5" aria-label="Emoji clues">
          {tiles.map((t, i) => (
            <li key={i} className="flex min-w-[64px] flex-col items-center rounded-2xl border border-white/[0.08] bg-white/[0.05] px-2.5 py-2.5">
              <span className="text-[34px] leading-none" role="img" aria-label={t.meaning}>
                {t.emoji}
              </span>
              {legend && <span className="mt-1.5 max-w-[84px] text-[10.5px] leading-tight text-ink-muted">{t.meaning}</span>}
            </li>
          ))}
        </ul>
        {!legend && <p className="mt-3 text-[12.5px] text-ink-faint">Tap ? to see what each emoji stands for.</p>}
        {wrong > 0 && !done && (
          <ul className="mx-auto mt-4 max-w-sm space-y-2 text-left">
            {hints.slice(0, wrong).map((h) => (
              <motion.li key={h} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ease(MOTION.enter)} className="rounded-2xl border border-lime/25 bg-lime/[0.07] px-3.5 py-2.5 text-[14.5px] text-ink">
                {h}
              </motion.li>
            ))}
          </ul>
        )}
      </motion.section>

      {!done ? (
        <section className="card relative z-20 mt-4 p-4 sm:p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-[18px] font-bold tracking-[-0.02em]">Your guess</h2>
            <span className="text-[13px] tabular-nums text-ink-muted">
              {left} of {EMOJI_TRIES} left · {emojiPoints(game.guesses.length + 1)} XP
            </span>
          </div>
          <GuessInput onSubmit={handleGuess} disabled={done} busy={busy} guessedIds={game.guesses} />
        </section>
      ) : (
        <motion.section variants={reveal} custom={1} initial="hidden" animate="show" className="card mt-4 p-5 text-center sm:p-6">
          <p className={`text-[14px] font-semibold ${game.status === 'won' ? 'text-ok' : 'text-bad'}`}>
            {game.status === 'won' ? (game.guesses.length === 1 ? 'First guess. Elite ball knowledge.' : `Got him in ${game.guesses.length}`) : 'Not this time. It was'}
          </p>
          <div className="mt-4 flex justify-center">
            <PlayerAvatar player={player} revealed size="md" />
          </div>
          <h2 className="heading mt-4 text-[28px] leading-tight">{player.name}</h2>
          <p className="mt-1 text-[15px] text-ink-muted">{game.status === 'won' ? `+${points} XP` : 'No XP this time'}</p>
          <div className="mt-5 grid gap-2.5">
            <ShareImageButton
              data={() => ({
                eyebrow: 'Emoji Clue',
                headline: game.status === 'won' ? `Got it in ${game.guesses.length}/${EMOJI_TRIES}` : 'Emojis won this one',
                won: game.status === 'won',
                score: points,
                detail: tiles.map((t) => t.emoji).join(' '),
                tiles: Array.from({ length: EMOJI_TRIES }, (_, i) =>
                  i < game.guesses.length ? (game.guesses[i] === game.playerId ? 'hit' : 'miss') : 'empty',
                ),
                cta: 'Can you name him from emojis?',
              })}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <Button onClick={() => setGame(newGame())} icon={<RotateCcw size={17} />}>
                Next player
              </Button>
              <Button variant="ghost" onClick={back}>
                Back to today
              </Button>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}
