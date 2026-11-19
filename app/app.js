// app.js — entry point for Leonida Legend (GTA VI trophy guide & tracker).
// Boots the page: loads the trophy data, restores the saved tracker state and
// the remembered filters, wires every control, and renders the first view.
// Leonida Legend — GTA VI trophy guide & tracker (offline, static, no build step).
// Loads the official trophy list from data/trophies.json, wires the tracker
// (tracker.js) and the roadmap (roadmap.js) to the page, and keeps every control
// in one saved state: progress, filters, spoiler protection and selection all
// survive a reload because they live in localStorage.

import {
  loadState, saveState, renderProgress, renderKindFilters, renderList, renderDetail,
  exportProgress, importProgress,
} from './tracker.js';
import { renderRoadmap } from './roadmap.js';

let doc;
try {
  doc = await (await fetch('data/trophies.json')).json();
} catch {
  doc = { trophies: [] }; // a missing or corrupt data file must not break the page
}
const trophies = Array.isArray(doc.trophies) ? doc.trophies : [];
const state = loadState();
if (!state.selected || !trophies.some((t) => t.name === state.selected)) {
  state.selected = trophies[0]?.name ?? null;
}

const els = {
  percent: document.getElementById('progress-percent'),
  count: document.getElementById('progress-count'),
  fill: document.getElementById('progress-fill'),
  grades: document.getElementById('progress-grades'),
  search: document.getElementById('search'),
  kindFilters: document.getElementById('kind-filters'),
  gradeFilter: document.getElementById('grade-filter'),
  spoiler: document.getElementById('spoiler-toggle'),
  hideEarned: document.getElementById('hide-earned-toggle'),
  filterStatus: document.getElementById('filter-status'),
  list: document.getElementById('trophy-list'),
  detail: document.getElementById('trophy-detail'),
  roadmap: document.getElementById('roadmap'),
  trackerView: document.getElementById('tracker-view'),
  roadmapView: document.getElementById('roadmap-view'),
  tabTracker: document.getElementById('tab-tracker'),
  tabRoadmap: document.getElementById('tab-roadmap'),
};

function toggleEarned(name, on) {
  if (on) state.earned.add(name);
  else state.earned.delete(name);
  saveState(state);
  renderAll();
}

function selectTrophy(name) {
  state.selected = name;
  saveState(state);
  renderAll();
  showTracker();
}

// Filter memory: the current filters live under their own localStorage key, separate from the
// tracker progress key, so the list reopens exactly as it was left. renderAll() runs after every
// filter change, so saving there keeps the stored filters in step with the visible ones; the
// restore below runs before the toolbar is populated and before the first render.
const FILTER_KEY = 'leonida-legend-filters-v1';

function saveFilters() {
  localStorage.setItem(FILTER_KEY, JSON.stringify({
    kind: state.kind,
    grade: state.grade,
    query: state.query,
    hideEarned: state.hideEarned,
  }));
}

function restoreFilters() {
  try {
    const raw = JSON.parse(localStorage.getItem(FILTER_KEY) ?? 'null');
    if (!raw) return;
    if (typeof raw.kind === 'string') state.kind = raw.kind;
    if (typeof raw.grade === 'string') state.grade = raw.grade;
    if (typeof raw.query === 'string') state.query = raw.query;
    state.hideEarned = raw.hideEarned === true;
  } catch { /* a corrupt filter save is ignored; the loaded tracker state still applies */ }
}

restoreFilters();

function renderAll() {
  saveFilters();
  renderProgress(trophies, state, els);
  renderKindFilters(trophies, state, els.kindFilters, (kind) => {
    state.kind = kind;
    saveState(state);
    renderAll();
  });
  const shown = renderList(trophies, state, els.list, toggleEarned, selectTrophy);
  renderDetail(trophies, state, els.detail, toggleEarned);
  renderRoadmap(trophies, state, els.roadmap, selectTrophy);
  const filtering = state.kind !== 'all' || state.grade !== 'all' || state.query || state.hideEarned;
  els.filterStatus.textContent = filtering
    ? `Showing ${shown} of ${trophies.length} trophies — filters active.`
    : `Showing ${shown} of ${trophies.length} trophies. Progress is saved in this browser automatically.`;
}

function showTracker() {
  els.trackerView.hidden = false;
  els.roadmapView.hidden = true;
  els.tabTracker.classList.add('active');
  els.tabRoadmap.classList.remove('active');
}

function showRoadmap() {
  els.trackerView.hidden = true;
  els.roadmapView.hidden = false;
  els.tabTracker.classList.remove('active');
  els.tabRoadmap.classList.add('active');
}

els.search.value = state.query;
els.gradeFilter.value = state.grade;
els.spoiler.checked = state.spoiler;
els.hideEarned.checked = state.hideEarned;

els.search.addEventListener('input', () => { state.query = els.search.value; saveState(state); renderAll(); });
document.addEventListener('keydown', (event) => {
  if (event.key !== '/') return;
  const tag = event.target?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  event.preventDefault();
  els.search.focus();
});
els.gradeFilter.addEventListener('change', () => { state.grade = els.gradeFilter.value; saveState(state); renderAll(); });
els.spoiler.addEventListener('change', () => { state.spoiler = els.spoiler.checked; saveState(state); renderAll(); });
els.hideEarned.addEventListener('change', () => { state.hideEarned = els.hideEarned.checked; saveState(state); renderAll(); });
els.tabTracker.addEventListener('click', showTracker);
els.tabRoadmap.addEventListener('click', showRoadmap);
document.getElementById('export-btn').addEventListener('click', () => exportProgress(state));
const importFile = document.getElementById('import-file');
document.getElementById('import-btn').addEventListener('click', () => importFile.click());
importFile.addEventListener('change', async () => {
  const file = importFile.files[0];
  if (!file) return;
  try {
    state.earned = await importProgress(file, trophies);
    saveState(state);
    renderAll();
  } catch {
    els.filterStatus.textContent = 'That file could not be read as a progress file — nothing was changed.';
  }
  importFile.value = '';
});

renderAll();
