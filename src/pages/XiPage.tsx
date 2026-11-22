import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Eye, RotateCcw, SendHorizontal } from 'lucide-react';
import type { Route } from '@/hooks/useRouter';
import { LINEUPS } from '@/data/lineups';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { ModeHeader } from '@/components/game/ModeHeader';
import { ShareImageButton } from '@/components/game/ShareImageButton';
import { Confetti } from '@/components/game/Celebration';
import { finishedRound } from '@/game/synthetic';
import { XI_FULL_BONUS, XI_POINTS, lineupById, loadXiGame, matchXi, saveXiBest, saveXiGame, xiBest, xiPlayers, xiScore, type XiGame } from '@/game/modes/xi';
import { play } from '@/utils/sound';
import { haptic } from '@/utils/haptics';
import { MOTION, ease, isReducedMotion, pressScale, press, reveal } from '@/ui/motion';

function surname(name: string): string {
  const parts = name.split(' ');
  return parts.length > 1 ? parts.slice(1).join(' ') : name;
}

export function XiPage({ navigate }: { navigate: (r: Route) => void }) {
  const { recordRound } = useProfile();
  const toast = useToast();
  const [game, setGame] = useState<XiGame | null>(loadXiGame);
  const [text, setText] = useState('');
  const [confirmGiveUp, setConfirmGiveUp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const best = xiBest();
  useEffect(() => saveXiGame(game), [game]);
  const back = () => navigate({ name: 'home' });

  const pick = (id: string) => setGame({ lineupId: id, found: [], wrong: [], status: 'playing', startedAt: Date.now() });

  if (!game) {
    return (
      <div className="mx-auto max-w-2xl">
        <ModeHeader eyebrow="New mode" title="Guess the XI" onBack={back} />
        <p className="mb-4 px-1 text-[15px] leading-relaxed text-ink-muted">
          Pick a famous line-up and name all eleven starters. Surnames are fine. {XI_POINTS} XP a player, {XI_FULL_BONUS} more for the full XI.
        </p>
        <motion.ul variants={reveal} custom={0} initial="hidden" animate="show" className="card divide-y divide-white/[0.07] overflow-hidden p-1.5">
          {LINEUPS.map((l) => (
            <li key={l.id}>
              <motion.button
                whileTap={{ scale: pressScale }}
                transition={press()}
                onClick={() => pick(l.id)}
                className="flex w-full items-center gap-3.5 rounded-[20px] px-3 py-3 text-left transition-colors hover:bg-white/[0.05]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-white/[0.07] font-display text-[14px] font-bold tabular-nums text-ink">
                  {String(l.year).slice(2)}&apos;
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold text-ink">
                    {l.team} {l.year}
                  </span>
                  <span className="block truncate text-[13px] text-ink-muted">{l.match}</span>
                </span>
                {best[l.id] ? (
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold tabular-nums ${best[l.id] === 11 ? 'bg-lime/15 text-lime' : 'bg-white/[0.07] text-ink-muted'}`}>
                    {best[l.id]}/11
                  </span>
                ) : null}
                <ChevronRight size={18} className="shrink-0 text-ink-faint" />
              </motion.button>
            </li>
          ))}
        </motion.ul>
      </div>
    );
  }

  const lineup = lineupById(game.lineupId)!;
  const all = xiPlayers(lineup);
  const done = game.status === 'over';
  const found = game.found.length;
  const points = xiScore(found);

  const finish = (g: XiGame) => {
    const over: XiGame = { ...g, status: 'over' };
    saveXiBest(g.lineupId, g.found.length);
    recordRound(
      finishedRound({
        mode: 'xi',
        playerId: lineup.starId,
        caseNumber: g.found.length,
        guesses: [],
        maxAttempts: 11,
        won: g.found.length >= 6,
        points: xiScore(g.found.length),
        startedAt: g.startedAt,
      }),
    );
    setGame(over);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (done || !text.trim()) return;
    const hit = matchXi(lineup, text, game.found);
    if (hit) {
      play('win');
      void haptic('success');
      const next = { ...game, found: [...game.found, hit.name] };
      setText('');
      if (next.found.length === 11) finish(next);
      else setGame(next);
    } else {
      const already = all.some((p) => game.found.includes(p.name) && p.accept.some((a) => a.toLowerCase() === text.trim().toLowerCase()));
      play('wrong');
      void haptic('warning');
      toast(already ? 'Already on the team sheet' : 'Not in this XI', 'info');
      if (!already) setGame({ ...game, wrong: [...game.wrong, text.trim()].slice(-30) });
    }
    inputRef.current?.focus();
  };

  return (
    <div className="mx-auto max-w-2xl">
      <ModeHeader
        eyebrow={`${lineup.formation} · ${lineup.match}`}
        title={`${lineup.team} ${lineup.year}`}
        onBack={() => (done ? setGame(null) : back())}
        right={<span className="rounded-full bg-white/[0.07] px-3 py-1.5 text-[12.5px] tabular-nums text-ink">{found}/11</span>}
      />
      {done && found === 11 && <Confetti />}

      {/* The pitch, attack at the top */}
      <section
        className="relative overflow-hidden rounded-[30px] border border-white/[0.1] bg-[linear-gradient(180deg,#0f3a26,#0b2b1c)] px-2 py-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]"
        aria-label="Line-up"
      >
        <div className="pointer-events-none absolute inset-x-6 top-1/2 h-px bg-white/[0.12]" aria-hidden />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.12]" aria-hidden />
        <div className="relative flex flex-col-reverse gap-5">
          {lineup.rows.map((row, r) => (
            <div key={r} className="flex justify-around">
              {row.map((p) => {
                const got = game.found.includes(p.name);
                const shown = got || done;
                return (
                  <div key={p.name} className="flex w-[74px] flex-col items-center text-center sm:w-[96px]">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-full border text-[13px] font-bold ${
                        got ? 'border-lime/60 bg-lime/25 text-lime' : shown ? 'border-bad/40 bg-bad/15 text-bad' : 'border-white/20 bg-white/[0.08] text-ink-faint'
                      }`}
                    >
                      {got ? '✓' : shown ? '✕' : '?'}
                    </span>
                    <motion.span
                      key={shown ? 'name' : 'blank'}
                      initial={isReducedMotion() || !shown ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={ease(MOTION.quick)}
                      className={`mt-1.5 line-clamp-2 text-[11.5px] font-semibold leading-tight sm:text-[12.5px] ${got ? 'text-ink' : shown ? 'text-ink-muted' : 'text-transparent'}`}
                    >
                      {shown ? surname(p.name) : '·'}
                    </motion.span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {!done ? (
        <section className="card mt-4 p-4 sm:p-5">
          <form onSubmit={submit} className="flex gap-2">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a starter’s name"
              autoComplete="off"
              autoCapitalize="words"
              enterKeyHint="send"
              className="h-14 min-w-0 flex-1 rounded-full border border-white/[0.1] bg-black/25 px-5 text-[16px] text-ink shadow-[inset_0_2px_6px_rgb(0_0_0/0.35)] outline-none placeholder:text-ink-faint focus:border-white/[0.22]"
              aria-label="Starter's name"
            />
            <Button type="submit" variant="primary" size="lg" className="w-14 !px-0" icon={<SendHorizontal size={18} />} aria-label="Submit name" />
          </form>
          <p className="mt-2.5 text-[12.5px] text-ink-faint">
            {found} found · {game.wrong.length} miss{game.wrong.length === 1 ? '' : 'es'} · {points} XP so far
          </p>
          <button
            type="button"
            onClick={() => (confirmGiveUp ? (setConfirmGiveUp(false), finish(game)) : setConfirmGiveUp(true))}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-[14px] font-semibold transition-colors ${
              confirmGiveUp ? 'border-bad/40 bg-bad/15 text-bad' : 'border-white/[0.08] bg-white/[0.03] text-ink-muted hover:text-ink'
            }`}
          >
            <Eye size={16} />
            {confirmGiveUp ? 'Tap again to show the rest' : 'Show the rest'}
          </button>
        </section>
      ) : (
        <motion.section variants={reveal} custom={0} initial="hidden" animate="show" className="card mt-4 p-5 text-center">
          <p className="text-[14px] font-semibold text-lime">{found === 11 ? 'Full XI. Elite ball knowledge.' : `${found} of 11 named`}</p>
          <p className="mt-1 text-[15px] text-ink-muted">+{points} XP</p>
          <div className="mt-5 grid gap-2.5">
            <ShareImageButton
              data={() => ({
                eyebrow: 'Guess the XI',
                headline: `${found}/11`,
                won: found >= 6,
                score: points,
                detail: `${lineup.team} ${lineup.year}, ${lineup.match}`,
                tiles: all.map((p) => (game.found.includes(p.name) ? 'hit' : 'miss')),
                cta: 'Can you name all eleven?',
              })}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <Button onClick={() => setGame(null)} icon={<RotateCcw size={17} />}>
                Another XI
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
