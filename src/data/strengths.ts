import type { L } from '../i18n/ui';

/**
 * Proposition de valeur de l'accueil : quatre compétences, chacune adossée à
 * un chiffre et à la section précise du projet qui la démontre.
 */
export interface Strength {
  icon: 'database' | 'cube' | 'scan' | 'code';
  domain: L;
  claim: L;
  body: L;
  proof: { value: L; label: L; href: L };
}

export const strengths: Strength[] = [
  {
    icon: 'database',
    domain: { fr: 'Data engineering', en: 'Data engineering' },
    claim: { fr: 'Des chaînes d’ingestion qui tiennent en production', en: 'Ingestion pipelines that hold up in production' },
    body: {
      fr: 'Parseurs multi-constructeurs, contrôle qualité par bornes physiques, séries temporelles stockées en UTC et compressées.',
      en: 'Multi-vendor parsers, physical-bound quality control, time series stored in UTC and compressed.',
    },
    proof: {
      value: { fr: '103 940', en: '103,940' },
      label: { fr: 'mesures en base · Vigie Océan', en: 'measurements stored · Vigie Océan' },
      href: { fr: '/vigie-ocean/#ingestion', en: '/en/vigie-ocean/#ingestion' },
    },
  },
  {
    icon: 'cube',
    domain: { fr: 'BI & modélisation', en: 'BI & modelling' },
    claim: { fr: 'Du fichier plat au tableau de bord', en: 'From a flat file to a dashboard' },
    body: {
      fr: 'Schéma en étoile selon Kimball, ETL rejouable, cube OLAP où chaque mesure s’agrège selon sa nature, restitution Power BI.',
      en: 'Kimball star schema, replayable ETL, an OLAP cube where each measure aggregates by its nature, Power BI reporting.',
    },
    proof: {
      value: { fr: '8', en: '8' },
      label: { fr: 'data marts · Entrepôt de données', en: 'data marts · Data warehouse' },
      href: { fr: '/entrepot-donnees/#modele', en: '/en/data-warehouse/#model' },
    },
  },
  {
    icon: 'scan',
    domain: { fr: 'Machine learning', en: 'Machine learning' },
    claim: { fr: 'Évaluer avant de complexifier', en: 'Evaluate before adding complexity' },
    body: {
      fr: 'Descripteurs d’image, régression logistique, réseau convolutif — et la matrice de confusion pour les départager.',
      en: 'Image descriptors, logistic regression, a convolutional network — and the confusion matrix to tell them apart.',
    },
    proof: {
      value: { fr: '96,5 %', en: '96.5%' },
      label: { fr: 'en test · Radiographies', en: 'on test · Chest X-rays' },
      href: { fr: '/radiographies/#resultats', en: '/en/chest-x-rays/#results' },
    },
  },
  {
    icon: 'code',
    domain: { fr: 'Full-stack', en: 'Full-stack' },
    claim: { fr: 'Des interfaces rapides sur des données lourdes', en: 'Fast interfaces over heavy data' },
    body: {
      fr: 'API FastAPI typée, courbes React sous-échantillonnées par LTTB, déploiement Docker Compose.',
      en: 'Typed FastAPI backend, React curves downsampled with LTTB, Docker Compose deployment.',
    },
    proof: {
      value: { fr: '< 50 ms', en: '< 50 ms' },
      label: { fr: 'requêtes courantes · Vigie Océan', en: 'everyday queries · Vigie Océan' },
      href: { fr: '/vigie-ocean/#api', en: '/en/vigie-ocean/#api' },
    },
  },
];
