import { api, itemsById } from '../api.js';
import { debounce, emptyState, errorState, hrefWith, monsterCard, pager, plural, readParams, skeleton } from '../ui.js';

const PAGE_SIZE = 16;
const FIELDS = ['q', 'boss', 'minLevel', 'maxLevel'];
const form = document.getElementById('filters');
const grid = document.getElementById('grid');
const count = document.getElementById('count');
const pagerEl = document.getElementById('pager');

let state = readParams();
let requestId = 0;

async function load() {
  const id = ++requestId;
  grid.innerHTML = skeleton(8, 'h-72');
  try {
    const res = await api('/monsters', { ...state, limit: PAGE_SIZE });
    const items = await itemsById(res.data.flatMap((m) => m.drops.map((d) => d.itemId)));
    if (id !== requestId) return;
    count.textContent = plural(res.total, 'monstre');
    grid.innerHTML = res.data.length ? res.data.map((m) => monsterCard(m, items)).join('') : emptyState('Aucun monstre ne correspond à ces filtres.');
    pagerEl.innerHTML = pager(res.page, res.pages, (p) => hrefWith({ ...state, page: p }));
  } catch (error) {
    if (id === requestId) errorState(grid, error);
  }
}

const onFilter = () => {
  state = Object.fromEntries(FIELDS.map((name) => [name, form.elements[name].value.trim()]));
  history.replaceState(null, '', hrefWith(state));
  load();
};
form.addEventListener('input', debounce(onFilter, 250));
form.addEventListener('submit', (event) => {
  event.preventDefault();
  onFilter();
});

for (const name of FIELDS) form.elements[name].value = state[name] ?? '';
load();
