import { api } from '../api.js';
import { errorState, esc, fmtEffect, img, range, ratesLabel, readParams, skeleton, statBg, statClass } from '../ui.js';

const content = document.getElementById('content');
const card = (title, body) => `<section class="panel p-5 sm:p-6"><h2 class="m-0 mb-4 text-xl text-wood sm:text-2xl">${title}</h2>${body}</section>`;

function effectsBlock(effects) {
  const peak = Math.max(...effects.map((e) => Math.max(e.min, e.max ?? e.min)), 1);
  return effects.map((e) => {
    const hi = e.max ?? e.min;
    const left = Math.max(0, (e.min / peak) * 98);
    const width = Math.max(((hi - e.min) / peak) * 100, 2);
    return `<div class="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 border-b border-dashed border-line py-2.5 last:border-0">
      <span class="font-semibold ${statClass(e.label)}">${esc(e.label)}</span><span class="font-semibold tabular-nums">${range(e.min, hi)}</span>
      <div class="relative col-span-2 h-2.5 overflow-hidden rounded-full bg-parch-deep"><i class="absolute inset-y-0 rounded-full ${statBg(e.label)}" style="left:${left}%;width:${width}%"></i></div>
    </div>`;
  }).join('');
}

function setBlock(set, currentId) {
  return card(`<a href="/panoplie.html?id=${set.ankamaId}" class="text-wood no-underline hover:underline">${esc(set.name)}</a>`, `
    <div class="mb-4 grid grid-cols-4 gap-1.5 sm:gap-3">${set.items.map((p) => `<a href="/objet.html?id=${p.ankamaId}" class="flex flex-col items-center gap-1.5 rounded-lg border p-2 text-center text-[10px] text-ink no-underline sm:text-xs ${p.ankamaId === currentId ? 'border-2 border-brass bg-[#fff7e0]' : 'border-line bg-parch hover:border-brass'}"${p.ankamaId === currentId ? ' aria-current="page"' : ''}>
      ${img(p.image, '', 'size-11 object-contain sm:size-15')}${esc(p.name)}</a>`).join('')}</div>
    <table class="w-full border-collapse text-sm"><tbody>${set.bonuses.map((b) => `<tr class="border-t border-line">
      <th scope="row" class="py-2 pr-3 text-left align-top font-display whitespace-nowrap text-gold-dark">${b.pieces} objets</th>
      <td class="py-2">${b.effects.map((e) => `<span class="${statClass(e.label)}">${esc(fmtEffect(e))}</span>`).join(' · ')}</td></tr>`).join('')}</tbody></table>`);
}

const recipeBlock = (recipe) => card('Recette', `<div class="flex flex-col gap-2.5">${recipe.map((r) => `
  <a href="${r.item ? `/objet.html?id=${r.item.ankamaId}` : '#'}" class="flex items-center gap-3 rounded-lg border border-line bg-parch p-2.5 text-ink no-underline hover:border-brass">
    <b class="min-w-9 font-display text-lg text-gold-dark">${r.quantity}×</b>${r.item ? img(r.item.image, '', 'size-12 object-contain') : ''}
    <span>${esc(r.item?.name ?? `Objet #${r.itemId}`)}${r.item ? `<small class="block text-xs text-muted">${esc(r.item.type ?? '')} · Niv. ${r.item.level}</small>` : ''}</span></a>`).join('')}</div>`);

const dropsBlock = (droppers) => card('Obtenu sur', `${droppers.map((m) => `
  <a href="/monstre.html?id=${m.ankamaId}" class="grid grid-cols-[64px_1fr_auto] items-center gap-3 border-b border-dashed border-line py-2 text-ink no-underline last:border-0">
    <span class="grid size-16 place-items-center rounded-lg bg-[radial-gradient(circle_at_50%_70%,#fff7e0,#e6d3a3)]">${img(m.image, '', 'max-h-14 max-w-14 object-contain')}</span>
    <span><b>${esc(m.name)}</b><small class="block text-muted">${esc(m.race ?? '')} · Niv. ${range(m.levels[0], m.levels[1])}</small></span>
    <span class="font-display font-bold text-gold-dark">${ratesLabel(m.rates)}</span></a>`).join('')}
  <p class="m-0 mt-2.5 text-sm text-muted">Taux de drop de base, grades 1 à 5.</p>`);

