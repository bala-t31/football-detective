(() => {
  'use strict';
  const REPO = 'bala-t31/football-detective';

  // ── Nav glass on scroll
  const nav = document.querySelector('[data-nav]');
  const onScroll = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── Latest release info (version + size). The static text stays if GitHub can't be reached.
  fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } })
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((rel) => {
      const apk = (rel.assets || []).find((a) => a.name.endsWith('.apk'));
      const version = (rel.tag_name || '').replace(/^v/, '').split('-')[0];
      const size = apk ? `${(apk.size / 1048576).toFixed(1)} MB` : null;
      const text = ['Version ' + version, size, 'Free', 'Android 7 or newer'].filter(Boolean).join(' · ');
      document.querySelectorAll('[data-release-meta]').forEach((el) => (el.textContent = text));
    })
    .catch(() => {});

  // ── Demo
  const FD = window.FD;
  const root = document.querySelector('[data-demo]');
  if (!FD || !root) return;

  const count = document.querySelector('[data-count]');
  if (count) count.textContent = String(FD.PLAYERS.length);

  const MYSTERIES = ['thierry-henry', 'luka-modric', 'mohamed-salah', 'zlatan-ibrahimovic', 'kevin-de-bruyne', 'andrea-pirlo', 'ronaldinho', 'didier-drogba', 'heung-min-son', 'virgil-van-dijk'];
  const MAX = 6;
  const DOWNLOAD = `https://github.com/${REPO}/releases/latest/download/football-detective.apk`;
  const $ = (sel) => root.querySelector(sel);
  const els = {
    beads: $('[data-beads]'), clues: $('[data-clues]'), reveal: $('[data-reveal]'), form: $('[data-form]'),
    input: $('[data-input]'), suggest: $('[data-suggest]'), error: $('[data-error]'), rows: $('[data-rows]'), result: $('[data-result]'),
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  let state;
  function pickMystery() {
    let last = null;
    try { last = sessionStorage.getItem('fd-demo-last'); } catch (e) {}
    const pool = MYSTERIES.filter((id) => id !== last && FD.getPlayer(id));
    const id = pool[Math.floor(Math.random() * pool.length)];
    try { sessionStorage.setItem('fd-demo-last', id); } catch (e) {}
    return FD.getPlayer(id);
  }

  function start() {
    state = { target: pickMystery(), revealed: 1, guesses: [], done: false, won: false, active: 0, results: [] };
    els.rows.querySelectorAll('.row').forEach((r) => r.remove());
    els.rows.classList.remove('has-rows');
    els.result.hidden = true;
    els.result.innerHTML = '';
    els.form.hidden = false;
    els.input.value = '';
    els.error.textContent = '';
    closeSuggest();
    render();
  }

  function render() {
    const { target, revealed } = state;
    const total = target.clues.length;
    els.clues.innerHTML = target.clues
      .map((c, i) =>
        i < revealed
          ? `<li class="clue"><span class="clue__n">${i + 1}</span><span>${esc(c.text)}</span></li>`
          : `<li class="clue clue--locked" aria-label="Locked clue ${i + 1}"><span class="clue__n">${i + 1}</span><span>This clue is still locked</span></li>`,
      )
      .join('');
    const left = MAX - state.guesses.length;
    els.beads.innerHTML = Array.from({ length: MAX }, (_, i) => `<span class="bead${i < left ? '' : ' is-used'}"></span>`).join('');
    els.beads.setAttribute('aria-label', `${left} of ${MAX} guesses left`);
    els.reveal.disabled = state.done || revealed >= total;
    els.reveal.textContent = revealed >= total ? 'All clues revealed' : `Reveal another clue (${revealed} of ${total})`;
    els.reveal.hidden = state.done;
  }

  // Suggestions
  let results = [];
  function closeSuggest() {
    els.suggest.hidden = true;
    els.input.setAttribute('aria-expanded', 'false');
    results = [];
  }
  function openSuggest() {
    const q = els.input.value;
    results = FD.searchPlayers(FD.PLAYERS, q, 6);
    if (!q.trim() || !results.length) {
      closeSuggest();
      if (q.trim().length >= 2) els.error.textContent = 'No player by that name in the game.';
      return;
    }
    els.error.textContent = '';
    state.active = 0;
    els.suggest.innerHTML = results
      .map((p, i) => {
        const n = FD.nationInfo(p.nationality);
        return `<li role="option" id="opt-${i}" data-i="${i}" aria-selected="${i === 0}"><span class="flag">${n.flag}</span><span><span class="name">${esc(p.name)}</span><br><span class="sub">${esc(FD.POSITION_LABEL[p.position])} · ${esc(p.mostRecentClub)}</span></span></li>`;
      })
      .join('');
    els.suggest.hidden = false;
    els.input.setAttribute('aria-expanded', 'true');
    els.input.setAttribute('aria-activedescendant', 'opt-0');
  }
  function setActive(i) {
    if (!results.length) return;
    state.active = (i + results.length) % results.length;
    els.suggest.querySelectorAll('li').forEach((li, j) => li.setAttribute('aria-selected', String(j === state.active)));
    els.input.setAttribute('aria-activedescendant', `opt-${state.active}`);
    els.suggest.querySelector(`#opt-${state.active}`)?.scrollIntoView({ block: 'nearest' });
  }

  function cellHtml(c) {
    let value = c.value;
    if (c.key === 'nationality') value = FD.nationInfo(c.value).code;
    if (c.key === 'club') value = FD.shortClub(c.value);
    if (c.key === 'league') value = FD.shortLeague(c.value);
    if (c.key === 'position') value = c.value.replace('Attacking Mid', 'Att. Mid').replace('Defensive Mid', 'Def. Mid').replace('Central Mid', 'Cen. Mid');
    const arrow = c.key === 'era' && c.direction ? (c.direction === 'later' ? ' ↑' : ' ↓') : '';
    const sub = c.shared ? '<small>shared</small>' : '';
    return `<div class="cell cell--${c.status}">${esc(value)}${arrow}${sub}</div>`;
  }

  function submit(player) {
    if (!player || state.done) return;
    if (state.guesses.includes(player.id)) {
      els.error.textContent = 'You already guessed this player.';
      return;
    }
    state.guesses.push(player.id);
    const fb = FD.compareGuess(player, state.target);
    const row = document.createElement('div');
    row.className = 'row';
    const flag = FD.nationInfo(player.nationality).flag;
    row.innerHTML = `<p class="row__name"><span>${flag}</span>${esc(player.name)}</p><div class="row__cells">${fb.cells.map(cellHtml).join('')}</div>`;
    els.rows.appendChild(row);
    els.rows.classList.add('has-rows');
    els.input.value = '';
    closeSuggest();

    if (fb.correct) finish(true);
    else if (state.guesses.length >= MAX) finish(false);
    render();
  }

  function finish(won) {
    state.done = true;
    state.won = won;
    els.form.hidden = true;
    const t = state.target;
    const n = state.guesses.length;
    els.result.innerHTML = `
      <p class="result__verdict ${won ? 'is-win' : 'is-loss'}">${won ? (n === 1 ? 'First guess. Brilliant.' : `Solved in ${n} guesses`) : 'Not this time. The answer was'}</p>
      <h4>${esc(t.name)}</h4>
      <p>${esc(FD.POSITION_LABEL[t.position])}, ${esc(t.nationality)}. ${esc(t.careerClubs.filter((c, i, a) => i === 0 || a[i - 1] !== c).join(' → '))}</p>
      <div class="result__cta">
        <a class="btn btn--primary" href="${DOWNLOAD}">Get the full game</a>
        <button class="btn btn--glass" type="button" data-again>Try another case</button>
      </div>`;
    els.result.hidden = false;
    els.result.querySelector('[data-again]').addEventListener('click', start);
  }

  els.input.addEventListener('input', openSuggest);
  els.input.addEventListener('focus', () => els.input.value && openSuggest());
  els.input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(state.active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(state.active - 1); }
    else if (e.key === 'Escape') closeSuggest();
  });
  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (results.length) submit(results[state.active]);
    else if (els.input.value.trim()) els.error.textContent = 'Pick a player from the list.';
  });
  els.suggest.addEventListener('mousedown', (e) => e.preventDefault());
  els.suggest.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-i]');
    if (li) submit(results[Number(li.dataset.i)]);
  });
  document.addEventListener('click', (e) => { if (!els.form.contains(e.target)) closeSuggest(); });
  els.reveal.addEventListener('click', () => {
    if (state.revealed < state.target.clues.length) { state.revealed++; render(); }
  });

  start();
})();
