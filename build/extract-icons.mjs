/**
 * Extrait une fois pour toutes les tracés Simple Icons nécessaires
 * vers build/brand-icons.mjs, pour que le dépôt du portfolio n'ait
 * aucune dépendance npm.
 */
import * as si from 'simple-icons';
import { writeFileSync } from 'node:fs';

const SLUGS = [
  'python', 'pandas', 'numpy', 'scikitlearn', 'postgresql', 'timescale',
  'mysql', 'sqlite', 'talend', 'streamlit',
  'react', 'typescript', 'javascript', 'html5', 'bootstrap', 'vuedotjs',
  'fastapi', 'php', 'nestjs', 'openjdk',
  'docker', 'googlecloud', 'nginx', 'linux', 'git', 'gitlab', 'pytest',
  'gnubash', 'jupyter',
];

const key = (s) => 'si' + s.charAt(0).toUpperCase() + s.slice(1);

const out = {};
let missing = [];
let bytes = 0;
for (const slug of SLUGS) {
  const ico = si[key(slug)];
  if (!ico || !ico.path) { missing.push(slug); continue; }
  out[slug] = { t: ico.title, d: ico.path };
  bytes += ico.path.length;
}

const header = `/**
 * Tracés de marques issus de Simple Icons (https://simple-icons.org),
 * icônes sous licence CC0 1.0. Les marques appartiennent à leurs détenteurs.
 *
 * Fichier GÉNÉRÉ — ne pas éditer à la main.
 * Régénération : voir la section « Icônes » du README.
 *
 * Chaque entrée : { t: titre officiel, d: tracé SVG dans une viewBox 0 0 24 24 }
 */
`;

writeFileSync(
  new URL('./brand-icons.mjs', import.meta.url),
  header + 'export const brandIcons = ' + JSON.stringify(out, null, 0) + ';\n',
  'utf8'
);

console.log('icônes extraites :', Object.keys(out).length);
console.log('absentes         :', missing.length ? missing.join(' ') : '(aucune)');
console.log('poids des tracés :', (bytes / 1024).toFixed(1), 'Ko bruts');
