/**
 * Générateur statique du portfolio.
 *
 *   node build/render.mjs
 *
 * Lit data/skills.mjs et data/projects.mjs, produit le HTML des sections
 * « Projet vedette », « Projets » et « Compétences », et l'injecte dans les
 * pages FR et EN entre des marqueurs <!-- gen:NOM:start --> … <!-- gen:NOM:end -->.
 *
 * Aucune dépendance npm : les tracés d'icônes sont figés dans
 * build/brand-icons.mjs. Le site publié reste du HTML statique — rien de ce
 * fichier n'est envoyé au navigateur.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { domains, practices, levels, showBrandIcons } from '../data/skills.mjs';
import { featured, projects } from '../data/projects.mjs';
import { brandIcons } from './brand-icons.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* ------------------------------------------------------------------ outils */

/** Échappe le texte destiné au HTML. Toute donnée passe par ici. */
const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Choisit la variante linguistique d'un champ { fr, en } ou d'une chaîne. */
const t = (field, lang) =>
  field && typeof field === 'object' && !Array.isArray(field) ? field[lang] : field;

/** Identifiant de symbole dans le sprite SVG. */
const symId = (slug) => `si-${slug}`;

/* Glyphes maison pour les en-têtes de domaine et les boutons.
   Tracés volontairement simples : ils doivent rester lisibles à 18 px. */
const GLYPHS = {
  database: '<path d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  code: '<path d="m8 6-6 6 6 6"/><path d="m16 6 6 6-6 6"/><path d="M13 4 11 20"/>',
  cloud: '<path d="M6.5 18A4.5 4.5 0 0 1 6 9.05 6 6 0 0 1 17.7 8 4.5 4.5 0 0 1 17.5 18z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5.5-5.5 2 2-5.5z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  download: '<path d="M12 3v12M7 11l5 5 5-5M4 20h16"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
};

const glyph = (name, cls = 'glyph') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${GLYPHS[name]}</svg>`;

/* --------------------------------------------------------------- le sprite */

/**
 * Les icônes de marque réellement référencées, pour ne rien embarquer
 * d'inutile. La stack du projet vedette en porte toujours ; les badges de
 * compétences seulement si data/skills.mjs le demande (showBrandIcons).
 */
function collectUsedIcons() {
  const used = new Set();
  for (const s of featured.stack) {
    if (s.icon && brandIcons[s.icon]) used.add(s.icon);
  }
  if (showBrandIcons) {
    for (const d of domains) for (const g of d.groups) for (const i of g.items) {
      if (i.icon && brandIcons[i.icon]) used.add(i.icon);
    }
  }
  return [...used].sort();
}

/** Référence vers un symbole du sprite. */
const useIcon = (slug, cls) =>
  `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#${symId(slug)}"/></svg>`;

/**
 * Sprite SVG : chaque tracé n'est écrit qu'une fois, les badges y renvoient
 * par <use>. Inliner chaque tracé à chaque badge multiplierait le poids.
 */
function renderSprite(slugs) {
  const symbols = slugs
    .map((s) => `<symbol id="${symId(s)}" viewBox="0 0 24 24"><path d="${brandIcons[s].d}"/></symbol>`)
    .join('');
  return (
    '<svg class="icon-sprite" aria-hidden="true" focusable="false" width="0" height="0">' +
    `<defs>${symbols}</defs></svg>`
  );
}

/* ------------------------------------------------------- section Compétences */

function renderBadge(item, lang) {
  const lvl = levels[item.level][lang];
  const mark =
    showBrandIcons && item.icon && brandIcons[item.icon]
      ? useIcon(item.icon, 'badge__icon')
      : showBrandIcons
        ? '<span class="badge__icon badge__icon--none" aria-hidden="true"></span>'
        : '';
  return (
    `<li class="badge badge--${item.level}">` +
    mark +
    `<span class="badge__name">${esc(item.name)}</span>` +
    `<span class="badge__level" title="${esc(lvl.title)}">${esc(lvl.label)}</span>` +
    '</li>'
  );
}

