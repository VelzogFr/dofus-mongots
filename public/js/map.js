// Carte parchemin decorative de l'accueil (dessin original, sans toponymes)
const INK = '#2b1d10';

// Pseudo-aleatoire deterministe : la carte est identique a chaque chargement
function rng(seed) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

export function mapSvg() {
  const r = rng(7);
  const W = 1200, H = 440;
  let trees = '', mountains = '', hills = '';
  for (let i = 0; i < 70; i++) {
    trees += `<circle cx="${(560 + r() * 260).toFixed(0)}" cy="${(220 + r() * 150).toFixed(0)}" r="${(6 + r() * 5).toFixed(1)}" fill="#7f8a4a" stroke="${INK}" stroke-width="1.5"/>`;
  }
  for (let i = 0; i < 9; i++) {
    const x = 860 + i * 34 + r() * 10, y = 120 + (i % 3) * 26, h = 40 + r() * 30;
    mountains += `<path d="M${x - 28} ${y + 30}L${x} ${y + 30 - h}L${x + 28} ${y + 30}z" fill="#c2a878" stroke="${INK}" stroke-width="2"/><path d="M${x} ${y + 30 - h}l-8 ${h * 0.35}h16z" fill="#f6efdc"/>`;
  }
  for (let i = 0; i < 26; i++) {
    const x = 160 + r() * 380, y = 120 + r() * 240;
    hills += `<path d="M${x - 14} ${y}q14-16 28 0" fill="none" stroke="#6b5436" stroke-width="2"/>`;
  }
  const town = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-10 0v-12l10-9 10 9V0z" fill="#a5532b" stroke="${INK}" stroke-width="2"/><rect x="-3" y="-7" width="6" height="7" fill="${INK}"/></g>`;
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" class="block size-full" aria-hidden="true">
    <defs><radialGradient id="parch" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#f1e2bd"/><stop offset="1" stop-color="#c9a76a"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#parch)"/>
    <path d="M0 330q90-30 150 10t150 40q60 10 100 60H0z" fill="#9cc0c6" stroke="${INK}" stroke-width="2.5"/>
    <path d="M420 0q-30 80 30 140t-10 150q-40 70 40 150" fill="none" stroke="#5f8a94" stroke-width="7"/>
    <path d="M420 0q-30 80 30 140t-10 150q-40 70 40 150" fill="none" stroke="#9cc0c6" stroke-width="4"/>
    ${hills}${trees}${mountains}
    <path d="M250 170C340 150 380 240 470 250S600 200 700 250 820 160 930 200" fill="none" stroke="#a5532b" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/>
    ${town(250, 170)}${town(470, 250)}${town(700, 250)}${town(930, 200)}${town(1080, 330)}${town(170, 300)}
    <g transform="translate(1110 90)" stroke="${INK}" stroke-width="2"><circle r="34" fill="#f6efdc"/><path d="M0-30l7 30-7 30-7-30z" fill="#a5532b"/><path d="M-30 0l30 7 30-7-30-7z" fill="#c2a878"/></g>
    <rect x="8" y="8" width="${W - 16}" height="${H - 16}" fill="none" stroke="${INK}" stroke-width="3"/>
  </svg>`;
}
