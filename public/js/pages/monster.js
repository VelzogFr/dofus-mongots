import { api } from '../api.js';
import { errorState, esc, hpOf, img, levelsOf, pct, ratesLabel, readParams, skeleton } from '../ui.js';

const content = document.getElementById('content');

function render(monster) {
  document.title = `${monster.name} — Grimoire des Douze`;
  const grades = monster.grades;
  content.innerHTML = `
    <nav aria-label="Fil d'Ariane" class="flex flex-wrap gap-2 text-sm text-muted">
      <a href="/bestiaire.html">Bestiaire</a><span aria-hidden="true">›</span><span>${esc(monster.name)}</span></nav>

    <section class="panel grid items-center gap-6 overflow-hidden sm:grid-cols-[minmax(0,320px)_1fr]">
      <div class="relative grid h-64 place-items-center bg-[radial-gradient(circle_at_50%_75%,#fff7e0,#e6d3a3)] sm:h-full sm:min-h-72">
        ${img(monster.image, monster.name, 'h-52 w-[86%] object-contain drop-shadow-[0_10px_8px_rgba(43,29,16,.3)]')}
        ${monster.boss ? '<span class="absolute top-3 right-3 rounded-full bg-blood px-3 py-1 font-display text-sm font-bold text-parch-light">Boss</span>' : ''}
      </div>
      <div class="flex flex-col gap-4 p-6 sm:p-8">
        ${monster.race ? `<span class="ornament">${esc(monster.race.toUpperCase())}</span>` : ''}
        <h1 class="m-0 text-3xl leading-tight sm:text-5xl">${esc(monster.name)}</h1>
        <dl class="m-0 grid grid-cols-2 gap-3 sm:grid-cols-4">
          ${[['Niveau', levelsOf(grades)], ['Points de vie', hpOf(grades)], ['PA', grades[0]?.ap ?? '–'], ['PM', grades[0]?.mp ?? '–']]
            .map(([label, value]) => `<div class="rounded-lg border border-line bg-parch px-4 py-3"><dt class="text-sm text-muted">${label}</dt><dd class="m-0 font-display text-xl font-bold">${value}</dd></div>`).join('')}
        </dl>
      </div>
    </section>

    <div class="grid items-start gap-6 lg:grid-cols-2">
      <section class="panel min-w-0 p-5 sm:p-6">
        <h2 class="m-0 mb-4 text-xl text-wood sm:text-2xl">Grades</h2>
        <div class="overflow-x-auto"><table class="w-full border-collapse text-sm">
          <thead><tr class="text-left text-muted">${['Grade', 'Niveau', 'PV', 'PA', 'PM'].map((h) => `<th scope="col" class="pb-2 font-medium">${h}</th>`).join('')}</tr></thead>
          <tbody>${grades.map((g) => `<tr class="border-t border-line tabular-nums">
            <td class="py-2 font-display font-bold text-gold-dark">${g.grade}</td><td class="py-2">${g.level}</td><td class="py-2">${g.lifePoints}</td><td class="py-2">${g.ap}</td><td class="py-2">${g.mp}</td></tr>`).join('')}</tbody>
        </table></div>
      </section>

      <section class="panel min-w-0 p-5 sm:p-6">
        <h2 class="m-0 mb-4 text-xl text-wood sm:text-2xl">Objets lâchés</h2>
        ${monster.drops.length ? `<div class="flex flex-col">${monster.drops.map((d) => `
          <a href="${d.item ? `/objet.html?id=${d.item.ankamaId}` : '#'}" class="grid grid-cols-[48px_1fr_auto] items-center gap-3 border-b border-dashed border-line py-2 text-ink no-underline last:border-0 hover:bg-parch">
            ${d.item ? img(d.item.image, '', 'size-12 object-contain') : '<span></span>'}
            <span>${esc(d.item?.name ?? `Objet #${d.itemId}`)}${d.item ? `<small class="block text-muted">${esc(d.item.type ?? '')} · Niv. ${d.item.level}</small>` : ''}</span>
            <span class="font-display font-bold text-gold-dark" title="Grades 1 à 5 : ${d.rates.map(pct).join(', ')}">${ratesLabel(d.rates)}</span></a>`).join('')}</div>
          <p class="m-0 mt-3 text-sm text-muted">Taux de drop de base, grades 1 à 5. Seuls les objets présents dans l'encyclopédie sont listés.</p>`
        : '<p class="m-0 text-muted">Aucun objet de l\'encyclopédie n\'est lâché par ce monstre.</p>'}
      </section>
    </div>`;
}

async function init() {
  content.innerHTML = skeleton(1, 'h-72') + skeleton(1, 'h-64');
  const id = readParams().id;
  try {
    if (!/^\d+$/.test(id ?? '')) throw Object.assign(new Error('missing id'), { status: 404 });
    render(await api(`/monsters/${id}`));
  } catch (error) {
    errorState(content, error);
  }
}

init();
