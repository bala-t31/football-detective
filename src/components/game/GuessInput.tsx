import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Search, SendHorizontal, X } from 'lucide-react';
import type { Player } from '@/types';
import { PLAYERS } from '@/data';
import { nationInfo } from '@/data/nations';
import { POSITION_LABEL } from '@/data/positions';
import { searchPlayers } from '@/game/search';
import { Button } from '@/components/ui/Button';

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
  const listId = useId();

  const results = useMemo(() => (selected ? [] : searchPlayers(PLAYERS, query, 7)), [query, selected]);

  useEffect(() => setActive(0), [query]);

  const fail = (msg: string) => {
    setError(msg);
    setShake((s) => s + 1);
  };

  const choose = (p: Player) => {
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

  const submit = async () => {
    if (disabled || busy) return;
    if (!selected) {
      // Allow an exact name match typed without picking from the list.
      const exact = PLAYERS.find((p) => p.name.toLowerCase() === query.trim().toLowerCase());
      if (exact && !guessedIds.includes(exact.id)) {
        setSelected(exact);
        const res = await onSubmit(exact.id);
        if (res.ok) clear();
        else fail(res.message ?? 'Invalid guess');
        return;
      }
      fail(query.trim() ? 'Select a player from the suggestions — only database players can be guessed.' : 'Start typing a player name.');
      return;
    }
    const res = await onSubmit(selected.id);
    if (res.ok) clear();
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
      if (open && results[active] && !selected) choose(results[active]);
      else void submit();
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showList = open && !selected && query.trim().length > 0;

  return (
    <div className="relative">
      <motion.div
        key={shake}
        animate={shake ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
        transition={{ duration: 0.35 }}
        className="flex gap-2"
      >
        <div
          className={`relative flex h-14 min-w-0 flex-1 items-center rounded-xl border bg-pitch-900 transition-colors ${
            error ? 'border-bad/60' : selected ? 'border-lime/50' : 'border-pitch-700 focus-within:border-pitch-600'
          }`}
        >
          <Search size={18} className="ml-4 shrink-0 text-ink-faint" />
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
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            onKeyDown={onKeyDown}
            placeholder={disabled ? 'Case closed' : 'Name your suspect…'}
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-[16px] font-medium text-ink placeholder:text-ink-faint focus:outline-none disabled:cursor-not-allowed"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showList && results[active] ? `${listId}-${results[active].id}` : undefined}
            aria-invalid={Boolean(error)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query && !disabled && (
            <button onClick={clear} className="mr-2 grid h-9 w-9 place-items-center rounded-lg text-ink-faint hover:text-ink" aria-label="Clear">
              <X size={16} />
            </button>
          )}
        </div>
        <Button
          variant="primary"
          size="lg"
          className="!px-4 sm:!px-6"
          onClick={() => void submit()}
          disabled={disabled || busy || !query.trim()}
          aria-label="Submit guess"
          icon={busy ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
        >
          <span className="hidden sm:inline">{busy ? 'Checking' : 'Submit'}</span>
        </Button>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 text-sm text-bad"
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
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-[60px] z-30 max-h-[min(360px,50dvh)] overflow-y-auto rounded-xl border border-pitch-700 bg-pitch-850 p-1.5 shadow-2xl scrollbar-thin"
          >
            {results.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-ink-muted">No players in the database match “{query}”.</li>
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
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(p)}
                    className={`flex min-h-[52px] cursor-pointer items-center gap-3 rounded-lg px-3 py-2 ${
                      i === active ? 'bg-pitch-700/70' : ''
                    } ${used ? 'opacity-40' : ''}`}
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-pitch-900 text-lg">
                      {nationInfo(p.nationality).flag}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-ink">{p.name}</div>
                      <div className="truncate text-xs text-ink-muted">
                        {p.nationality} · {POSITION_LABEL[p.position]}
                      </div>
                    </div>
                    {used && <span className="label">Guessed</span>}
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