function render(item) {
  document.title = `${item.name} — Grimoire des Douze`;
  const { set, recipe, droppedBy, ...doc } = item;
  content.innerHTML = `
    <nav aria-label="Fil d'Ariane" class="flex flex-wrap gap-2 text-sm text-muted">
      <a href="/objets.html">Objets</a><span aria-hidden="true">›</span>
      ${item.type ? `<a href="/objets.html?type=${encodeURIComponent(item.type)}">${esc(item.type)}</a><span aria-hidden="true">›</span>` : ''}
      <span>${esc(item.name)}</span></nav>

    <section class="panel grid items-center justify-items-center gap-6 p-5 text-center sm:grid-cols-[200px_1fr_auto] sm:justify-items-start sm:p-8 sm:text-left">
      <div class="grid size-44 place-items-center rounded-xl border-2 border-brass bg-[radial-gradient(circle_at_50%_42%,#fffaf0_0,#f1e2bd_55%,#d9bd7a_100%)] shadow-[inset_0_0_0_6px_#fbf4e2] sm:size-[200px]">
        ${img(item.image, item.name, 'size-32 object-contain sm:size-40')}</div>
      <div class="flex flex-col items-center gap-3 sm:items-start">
        ${item.type ? `<span class="ornament">${esc(item.type.toUpperCase())}</span>` : ''}
        <h1 class="m-0 text-3xl leading-tight sm:text-5xl">${esc(item.name)}</h1>
        <div class="flex flex-wrap justify-center gap-2"><span class="chip chip-on">Niveau ${item.level}</span>
          <span class="chip">${item.category === 'resource' ? 'Ressource' : 'Équipement'}</span>
          ${set ? `<a class="chip" href="/panoplie.html?id=${set.ankamaId}">${esc(set.name)}</a>` : ''}</div>
        ${item.description ? `<p class="m-0 max-w-xl text-base italic text-[#4a3a26]">« ${esc(item.description)} »</p>` : ''}
      </div>
      <dl class="m-0 grid w-full grid-cols-[auto_auto] gap-x-5 gap-y-1.5 self-start rounded-lg border border-line bg-parch px-5 py-4 text-sm sm:w-auto">
        <dt class="text-muted">Identifiant</dt><dd class="m-0 text-right font-semibold">#${item.ankamaId}</dd>
        <dt class="text-muted">Effets</dt><dd class="m-0 text-right font-semibold">${item.effects.length}</dd>
        <dt class="text-muted">Ingrédients</dt><dd class="m-0 text-right font-semibold">${recipe.length}</dd>
      </dl>
    </section>

    <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div class="flex min-w-0 flex-col gap-6">
        ${item.effects.length ? card('Effets', effectsBlock(item.effects)) : ''}
        ${set ? setBlock(set, item.ankamaId) : ''}
      </div>
      <aside class="flex min-w-0 flex-col gap-6">
        ${recipe.length ? recipeBlock(recipe) : ''}
        ${droppedBy.length ? dropsBlock(droppedBy) : ''}
        <details class="panel p-5 sm:p-6"><summary class="cursor-pointer font-display text-lg text-wood">Document MongoDB</summary>
          <pre class="mt-4 mb-0 overflow-x-auto rounded-lg bg-wood-dark p-4 font-mono text-xs leading-relaxed text-[#f1e2bd]">${esc(`// collection "items"\n${JSON.stringify(doc, null, 2)}`)}</pre></details>
      </aside>
    </div>`;
}

async function init() {
  content.innerHTML = skeleton(1, 'h-64') + skeleton(1, 'h-96');
  const id = readParams().id;
  try {
    if (!/^\d+$/.test(id ?? '')) throw Object.assign(new Error('missing id'), { status: 404 });
    render(await api(`/items/${id}`));
  } catch (error) {
    errorState(content, error);
  }
}

init();
