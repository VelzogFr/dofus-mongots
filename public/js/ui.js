const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ENTITIES[c]);

export const safeUrl = (url) => (typeof url === 'string' && url.startsWith('https://') ? esc(url) : '');

const STAT_CLASSES = [
  [/vitalit/i, 'text-stat-vita'],
  [/force|terre/i, 'text-stat-force'],
  [/intelligence|feu/i, 'text-stat-intel'],
  [/chance|eau/i, 'text-stat-chance'],
  [/agilit|air/i, 'text-stat-agi'],
  [/sagesse/i, 'text-stat-sag'],
];
export const statClass = (label) => STAT_CLASSES.find(([re]) => re.test(label))?.[1] ?? 'text-stat-other';
export const statBg = (label) => statClass(label).replace('text-', 'bg-');

export function fmtEffect(effect) {
  const text = effect.text.replace(/^(-?\d+) à (-?\d+)/, '$1 – $2');
  return /^\d/.test(text) ? `+${text}` : text;
}

export const range = (a, b) => (a === b ? `${a}` : `${a} – ${b}`);
export const levelsOf = (grades) => range(Math.min(...grades.map((g) => g.level)), Math.max(...grades.map((g) => g.level)));
export const hpOf = (grades) => range(Math.min(...grades.map((g) => g.lifePoints)), Math.max(...grades.map((g) => g.lifePoints)));
export const pct = (n) => `${String(n).replace('.', ',')} %`;
export const ratesLabel = (rates) => {
  const lo = Math.min(...rates), hi = Math.max(...rates);
  return lo === hi ? pct(lo) : `${pct(lo)} – ${pct(hi)}`;
};
export const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;

export const img = (src, alt = '', cls = '') =>
  `<img src="${safeUrl(src)}" alt="${esc(alt)}" class="${cls}" loading="lazy" decoding="async">`;

export const iconTile = (src, alt = '', size = 'size-16', imgSize = 'size-14') =>
  `<span class="icon-tile ${size}">${img(src, alt, `${imgSize} object-contain`)}</span>`;

export function itemCard(item, setName) {
  return `<a href="/objet.html?id=${item.ankamaId}" class="panel flex flex-col gap-3 p-4 no-underline text-ink transition hover:-translate-y-0.5 hover:border-brass">
    <div class="flex items-center gap-3">${iconTile(item.image, '')}
      <div class="min-w-0"><b class="block font-display text-base leading-tight">${esc(item.name)}</b>
      <small class="text-sm text-muted">${esc(item.type ?? '')} · Niv. ${item.level}</small></div></div>
    ${setName ? `<span class="text-sm italic text-gold-dark">${esc(setName)}</span>` : ''}
    ${item.effects.length ? `<ul class="m-0 flex list-none flex-col gap-0.5 border-t border-dashed border-line p-0 pt-2 text-sm font-medium">
      ${item.effects.slice(0, 4).map((e) => `<li class="${statClass(e.label)}">${esc(fmtEffect(e))}</li>`).join('')}</ul>` : ''}
  </a>`;
}

export function monsterCard(monster, items = new Map()) {
  const drops = monster.drops.map((d) => items.get(d.itemId)).filter(Boolean).slice(0, 6);
  return `<a href="/monstre.html?id=${monster.ankamaId}" class="panel flex flex-col overflow-hidden no-underline text-ink transition hover:-translate-y-0.5 hover:border-brass">
    <div class="relative grid h-36 place-items-center border-b border-line bg-[radial-gradient(circle_at_50%_75%,#fff7e0,#e6d3a3)] sm:h-48">
      ${img(monster.image, monster.name, 'h-28 w-[86%] object-contain drop-shadow-[0_8px_6px_rgba(43,29,16,.25)] sm:h-40')}
      ${monster.boss ? '<span class="absolute top-2 right-2 rounded-full bg-blood px-2.5 py-0.5 font-display text-xs font-bold text-parch-light">Boss</span>' : ''}
    </div>
    <div class="flex flex-1 flex-col gap-0.5 p-3 sm:p-4">
      <h3 class="m-0 text-base sm:text-lg">${esc(monster.name)}</h3>
      <small class="text-muted">${esc(monster.race ?? '')}</small>
      <div class="mt-2 grid grid-cols-1 gap-x-3 border-t border-dashed border-line pt-2 text-sm sm:grid-cols-2">
        <span><b class="font-semibold text-gold-dark">Niv.</b> ${levelsOf(monster.grades)}</span>
        <span><b class="font-semibold text-gold-dark">PV</b> ${hpOf(monster.grades)}</span>
        <span><b class="font-semibold text-gold-dark">PA</b> ${monster.grades[0]?.ap ?? '–'}</span>
        <span><b class="font-semibold text-gold-dark">PM</b> ${monster.grades[0]?.mp ?? '–'}</span>
      </div>
      ${drops.length ? `<div class="mt-2 flex flex-wrap gap-1">${drops.map((i) => img(i.image, i.name, 'size-8 rounded-md border border-line bg-parch object-contain')).join('')}</div>` : ''}
    </div>
  </a>`;
}

export const mountCard = (mount) => `<a href="/monture.html?id=${mount.ankamaId}" class="panel flex flex-col items-center gap-1 p-3 text-center text-sm text-ink no-underline transition hover:-translate-y-0.5 hover:border-brass">
    ${img(mount.image, '', 'size-28 object-contain')}<span>${esc(mount.name)}</span><small class="text-xs text-muted">${esc(mount.family ?? '')}</small></a>`;

export const emptyState = (message) => `<p class="panel col-span-full p-6 text-center text-muted">${esc(message)}</p>`;

export function errorState(target, error) {
  const message = error?.status === 404 ? 'Introuvable.' : 'Impossible de charger les données. Le serveur ou la base est-il démarré ?';
  target.innerHTML = `<div class="panel col-span-full flex flex-col items-center gap-4 p-8 text-center">
    <p class="m-0 font-display text-lg text-blood">${esc(message)}</p><a href="/" class="btn-ghost">Retour à l'accueil</a></div>`;
  console.error(error);
}

export const skeleton = (count, cls) => Array.from({ length: count }, () => `<div class="panel animate-pulse ${cls}"></div>`).join('');

export function pager(page, pages, hrefFor) {
  if (pages <= 1) return '';
  const link = (p, label, on = false) => `<a href="${hrefFor(p)}" class="${on ? 'chip chip-on' : 'chip'} min-h-11 min-w-11 justify-center"${on ? ' aria-current="page"' : ''}>${label}</a>`;
  const nums = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(pages, page + 2); p++) nums.push(link(p, p, p === page));
  return `<nav aria-label="Pagination" class="flex flex-wrap justify-center gap-2">
    ${page > 1 ? link(page - 1, 'Précédent') : ''}${nums.join('')}${page < pages ? link(page + 1, 'Suivant') : ''}</nav>`;
}

export const readParams = () => Object.fromEntries(new URLSearchParams(location.search));
export function hrefWith(params) {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') query.set(k, v);
  const qs = query.toString();
  return `${location.pathname}${qs ? `?${qs}` : ''}`;
}

export function debounce(fn, ms = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
