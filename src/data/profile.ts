import type { L } from '../i18n/ui';

export const profile = {
  name: 'Salem Benzineh',
  email: 'salben674@gmail.com',
  linkedin: 'https://www.linkedin.com/in/mohamed-salem-benzineh-1517ab240',
  github: 'https://github.com/sben003',
  repo: 'https://github.com/sben003/sben003.github.io',
  site: 'https://sben003.github.io',

  /**
   * CV téléchargeable. `null` masque tous les boutons CV.
   * Il reste à `null` tant que le document contient « Rythme [À COMPLÉTER] ».
   * Pour le publier : déposer le PDF dans public/assets/, puis renseigner
   * '/assets/CV-Salem-Benzineh.pdf' ici.
   */
  cv: null as string | null,
};

/** Chiffres clés du hero. Chacun est sourcé dans le rapport de stage M1. */
export interface Stat {
  value: number;
  /** Rendu final, exact : c'est lui qui s'affiche sans JavaScript. */
  display: L;
  prefix?: L;
  suffix?: L;
  decimals?: number;
  label: L;
}

export const heroStats: Stat[] = [
  { value: 103940, display: { fr: '103 940', en: '103,940' },
    label: { fr: 'mesures en base', en: 'measurements stored' } },
  { value: 12.7, decimals: 1, prefix: { fr: '×', en: '' }, suffix: { fr: '', en: '×' }, display: { fr: '×12,7', en: '12.7×' },
    label: { fr: 'compression du stockage', en: 'storage compression' } },
  { value: 50, prefix: { fr: '< ', en: '< ' }, suffix: { fr: ' ms', en: ' ms' }, display: { fr: '< 50 ms', en: '< 50 ms' },
    label: { fr: 'réponse de l’API', en: 'API response' } },
  { value: 7, display: { fr: '7', en: '7' },
    label: { fr: 'conteneurs en production', en: 'containers in production' } },
];
