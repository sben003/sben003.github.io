/**
 * Sprite des icônes de marque, généré au build vers /assets/brands.svg.
 * Fichier séparé plutôt qu'inliné : mis en cache une fois pour tout le site,
 * il ne pèse plus sur le premier rendu de chaque page.
 */
import type { APIRoute } from 'astro';
import { brandIcons } from '../../data/brand-icons';

export const GET: APIRoute = () => {
  const symbols = Object.keys(brandIcons)
    .sort()
    .map((slug) => `<symbol id="si-${slug}" viewBox="0 0 24 24"><path d="${brandIcons[slug].d}"/></symbol>`)
    .join('');
  return new Response(`<svg xmlns="http://www.w3.org/2000/svg">${symbols}</svg>`, {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
};
