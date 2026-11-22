import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Search, SendHorizontal, X } from 'lucide-react';
import type { Player } from '@/types';
import { PLAYERS } from '@/data';
import { nationInfo } from '@/data/nations';
import { POSITION_LABEL } from '@/data/positions';
import { normalize, searchPlayers } from '@/game/search';
import { Button } from '@/components/ui/Button';
import { haptic } from '@/utils/haptics';
import { EASE_OUT, MOTION, ease, isReducedMotion } from '@/ui/motion';

interface Props {
  onSubmit: (playerId: string) => Promise<{ ok: boolean; message?: string }>;
  disabled: boolean;
  busy: boolean;
  guessedIds: string[];
}

export function GuessInput({ onSubmit, disabled, busy, guessedIds }: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Player | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const isTouch = () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;

  const results = useMemo(() => (selected ? [] : searchPlayers(PLAYERS, query, 7)), [query, selected]);

  useEffect(() => setActive(0), [query]);

  const fail = (msg: string) => {
    void haptic('error');
    setError(msg);
    setShake((s) => s + 1);
  };

  const choose = (p: Player) => {
    void haptic('selection');
    if (guessedIds.includes(p.id)) {
      fail('You have already guessed this player.');
      return;
    }
    setSelected(p);
    setQuery(p.name);
    setOpen(false);
    setError(null);
    inputRef.current?.focus();
  };

  const clear = () => {
    setSelected(null);
    setQuery('');
    setError(null);
    inputRef.current?.focus();
  };

  const afterSuccess = () => {
    setSelected(null);
    setQuery('');
    setError(null);
    setOpen(false);
    if (isTouch()) inputRef.current?.blur();
    else inputRef.current?.focus();
  };

  const submit = async () => {
    if (disabled || busy) return;
    if (!selected) {
      // Allow an exact (accent-insensitive) name or alias typed without picking from the list.
      const q = normalize(query);
      const exact = PLAYERS.find((p) => normalize(p.name) === q || p.aka.some((a) => normalize(a) === q && a.length > 3));
      if (exact) {
        if (guessedIds.includes(exact.id)) {
          fail('You have already guessed this player.');
          return;
        }
        setSelected(exact);
        const res = await onSubmit(exact.id);
        if (res.ok) afterSuccess();
        else fail(res.message ?? 'Invalid guess');
        return;
      }
      fail(query.trim() ? 'Select a player from the suggestions — only database players can be guessed.' : 'Start typing a player name.');
      return;
    }
    const res = await onSubmit(selected.id);
    if (res.ok) afterSuccess();
    else fail(res.message ?? 'Invalid guess');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && results.length) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === 'ArrowUp' && results.length) {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (!selected && results[active]) choose(results[active]);
      else void submit();
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showList = open && !selected && query.trim().length > 0;

  return (
    <div ref={rootRef} className="relative scroll-mt-20">
      <motion.div
        key={shake}
        // A short, damped nudge says "that guess didn't work". No nudge with reduced motion.
        animate={shake && !isReducedMotion() ? { x: [0, -6, 5, -3, 0] } : undefined}
        transition={{ duration: 0.32, ease: EASE_OUT }}
        className="flex gap-2"
      >
        <div
          className={`relative flex h-14 min-w-0 flex-1 items-center rounded-full border bg-black/25 shadow-[inset_0_2px_6px_rgb(0_0_0/0.35)] transition-colors ${
            error ? 'border-bad/60' : selected ? 'border-lime/60 shadow-[0_0_0_4px_rgb(75_227_160/0.12),inset_0_2px_6px_rgb(0_0_0/0.35)]' : 'border-white/[0.1] focus-within:border-white/[0.22]'
          }`}
        >
          <Search size={18} className="ml-5 shrink-0 text-ink-faint" />
          <input
            ref={inputRef}
            value={query}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
              setOpen(true);
              setError(null);
            }}
            onFocus={() => {
              setOpen(true);
              // On phones, bring the search box to the top so suggestions aren't hidden by the keyboard.
              if (isTouch()) window.setTimeout(() => rootRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 280);
            }}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            onKeyDown={onKeyDown}
            placeholder={disabled ? 'Case closed' : 'Type a player’s name'}
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-[16px] font-medium text-ink placeholder:text-ink-faint focus:outline-none disabled:cursor-not-allowed"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showList && results[active] ? `${listId}-${results[active].id}` : undefined}
            aria-invalid={Boolean(error)}
            enterKeyHint="go"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query && !disabled && (
            <button onClick={clear} className="mr-2 grid h-9 w-9 place-items-center rounded-full bg-white/[0.08] text-ink-muted hover:text-ink" aria-label="Clear">
              <X size={16} />
            </button>
          )}
        </div>
        <Button
          variant="primary"
          size="lg"
          className="w-14 !px-0 sm:w-auto sm:!px-6"
          onClick={() => void submit()}
          disabled={disabled || busy || !query.trim()}
          aria-label="Submit guess"
          icon={busy ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
        >
          <span className="hidden sm:inline">{busy ? 'Checking' : 'Guess'}</span>
        </Button>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 px-2 text-[13.5px] text-bad"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showList && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: ease(MOTION.fadeOut) }}
            transition={ease(MOTION.quick)}
            className="glass-strong absolute left-0 right-0 top-[64px] z-30 max-h-[min(380px,52dvh)] origin-top overflow-y-auto overscroll-contain rounded-[26px] p-1.5 scrollbar-thin"
          >
            {results.length === 0 ? (
              <li className="px-4 py-5 text-center text-[14px] text-ink-muted">No player called “{query}” in the game yet.</li>
            ) : (
              results.map((p, i) => {
                const used = guessedIds.includes(p.id);
                return (
                  <li
                    key={p.id}
                    id={`${listId}-${p.id}`}
                    role="option"
                    aria-selected={i === active}
                    aria-disabled={used}
                    onPointerDown={(e) => e.preventDefault()}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(p)}
                    className={`flex min-h-[56px] cursor-pointer items-center gap-3 rounded-[20px] px-3 py-2 transition-colors ${
                      i === active ? 'bg-white/[0.1] shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]' : ''
                    } ${used ? 'opacity-40' : ''}`}
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.07] text-xl">
                      {nationInfo(p.nationality).flag}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15.5px] font-semibold tracking-[-0.01em] text-ink">{p.name}</div>
                      <div className="truncate text-[12.5px] text-ink-muted">
                        {POSITION_LABEL[p.position]}, {p.nationality}
                      </div>
                    </div>
                    {used && <span className="text-[12px] font-medium text-ink-faint">Guessed</span>}
                  </li>
                );
              })
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
