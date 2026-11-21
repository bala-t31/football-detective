import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Github, Instagram, MessageCircleHeart } from 'lucide-react';
import { PLAYERS } from '@/data';
import { SCORING } from '@/game/scoring';
import { APP_VERSION, DEVELOPER, openExternal } from '@/utils/external';
import { Button } from '@/components/ui/Button';
import { LogoMark } from '@/components/layout/Logo';
import { FeedbackSheet } from '@/components/FeedbackSheet';

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.05 + i * 0.06, type: 'spring', stiffness: 260, damping: 28 } }),
};

const STEPS = [
  { title: 'Read the first clue', body: 'Every case starts with one clue about a mystery footballer.' },
  { title: 'Guess a player', body: 'Each wrong guess shows how close you were on nation, position, club, league and era.' },
  { title: 'Reveal more if you need to', body: 'Extra clues get more specific, but each one costs a little XP.' },
  { title: 'Solve it in six', body: 'Name the player within six guesses to close the case and build your streak.' },
];

export function AboutPage() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="space-y-5">
      <motion.header custom={0} variants={rise} initial="hidden" animate="show" className="px-1 pt-1">
        <p className="text-[14px] font-medium text-ink-muted">Version {APP_VERSION}</p>
        <h1 className="heading mt-0.5 text-[40px] leading-none sm:text-[48px]">About</h1>
      </motion.header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Developer */}
        <motion.section custom={1} variants={rise} initial="hidden" animate="show" className="card overflow-hidden p-6 text-center">
          <div className="mx-auto grid h-[104px] w-[104px] place-items-center rounded-full bg-[conic-gradient(from_210deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75)] p-[3px] shadow-[0_16px_40px_-14px_rgb(214_41_118/0.6)]">
            <div className="grid h-full w-full place-items-center rounded-full border-[3px] border-pitch-950 bg-pitch-900">
              <LogoMark size={58} plate={false} />
            </div>
          </div>
          <p className="mt-4 text-[13px] font-medium text-ink-muted">Designed and built by</p>
          <h2 className="heading mt-0.5 text-[28px] leading-tight">@{DEVELOPER.handle}</h2>
          <p className="mx-auto mt-2 max-w-sm text-[14.5px] leading-relaxed text-ink-muted">
            Football Detective is an independent game. Every player, clue and screen was put together by one developer.
          </p>
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            <Button variant="primary" size="lg" onClick={() => setFeedbackOpen(true)} icon={<MessageCircleHeart size={18} />}>
              Send feedback
            </Button>
            <Button size="lg" onClick={() => openExternal(DEVELOPER.instagram)} icon={<Instagram size={18} />}>
              Follow on Instagram
            </Button>
          </div>
        </motion.section>

        {/* Feedback prompt */}
        <motion.section custom={2} variants={rise} initial="hidden" animate="show" className="card p-5 sm:p-6">
          <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">Help shape the game</h2>
          <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-muted">
            Found a bug, spotted a wrong fact, or want your favourite player added? Send it to the developer on Instagram. Every message
            gets read.
          </p>
          <div className="mt-4 divide-y divide-white/[0.07] overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.03]">
            {[
              ['Report a bug', 'Something broke or looked wrong'],
              ['Request a player', 'Tell us who is missing'],
              ['Suggest an idea', 'New modes, features, anything'],
            ].map(([title, sub]) => (
              <button
                key={title}
                onClick={() => setFeedbackOpen(true)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.04]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-ink">{title}</span>
                  <span className="block text-[13px] text-ink-muted">{sub}</span>
                </span>
                <ChevronRight size={18} className="text-ink-faint" />
              </button>
            ))}
          </div>
        </motion.section>
      </div>

      {/* How to play */}
      <motion.section custom={3} variants={rise} initial="hidden" animate="show" className="card p-5 sm:p-6">
        <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">How to play</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-3.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.08] text-[14px] font-semibold tabular-nums text-lime shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]">
                {i + 1}
              </span>
              <div>
                <div className="text-[15px] font-semibold text-ink">{s.title}</div>
                <p className="text-[14px] leading-relaxed text-ink-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-5 rounded-[20px] bg-white/[0.04] px-4 py-3.5 text-[13.5px] leading-relaxed text-ink-muted">
          A solve is worth {SCORING.base} XP. Each wrong guess costs {SCORING.wrongGuess} and each extra clue {SCORING.extraClue}. Solving on
          your first guess adds {SCORING.firstGuessBonus}, and solving without extra clues adds {SCORING.noHintBonus}. Hardcore pays 1.5×
          and Career Detective 1.2×.
        </div>
      </motion.section>

      {/* The game */}
      <motion.section custom={4} variants={rise} initial="hidden" animate="show" className="card p-5 sm:p-6">
        <h2 className="font-display text-[20px] font-bold tracking-[-0.02em]">The game</h2>
        <dl className="mt-3 divide-y divide-white/[0.07] text-[14.5px]">
          <Row label="Version" value={APP_VERSION} />
          <Row label="Footballers" value={String(PLAYERS.length)} />
          <Row label="Data" value="Correct to the 2025–26 season" />
          <Row label="Daily mystery" value="Same for everyone" />
        </dl>
        <button
          onClick={() => openExternal(DEVELOPER.github)}
          className="mt-4 flex w-full items-center gap-3 rounded-[20px] bg-white/[0.04] px-4 py-3.5 text-left transition-colors hover:bg-white/[0.07]"
        >
          <Github size={18} className="text-ink" />
          <span className="flex-1 text-[14.5px] font-medium text-ink">Source code on GitHub</span>
          <ChevronRight size={18} className="text-ink-faint" />
        </button>
        <p className="mt-4 text-[12.5px] leading-relaxed text-ink-faint">
          Football Detective is a fan-made game and isn&apos;t affiliated with any club, league or player. Player facts are written by hand from
          public records.
        </p>
      </motion.section>

      <FeedbackSheet open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
