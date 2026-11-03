import { api, itemsById } from '../api.js';
import { emptyState, errorState, esc, fmtEffect, iconTile, itemCard, monsterCard, mountCard, plural, skeleton } from '../ui.js';

async function section(id, placeholder, render) {
  const el = document.getElementById(id);
  el.innerHTML = placeholder;
  try {
    await render(el);
  } catch (error) {
    errorState(el, error);
  }
}

section('counts', '', async (el) => {
  const s = await api('/stats');
  const count = (n, label) => `<span><b class="mr-1 font-display text-lg text-ink">${n}</b>${label}</span>`;
  el.innerHTML = count(s.equipment, 'équipements') + count(s.sets, 'panoplies') + count(s.monsters, 'monstres') + count(s.mounts, 'montures');
});

section('types', skeleton(8, 'h-32'), async (el) => {
  const types = await api('/items/types');
  if (!types.length) return void (el.innerHTML = emptyState('Aucun type pour le moment.'));
  el.innerHTML = types.map((t) => `<a href="/objets.html?type=${encodeURIComponent(t.type)}" class="panel flex flex-col items-center gap-2 px-1 py-3 text-center text-xs font-semibold text-ink no-underline hover:border-brass sm:px-2 sm:py-4 sm:text-sm">
    ${iconTile(t.image, '', 'size-14 sm:size-[76px]', 'size-12 sm:size-16')}${esc(t.type)}<small class="font-normal text-muted">${plural(t.count, 'objet')}</small></a>`).join('');
  document.getElementById('quick').innerHTML = types.slice(0, 5)
    .map((t) => `<a class="chip" href="/objets.html?type=${encodeURIComponent(t.type)}">${esc(t.type)}</a>`).join('');
});

section('featured-set', skeleton(1, 'h-72'), async (el) => {
  const { data } = await api('/sets', { limit: 1 });
  const set = data[0];
  if (!set) return void (el.innerHTML = emptyState('Aucune panoplie pour le moment.'));
  const items = await itemsById(set.itemIds);
  const highlights = set.bonuses.filter((b) => b.pieces % 2 === 0 || b.pieces === set.itemIds.length);
  el.innerHTML = `<div class="panel grid overflow-hidden lg:grid-cols-[1.3fr_1fr]">
    <div class="grid grid-cols-4 gap-2 p-4 sm:gap-4 sm:p-7">
      ${set.itemIds.map((id) => items.get(id)).filter(Boolean).map((p) => `<a href="/objet.html?id=${p.ankamaId}" class="flex flex-col items-center gap-1.5 text-center text-[11px] text-ink no-underline sm:text-sm">
        ${iconTile(p.image, '', 'size-16 sm:size-[84px]', 'size-14 sm:size-[72px]')}${esc(p.name)}</a>`).join('')}
    </div>
    <div class="flex flex-col gap-3.5 bg-wood p-5 text-parch-light sm:p-7">
      <span class="ornament text-gold before:bg-gold after:bg-gold">NIVEAU ${set.level} · ${set.itemIds.length} OBJETS</span>
      <h3 class="m-0 text-2xl"><a href="/panoplie.html?id=${set.ankamaId}" class="text-parch-light no-underline hover:underline">${esc(set.name)}</a></h3>
      ${highlights.map((b) => `<div class="grid grid-cols-[74px_1fr] gap-2.5 border-t border-gold/35 pt-2.5 text-sm">
        <b class="font-display text-gold">${b.pieces} objets</b><span>${b.effects.slice(0, 4).map((e) => esc(fmtEffect(e))).join(' · ')}</span></div>`).join('')}
    </div>
  </div>`;
});

section('items', skeleton(8, 'h-48'), async (el) => {
  const [{ data: items }, { data: sets }] = await Promise.all([
    api('/items', { category: 'equipment', limit: 8 }),
    api('/sets', { limit: 100 }),
  ]);
  const setNames = new Map(sets.map((s) => [s.ankamaId, s.name]));
  el.innerHTML = items.length ? items.map((i) => itemCard(i, setNames.get(i.setId))).join('') : emptyState('Aucun équipement pour le moment.');
});

section('monsters', skeleton(8, 'h-72'), async (el) => {
  const { data: monsters } = await api('/monsters', { limit: 8 });
  const items = await itemsById(monsters.flatMap((m) => m.drops.map((d) => d.itemId)));
  el.innerHTML = monsters.length ? monsters.map((m) => monsterCard(m, items)).join('') : emptyState('Aucun monstre pour le moment.');
});

section('mounts', skeleton(6, 'h-44'), async (el) => {
  const { data } = await api('/mounts', { limit: 6 });
  el.innerHTML = data.length ? data.map(mountCard).join('') : emptyState('Aucune monture pour le moment.');
});
