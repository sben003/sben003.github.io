/**
 * Allège les tracés de build/brand-icons.mjs.
 *
 *   node build/optimize-icons.mjs
 *
 * Les tracés Simple Icons sont dessinés dans une viewBox 24×24 avec parfois
 * cinq décimales. Affichés à 15 px, cette précision est invisible : on arrondit
 * à 2 décimales et on retire les zéros inutiles. La géométrie ne bouge pas à
 * l'œil, le poids tombe d'environ un tiers.
 *
 * Idempotent : relancer sur un fichier déjà optimisé ne change rien.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { brandIcons } from './brand-icons.mjs';

const round = (path) =>
  path
    // arrondit tout nombre décimal à 2 décimales
    .replace(/-?\d*\.\d+/g, (n) => {
      const v = Math.round(parseFloat(n) * 100) / 100;
      return String(v);
    })
    // "0.5" -> ".5", "-0.5" -> "-.5"
    .replace(/(^|[^\d])0\.(\d)/g, '$1.$2')
    // espace superflu avant un signe moins
    .replace(/\s+-/g, '-')
    .replace(/\s{2,}/g, ' ')
    .trim();

let before = 0;
let after = 0;
const out = {};
for (const [slug, ico] of Object.entries(brandIcons)) {
  const d = round(ico.d);
  before += ico.d.length;
  after += d.length;
  out[slug] = { t: ico.t, d };
}

const src = readFileSync(new URL('./brand-icons.mjs', import.meta.url), 'utf8');
const header = src.slice(0, src.indexOf('export const brandIcons'));

writeFileSync(
  new URL('./brand-icons.mjs', import.meta.url),
  header + 'export const brandIcons = ' + JSON.stringify(out, null, 0) + ';\n',
  'utf8'
);

console.log('tracés : %s o -> %s o  (-%s %%)',
  before, after, (100 - (after / before) * 100).toFixed(1));
