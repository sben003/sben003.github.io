/**
 * Graphiques générés par scripts/charts.py. Les petits restent dans la page ;
 * les lourds (séries de milliers de points) sortent en fichiers /charts/*.svg,
 * chargés quand le lecteur en approche. Leur place est réservée à la taille
 * exacte du SVG (même viewBox) : rien ne bouge à l'arrivée.
 */
const raw = import.meta.glob<string>('../content/charts/*.html', { query: '?raw', import: 'default', eager: true });

/** Au-delà, le SVG pèse sur le premier rendu de la page qui l'embarque. */
const HEAVY = 12_000;
const SVG = /<svg class="ch[ "][\s\S]*?<\/svg>/;

const source = (name: string, lang: string): string => {
  const html = raw[`../content/charts/${name}.${lang}.html`];
  if (!html) throw new Error(`Graphique introuvable : ${name}.${lang}.html (lancer « npm run charts »)`);
  return html;
};

const isHeavy = (html: string) => (html.match(SVG)?.[0].length ?? 0) > HEAVY;

/** Fragment à insérer dans l'étude : le graphique, ou son emplacement différé. */
export function renderChart(name: string, lang: string): string {
  const html = source(name, lang);
  if (!isHeavy(html)) return html;
  const svg = html.match(SVG)![0];
  const [, w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/) ?? [];
  const title = svg.match(/<title[^>]*>([^<]*)<\/title>/)?.[1] ?? '';
  const note = lang === 'fr' ? 'Graphique interactif : activez JavaScript pour l’afficher.' : 'Interactive chart: enable JavaScript to display it.';
  const slot = `<div class="ch-slot" data-src="/charts/${name}.${lang}.svg" style="aspect-ratio:${w} / ${h}" role="img" aria-label="${title}" aria-busy="true"><noscript><p>${note}</p></noscript></div>`;
  return html.replace(svg, slot);
}

/** Les SVG lourds, publiés à part par src/pages/charts/[file].ts. */
export function heavyCharts(): { file: string; svg: string }[] {
  return Object.entries(raw).flatMap(([path, html]) => {
    if (!isHeavy(html)) return [];
    const base = path.split('/').pop()!.replace(/\.html$/, '');
    return [{ file: `${base}.svg`, svg: html.match(SVG)![0] }];
  });
}
