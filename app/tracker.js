// Tracker state and rendering for Leonida Legend: the checklist of all 55 trophies,
// progress saved in localStorage, kind/grade/search filters, spoiler protection for
// story trophies, and export/import of progress as a JSON file. No network use:
// the only data read is app/data/trophies.json, fetched once by app.js.

export const STORAGE_KEY = 'leonida-legend-tracker-v1';

export const KIND_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'story', label: 'Story' },
  { id: 'missable', label: 'Missable' },
  { id: 'collectibles', label: 'Collectibles' },
  { id: 'activities', label: 'Activities' },
  { id: 'online', label: 'Online' },
];

const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
const SPOILER_NAME = 'Hidden story trophy';
const SPOILER_TEXT = 'Name, description and guide stay hidden until you earn this trophy. Turn spoiler protection off in the toolbar to reveal it now.';

export function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (raw && Array.isArray(raw.earned)) {
      return {
        earned: new Set(raw.earned),
        spoiler: raw.spoiler !== false,
        hideEarned: raw.hideEarned === true,
        kind: typeof raw.kind === 'string' ? raw.kind : 'all',
        grade: typeof raw.grade === 'string' ? raw.grade : 'all',
        query: typeof raw.query === 'string' ? raw.query : '',
        selected: typeof raw.selected === 'string' ? raw.selected : null,
      };
    }
  } catch { /* a corrupt save falls through to a fresh state */ }
  return { earned: new Set(), spoiler: true, hideEarned: false, kind: 'all', grade: 'all', query: '', selected: null };
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    earned: [...state.earned],
    spoiler: state.spoiler,
    hideEarned: state.hideEarned,
    kind: state.kind,
    grade: state.grade,
    query: state.query,
    selected: state.selected,
  }));
}

export function isSpoilerHidden(trophy, state) {
  return state.spoiler && trophy.kind === 'story' && !state.earned.has(trophy.name);
}

