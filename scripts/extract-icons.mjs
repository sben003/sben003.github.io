/**
 * Extrait une fois pour toutes les tracés Simple Icons nécessaires vers
 * src/data/brand-icons.ts : le site n'embarque que les tracés utilisés,
 * sans dépendance d'exécution.
 *   npm i --no-save simple-icons && node scripts/extract-icons.mjs
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
  'tensorflow', 'keras', 'pytorch', 'opencv', 'flask',
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
 * Tracés de marques issus de Simple Icons (https://simple-icons.org), sous licence CC0.
 * Les marques appartiennent à leurs détenteurs. Fichier généré par
 * scripts/extract-icons.mjs — ne pas éditer à la main, ne pas « optimiser » :
 * arrondir les décimales rend les séquences de nombres ambiguës et corrompt les glyphes.
 */
export interface BrandIcon { t: string; d: string }

`;

writeFileSync(
  new URL('../src/data/brand-icons.ts', import.meta.url),
  header + 'export const brandIcons: Record<string, BrandIcon> = ' + JSON.stringify(out, null, 0) + ';\n',
  'utf8'
);

console.log('icônes extraites :', Object.keys(out).length);
console.log('absentes         :', missing.length ? missing.join(' ') : '(aucune)');
console.log('poids des tracés :', (bytes / 1024).toFixed(1), 'Ko bruts');
