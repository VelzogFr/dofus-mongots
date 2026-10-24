import { api } from '../api.js';
import { debounce, emptyState, errorState, hrefWith, mountCard, pager, plural, readParams, skeleton } from '../ui.js';

const PAGE_SIZE = 24;
const form = document.getElementById('filters');
const grid = document.getElementById('grid');
const count = document.getElementById('count');
const pagerEl = document.getElementById('pager');

let state = readParams();
let requestId = 0;

async function load() {
  const id = ++requestId;
  grid.innerHTML = skeleton(8, 'h-44');
  try {
    const res = await api('/mounts', { ...state, limit: PAGE_SIZE });
    if (id !== requestId) return;
    count.textContent = plural(res.total, 'monture');
    grid.innerHTML = res.data.length ? res.data.map(mountCard).join('') : emptyState('Aucune monture ne correspond.');
    pagerEl.innerHTML = pager(res.page, res.pages, (p) => hrefWith({ ...state, page: p }));
  } catch (error) {
    if (id === requestId) errorState(grid, error);
  }
}

const onFilter = () => {
  state = { q: form.elements.q.value.trim() };
  history.replaceState(null, '', hrefWith(state));
  load();
};
form.addEventListener('input', debounce(onFilter, 250));
form.addEventListener('submit', (event) => {
  event.preventDefault();
  onFilter();
});

form.elements.q.value = state.q ?? '';
load();