export function matchesFilters(trophy, state) {
  if (state.kind === 'missable') { if (!trophy.missable) return false; }
  else if (state.kind !== 'all' && trophy.kind !== state.kind) return false;
  if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
  if (state.hideEarned && state.earned.has(trophy.name)) return false;
  if (state.query) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.kind}`.toLowerCase();
    if (!hay.includes(state.query.toLowerCase())) return false;
  }
  return true;
}

export function kindCount(trophies, kindId) {
  if (kindId === 'all') return trophies.length;
  if (kindId === 'missable') return trophies.filter((t) => t.missable).length;
  return trophies.filter((t) => t.kind === kindId).length;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function gradeChip(trophy) {
  return el('span', `chip grade-${trophy.grade}`, trophy.grade.toUpperCase());
}

function badgesFor(trophy) {
  const wrap = el('span', 'badges');
  wrap.append(el('span', `chip kind-${trophy.kind}`, trophy.kind === 'meta' ? 'PLATINUM PATH' : trophy.kind.toUpperCase()));
  if (trophy.missable) wrap.append(el('span', 'chip chip-missable', '⚠ MISSABLE'));
  if (trophy.hidden) wrap.append(el('span', 'chip chip-hidden', 'HIDDEN ON PSN'));
  if (trophy.count) wrap.append(el('span', 'chip chip-count', `TRACKS ${trophy.count.toLocaleString('en-US')}`));
  return wrap;
}

export function renderProgress(trophies, state, els) {
  const total = trophies.length;
  const done = state.earned.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  els.percent.textContent = `${pct}%`;
  els.count.textContent = `${done} of ${total} earned`;
  els.fill.style.width = `${pct}%`;
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const all = trophies.filter((t) => t.grade === g);
    const got = all.filter((t) => state.earned.has(t.name)).length;
    return `${g[0].toUpperCase() + g.slice(1)} ${got}/${all.length}`;
  });
  els.grades.textContent = parts.join(' · ');
}

export function renderKindFilters(trophies, state, container, onPick) {
  container.replaceChildren();
  for (const f of KIND_FILTERS) {
    const btn = el('button', `kind-chip${state.kind === f.id ? ' active' : ''}`, `${f.label} (${kindCount(trophies, f.id)})`);
    btn.type = 'button';
    btn.dataset.kind = f.id;
    btn.addEventListener('click', () => onPick(f.id));
    container.append(btn);
  }
}

export function renderList(trophies, state, container, onToggle, onSelect) {
  container.replaceChildren();
  const shown = trophies.filter((t) => matchesFilters(t, state));
  const sorted = [...shown].sort((a, b) => (GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]) || (a.id - b.id));
  for (const t of sorted) {
    const hidden = isSpoilerHidden(t, state);
    const row = el('article', `trophy-row grade-edge-${t.grade}${state.earned.has(t.name) ? ' earned' : ''}${state.selected === t.name ? ' selected' : ''}`);
    row.dataset.name = t.name;

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'earned-box';
    box.checked = state.earned.has(t.name);
    box.setAttribute('aria-label', `Mark ${hidden ? 'story trophy' : t.name} as earned`);
    box.addEventListener('change', () => onToggle(t.name, box.checked));
    row.append(box);

    const main = el('div', 'trophy-main');
    const titleLine = el('div', 'trophy-title-line');
    titleLine.append(el('h3', 'trophy-name', hidden ? SPOILER_NAME : t.name), gradeChip(t));
    main.append(titleLine);
    main.append(el('p', 'trophy-desc', hidden ? 'Description hidden by spoiler protection.' : t.description));
    main.append(badgesFor(t));
    row.append(main);

    const open = el('button', 'guide-btn', hidden ? 'Locked' : 'Guide ▸');
    open.type = 'button';
    open.disabled = hidden;
    open.addEventListener('click', () => onSelect(t.name));
    row.append(open);

    row.addEventListener('click', (e) => {
      if (!hidden && e.target !== box && e.target !== open) onSelect(t.name);
    });
    container.append(row);
  }
  return shown.length;
}

export function renderDetail(trophies, state, container, onToggle) {
  container.replaceChildren();
  const t = trophies.find((x) => x.name === state.selected) ?? trophies[0];
  if (!t) return;
  const hidden = isSpoilerHidden(t, state);
  container.append(el('p', 'detail-kicker', `Roadmap stage ${t.stage} · Trophy ${t.id} of 55`));
  const head = el('div', 'detail-head');
  head.append(el('h2', 'detail-name', hidden ? SPOILER_NAME : t.name), gradeChip(t));
  container.append(head);
  container.append(badgesFor(t));

  container.append(el('h3', 'detail-label', 'Official description'));
  container.append(el('p', 'detail-desc', hidden ? 'Description hidden by spoiler protection.' : `“${t.description}”`));

  container.append(el('h3', 'detail-label', 'Guide — in our own words'));
  if (hidden) {
    container.append(el('p', 'detail-guide', SPOILER_TEXT));
  } else {
    container.append(el('p', 'detail-guide', t.guide));
    if (t.missable) {
      container.append(el('p', 'detail-missable', '⚠ Missable: this one is tied to a one-time story moment or a one-time choice. The guide above says when to act — do not leave it for the post-story mop-up.'));
    }
    if (t.count) {
      container.append(el('p', 'detail-count', `PlayStation tracks a counter for this trophy: ${t.count.toLocaleString('en-US')}. It fills across the whole game, not in one sitting.`));
    }
    container.append(el('p', 'detail-source', `Source: ${t.source} — facts cross-checked against the official PlayStation trophy list; wording is our own.`));
  }

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.earned.has(t.name);
  box.addEventListener('change', () => onToggle(t.name, box.checked));
  const label = el('label', 'detail-earned');
  label.append(box, document.createTextNode(' I have earned this trophy'));
  container.append(label);
}

export function exportProgress(state) {
  const payload = JSON.stringify({
    app: 'leonida-legend-tracker',
    version: 1,
    exported: new Date().toISOString(),
    earned: [...state.earned],
  }, null, 2);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  a.download = 'leonida-legend-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function importProgress(file, trophies) {
  const data = JSON.parse(await file.text());
  const names = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(names)) throw new Error('No earned list in that file.');
  const known = new Set(trophies.map((t) => t.name));
  return new Set(names.filter((n) => known.has(n)));
}
