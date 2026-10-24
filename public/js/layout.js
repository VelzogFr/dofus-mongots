// En-tete et pied de page communs. La page indique sa rubrique via <body data-nav="...">.
const NAV = [
  ['objets', '/objets.html', 'Objets'],
  ['panoplies', '/panoplies.html', 'Panoplies'],
  ['bestiaire', '/bestiaire.html', 'Bestiaire'],
  ['montures', '/montures.html', 'Montures'],
];

const LOGO = '<img src="/favicon.svg" alt="" width="40" height="40" class="size-10">';

export function renderLayout() {
  const current = document.body.dataset.nav;
  const header = document.querySelector('[data-layout="header"]');
  const footer = document.querySelector('[data-layout="footer"]');

  header.className = 'border-b-[3px] border-brass bg-wood-dark';
  header.innerHTML = `<div class="page flex flex-wrap items-center gap-x-8 gap-y-2 py-3">
    <a href="/" class="flex items-center gap-3 font-display text-xl font-bold tracking-wide text-parch no-underline">${LOGO}Grimoire des Douze</a>
    <nav aria-label="Navigation principale" class="-mx-1 flex w-full gap-1 overflow-x-auto sm:w-auto">
      ${NAV.map(([key, href, label]) => `<a href="${href}" class="whitespace-nowrap px-3 py-2.5 no-underline ${key === current ? 'border-b-2 border-gold text-parch' : 'text-[#d9c9a3] hover:text-parch'}"${key === current ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
    </nav>
  </div>`;

  footer.className = 'mt-auto bg-wood-dark py-7 text-sm text-[#d9c9a3]';
  footer.innerHTML = `<div class="page flex flex-wrap justify-between gap-3">
    <span>Projet fan non officiel. Dofus est une marque d'Ankama.</span>
    <span>Données et images : <a class="text-gold" href="https://api.dofusdu.de" rel="noopener">api.dofusdu.de</a>, <a class="text-gold" href="https://api.dofusdb.fr" rel="noopener">api.dofusdb.fr</a></span>
  </div>`;
}

renderLayout();