function renderDomain(d, lang) {
  const groups = d.groups
    .map(
      (g) =>
        '<div class="skill-group">' +
        `<h4 class="skill-group__label">${esc(t(g.label, lang))}</h4>` +
        `<ul class="badges">${g.items.map((i) => renderBadge(i, lang)).join('')}</ul>` +
        '</div>'
    )
    .join('');

  const uses = t(d.uses, lang)
    .map((u) => `<li>${esc(u)}</li>`)
    .join('');

  return (
    `<article class="bento__card bento__card--span${d.span}" aria-labelledby="dom-${d.id}">` +
    '<header class="bento__head">' +
    `<span class="bento__glyph" aria-hidden="true">${glyph(d.glyph)}</span>` +
    `<h3 class="bento__title" id="dom-${d.id}">${esc(t(d.title, lang))}</h3>` +
    '</header>' +
    `<p class="bento__lede">${esc(t(d.lede, lang))}</p>` +
    `<div class="skill-groups">${groups}</div>` +
    `<ul class="use-tags">${uses}</ul>` +
    '</article>'
  );
}

function renderPractices(lang) {
  const items = practices.items
    .map(
      (p) =>
        '<div class="practice">' +
        `<dt>${esc(t(p.name, lang))}</dt>` +
        `<dd>${esc(t(p.detail, lang))}</dd>` +
        '</div>'
    )
    .join('');
  return (
    '<article class="bento__card bento__card--span2" aria-labelledby="dom-practices">' +
    '<header class="bento__head">' +
    `<span class="bento__glyph" aria-hidden="true">${glyph(practices.glyph)}</span>` +
    `<h3 class="bento__title" id="dom-practices">${esc(t(practices.title, lang))}</h3>` +
    '</header>' +
    `<p class="bento__lede">${esc(t(practices.lede, lang))}</p>` +
    `<dl class="practices">${items}</dl>` +
    '</article>'
  );
}

function renderSkills(lang) {
  const legend =
    '<p class="bento__legend">' +
    `<span class="badge badge--production"><span class="badge__level">${esc(levels.production[lang].label)}</span></span>` +
    `<span class="legend__text">${esc(levels.production[lang].title)}</span>` +
    `<span class="badge badge--projet"><span class="badge__level">${esc(levels.projet[lang].label)}</span></span>` +
    `<span class="legend__text">${esc(levels.projet[lang].title)}</span>` +
    '</p>';

  const cards = domains.map((d) => renderDomain(d, lang)).join('') + renderPractices(lang);
  return `${legend}<div class="bento">${cards}</div>${renderSprite(collectUsedIcons())}`;
}

/* ------------------------------------------------------ section Projet vedette */

function renderMetric(m, lang) {
  return (
    '<div class="metric">' +
    `<dt class="metric__label">${esc(t(m.label, lang))}</dt>` +
    `<dd class="metric__value">${esc(lang === 'en' ? m.valueEn : m.value)}` +
    `<span class="metric__note">${esc(t(m.note, lang))}</span></dd>` +
    '</div>'
  );
}

function renderFeatured(lang, diagram, base) {
  const f = featured;
  const stack = f.stack
    .map((s) => {
      const ico = s.icon && brandIcons[s.icon] ? useIcon(s.icon, 'pill__icon') : '';
      return `<li>${ico}${esc(s.name)}</li>`;
    })
    .join('');
  const metrics = f.metrics.map((m) => renderMetric(m, lang)).join('');

  const strip = f.showcase.strip
    .map(
      (s) =>
        '<figure class="showcase__thumb"><div class="ratio ratio--thumb">' +
        `<img src="${esc(base + s.src)}" width="${s.width}" height="${s.height}" loading="lazy" decoding="async" alt="${esc(t(s.alt, lang))}">` +
        '</div></figure>'
    )
    .join('');

  const actions = f.actions
    .map((a) => {
      const cls = a.kind === 'primary' ? 'btn btn--primary' : 'btn';
      return `<a class="${cls}" href="${esc(t(a.href, lang))}">${glyph(a.icon, 'btn__glyph')}${esc(t(a.label, lang))}</a>`;
    })
    .join('');

  const labels =
    lang === 'fr'
      ? { problem: 'Le problème', solution: 'La réponse', stack: 'Stack clé', showcase: 'Sur le terrain' }
      : { problem: 'The problem', solution: 'The answer', stack: 'Core stack', showcase: 'In the field' };

  return (
    '<div class="featured">' +
    /* En-tête */
    '<header class="featured__head">' +
    '<div class="featured__id">' +
    `<p class="kicker">${esc(t(f.kicker, lang))}</p>` +
    `<h3 class="featured__name">${esc(f.name)}</h3>` +
    `<p class="featured__headline">${esc(t(f.headline, lang))}</p>` +
    '</div>' +
    `<p class="status-badge"><span class="status-badge__dot" aria-hidden="true"></span>${esc(t(f.status, lang))}</p>` +
    '</header>' +
    '<dl class="featured__meta">' +
    `<div><dt>${lang === 'fr' ? 'Rôle' : 'Role'}</dt><dd>${esc(t(f.role, lang))}</dd></div>` +
    `<div><dt>${lang === 'fr' ? 'Contexte' : 'Context'}</dt><dd>${esc(t(f.context, lang))}</dd></div>` +
    '</dl>' +
    /* Problème / réponse */
    '<div class="featured__story">' +
    `<div class="story"><h4>${labels.problem}</h4><p>${esc(t(f.problem, lang))}</p></div>` +
    `<div class="story story--answer"><h4>${labels.solution}</h4><p>${esc(t(f.solution, lang))}</p></div>` +
    '</div>' +
    /* Métriques */
    `<dl class="metrics">${metrics}</dl>` +
    /* Vitrine visuelle */
    '<div class="showcase">' +
    '<figure class="showcase__main"><div class="ratio ratio--wide">' +
    `<img src="${esc(base + f.showcase.src)}" width="${f.showcase.width}" height="${f.showcase.height}" loading="lazy" decoding="async" alt="${esc(t(f.showcase.alt, lang))}">` +
    '</div>' +
    `<figcaption><b>${labels.showcase}</b>${esc(t(f.showcase.caption, lang))}</figcaption>` +
    '</figure>' +
    `<div class="showcase__strip">${strip}</div>` +
    '</div>' +
    /* Schéma d'architecture (fragment maintenu à la main) */
    diagram +
    /* Stack + actions */
    `<div class="featured__stack"><h4 class="featured__stack-label">${labels.stack}</h4>` +
    `<ul class="pills">${stack}</ul></div>` +
    `<div class="featured__actions"><div class="contact-row">${actions}</div>` +
    `<p class="repo-note">${glyph('lock', 'repo-note__glyph')}${esc(t(f.repoNote, lang))}</p></div>` +
    '</div>'
  );
}

