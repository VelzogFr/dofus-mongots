import { api, itemsById } from '../api.js';
import { debounce, emptyState, errorState, esc, hrefWith, iconTile, pager, plural, readParams, skeleton } from '../ui.js';

const PAGE_SIZE = 12;
const form = document.getElementById('filters');
const grid = document.getElementById('grid');
const count = document.getElementById('count');
const pagerEl = document.getElementById('pager');

let state = readParams();
let requestId = 0;

const setCard = (set, items) => `<a href="/panoplie.html?id=${set.ankamaId}" class="panel flex flex-col gap-4 p-5 text-ink no-underline transition hover:-translate-y-0.5 hover:border-brass">
  <div class="flex flex-wrap items-baseline justify-between gap-2">
    <h2 class="m-0 text-xl">${esc(set.name)}</h2>
    <span class="chip chip-on">Niv. ${set.level}</span>
  </div>
  <div class="grid grid-cols-4 gap-2 sm:grid-cols-8">${set.itemIds.map((id) => items.get(id)).filter(Boolean)
    .map((i) => iconTile(i.image, i.name, 'size-14 sm:size-12', 'size-12 sm:size-10')).join('')}</div>
  <span class="text-sm text-muted">${plural(set.itemIds.length, 'objet')} · ${plural(set.bonuses.length, 'palier')} de bonus</span>
</a>`;

async function load() {
  const id = ++requestId;
  grid.innerHTML = skeleton(4, 'h-44');
  try {
    const res = await api('/sets', { ...state, limit: PAGE_SIZE });
    const items = await itemsById(res.data.flatMap((s) => s.itemIds));
    if (id !== requestId) return;
    count.textContent = plural(res.total, 'panoplie');
    grid.innerHTML = res.data.length ? res.data.map((s) => setCard(s, items)).join('') : emptyState('Aucune panoplie ne correspond.');
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
