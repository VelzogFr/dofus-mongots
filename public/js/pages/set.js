import { api } from '../api.js';
import { errorState, esc, fmtEffect, itemCard, readParams, skeleton } from '../ui.js';

const content = document.getElementById('content');

function render(set) {
  document.title = `${set.name} — Grimoire des Douze`;
  content.innerHTML = `
    <nav aria-label="Fil d'Ariane" class="flex flex-wrap gap-2 text-sm text-muted">
      <a href="/panoplies.html">Panoplies</a><span aria-hidden="true">›</span><span>${esc(set.name)}</span></nav>

    <section class="panel grid overflow-hidden lg:grid-cols-[1fr_1.1fr]">
      <div class="flex flex-col justify-center gap-3 p-6 sm:p-8">
        <span class="ornament">PANOPLIE</span>
        <h1 class="m-0 text-3xl leading-tight sm:text-5xl">${esc(set.name)}</h1>
        <div class="flex flex-wrap gap-2"><span class="chip chip-on">Niveau ${set.level}</span><span class="chip">${set.items.length} objets</span></div>
      </div>
      <div class="bg-wood p-6 text-parch-light sm:p-8">
        <h2 class="m-0 mb-3 text-xl text-gold">Bonus de panoplie</h2>
        <table class="w-full border-collapse text-sm"><tbody>${set.bonuses.map((b) => `<tr class="border-t border-gold/35">
          <th scope="row" class="py-2 pr-3 text-left align-top font-display whitespace-nowrap text-gold">${b.pieces} objets</th>
          <td class="py-2">${b.effects.map((e) => esc(fmtEffect(e))).join(' · ')}</td></tr>`).join('')}</tbody></table>
      </div>
    </section>

    <section aria-labelledby="pieces-title" class="flex flex-col gap-4">
      <h2 id="pieces-title" class="section-title">Pièces</h2>
      <div class="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">${set.items.map((i) => itemCard(i)).join('')}</div>
    </section>`;
}

async function init() {
  content.innerHTML = skeleton(1, 'h-56') + skeleton(1, 'h-96');
  const id = readParams().id;
  try {
    if (!/^\d+$/.test(id ?? '')) throw Object.assign(new Error('missing id'), { status: 404 });
    render(await api(`/sets/${id}`));
  } catch (error) {
    errorState(content, error);
  }
}

init();