/* ------------------------------------------------------------ section Projets */

function renderProjects(lang, base) {
  const cards = projects
    .map((p) => {
      const stack = p.stack.map((s) => `<li>${esc(s)}</li>`).join('');
      const note = p.note ? `<p class="card__note">${esc(t(p.note, lang))}</p>` : '';
      const action = p.action
        ? `<a class="card__link" href="${esc(base + p.action.href)}">${glyph('download', 'card__link-glyph')}${esc(t(p.action.label, lang))}</a>`
        : '';
      return (
        '<article class="card">' +
        `<p class="kicker">${esc(t(p.kicker, lang))}</p>` +
        `<h3>${esc(t(p.name, lang))}</h3>` +
        `<p class="card__context">${esc(t(p.context, lang))}</p>` +
        `<p class="card__summary">${esc(t(p.summary, lang))}</p>` +
        note +
        `<ul class="tags">${stack}</ul>` +
        action +
        '</article>'
      );
    })
    .join('');
  return `<div class="cards">${cards}</div>`;
}

/* ------------------------------------------------------------------ injection */

function inject(html, name, content, file) {
  const start = `<!-- gen:${name}:start -->`;
  const end = `<!-- gen:${name}:end -->`;
  const i = html.indexOf(start);
  const j = html.indexOf(end);
  if (i === -1 || j === -1) {
    throw new Error(`marqueurs gen:${name} introuvables dans ${file}`);
  }
  return html.slice(0, i + start.length) + '\n' + content + '\n' + html.slice(j);
}

/** `base` : préfixe relatif des assets depuis l'emplacement de la page. */
const PAGES = [
  { lang: 'fr', file: 'index.html', base: '' },
  { lang: 'en', file: join('en', 'index.html'), base: '../' },
];

let changed = 0;
for (const { lang, file, base } of PAGES) {
  const path = join(ROOT, file);
  const before = readFileSync(path, 'utf8');
  const diagram = readFileSync(join(ROOT, 'build', 'fragments', `diagram.${lang}.html`), 'utf8').trim();

  let html = before;
  html = inject(html, 'featured', renderFeatured(lang, diagram, base), file);
  html = inject(html, 'projects', renderProjects(lang, base), file);
  html = inject(html, 'skills', renderSkills(lang), file);

  if (html !== before) {
    writeFileSync(path, html, 'utf8');
    changed++;
  }
  const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
  console.log(`${file.padEnd(16)} ${html === before ? 'inchangé' : 'régénéré'}  ${kb} Ko`);
}

console.log(`\n${changed} page(s) écrite(s) · ${collectUsedIcons().length} icônes de marque dans le sprite`);
