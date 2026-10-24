import { api } from '../api.js';
import { debounce, emptyState, errorState, esc, hrefWith, itemCard, pager, plural, readParams, skeleton } from '../ui.js';

const PAGE_SIZE = 24;
const FIELDS = ['q', 'category', 'type', 'minLevel', 'maxLevel'];

const form = document.getElementById('filters');
const grid = document.getElementById('grid');
const count = document.getElementById('count');
const pagerEl = document.getElementById('pager');
const typeSelect = document.getElementById('f-type');

let state = readParams();
let setNames = new Map();
let requestId = 0;

function fillForm() {
  for (const name of FIELDS) form.elements[name].value = state[name] ?? '';
}

async function load() {
  const id = ++requestId; // ignore les reponses arrivees dans le desordre
  grid.innerHTML = skeleton(6, 'h-48');
  try {
    const res = await api('/items', { ...state, limit: PAGE_SIZE });
    if (id !== requestId) return;
    count.textContent = plural(res.total, 'résultat');
    grid.innerHTML = res.data.length ? res.data.map((i) => itemCard(i, setNames.get(i.setId))).join('') : emptyState('Aucun objet ne correspond à ces filtres.');
    pagerEl.innerHTML = pager(res.page, res.pages, (p) => hrefWith({ ...state, page: p }));
  } catch (error) {
    if (id === requestId) errorState(grid, error);
  }
}

// Un filtre modifie : retour page 1, URL mise a jour sans rechargement
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

async function init() {
  try {
    const [types, sets] = await Promise.all([api('/items/types'), api('/sets', { limit: 100 })]);
    typeSelect.insertAdjacentHTML('beforeend', types.map((t) => `<option value="${esc(t.type)}">${esc(t.type)} (${t.count})</option>`).join(''));
    setNames = new Map(sets.data.map((s) => [s.ankamaId, s.name]));
  } catch (error) {
    console.error(error);
  }
  fillForm();
  if (state.q) document.title = `${state.q} — Objets — Grimoire des Douze`;
  load();
}

init();
