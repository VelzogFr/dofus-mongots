import { api } from '../api.js';
import { errorState, esc, fmtEffect, img, readParams, skeleton, statClass } from '../ui.js';

const content = document.getElementById('content');

function render(mount) {
  document.title = `${mount.name} — Grimoire des Douze`;
  content.innerHTML = `
    <nav aria-label="Fil d'Ariane" class="flex flex-wrap gap-2 text-sm text-muted">
      <a href="/montures.html">Montures</a><span aria-hidden="true">›</span><span>${esc(mount.name)}</span></nav>

    <section class="panel grid items-center gap-6 overflow-hidden sm:grid-cols-[minmax(0,320px)_1fr]">
      <div class="grid h-64 place-items-center bg-[radial-gradient(circle_at_50%_75%,#fff7e0,#e6d3a3)] sm:h-full sm:min-h-72">
        ${img(mount.image, mount.name, 'h-52 w-[86%] object-contain drop-shadow-[0_10px_8px_rgba(43,29,16,.3)]')}
      </div>
      <div class="flex flex-col gap-4 p-6 sm:p-8">
        ${mount.family ? `<span class="ornament">${esc(mount.family.toUpperCase())}</span>` : ''}
        <h1 class="m-0 text-3xl leading-tight sm:text-5xl">${esc(mount.name)}</h1>
        ${mount.effects.length ? `<div>
          <h2 class="m-0 mb-2 text-xl text-wood sm:text-2xl">Effets</h2>
          <ul class="m-0 flex list-none flex-col gap-1 p-0 font-medium">
            ${mount.effects.map((e) => `<li class="${statClass(e.label)}">${esc(fmtEffect(e))}</li>`).join('')}</ul></div>`
        : '<p class="m-0 text-muted">Aucun effet connu pour cette monture.</p>'}
      </div>
    </section>`;
}

async function init() {
  content.innerHTML = skeleton(1, 'h-72');
  const id = readParams().id;
  try {
    if (!/^\d+$/.test(id ?? '')) throw Object.assign(new Error('missing id'), { status: 404 });
    render(await api(`/mounts/${id}`));
  } catch (error) {
    errorState(content, error);
  }
}

init();
