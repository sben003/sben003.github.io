// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://sben003.github.io',
  trailingSlash: 'ignore',
  build: {
    // /vigie-ocean/index.html : les URL publiées depuis le début restent valides
    format: 'directory',
    // CSS en ligne : aucune feuille bloquante au premier rendu
    inlineStylesheets: 'always',
  },
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
