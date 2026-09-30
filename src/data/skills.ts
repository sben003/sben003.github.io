import type { L } from '../i18n/ui';

/**
 * `level` n'est pas une note sur cinq, c'est un fait vérifiable :
 *   production — a servi dans un système livré et exploité
 *   projet     — a servi dans un projet académique ou un prototype
 * `icon` est un slug Simple Icons présent dans brand-icons.ts, ou null.
 */
export type Level = 'production' | 'projet';

export interface Tech {
  name: string;
  icon: string | null;
  level: Level;
}

export interface Domain {
  id: string;
  glyph: 'database' | 'layers' | 'cloud' | 'compass';
  size: 'wide' | 'narrow';
  title: L;
  lede: L;
  groups: { label: L; items: Tech[] }[];
  uses: L[];
}

export const domains: Domain[] = [
  {
    id: 'data', glyph: 'database', size: 'wide',
    title: { fr: 'Data & BI', en: 'Data & BI' },
    lede: {
      fr: 'Conduire la donnée de la source brute à l’indicateur : ingestion, normalisation, contrôle qualité, modélisation, restitution.',
      en: 'Take data from raw source to indicator: ingestion, normalisation, quality control, modelling, reporting.',
    },
    groups: [
      { label: { fr: 'Langages & calcul', en: 'Languages & computation' }, items: [
        { name: 'Python', icon: 'python', level: 'production' },
        { name: 'Pandas', icon: 'pandas', level: 'production' },
        { name: 'SQL', icon: null, level: 'production' },
        { name: 'NumPy', icon: 'numpy', level: 'projet' },
        { name: 'Scikit-learn', icon: 'scikitlearn', level: 'projet' },
      ] },
      { label: { fr: 'Bases de données', en: 'Databases' }, items: [
        { name: 'TimescaleDB', icon: 'timescale', level: 'production' },
        { name: 'PostgreSQL', icon: 'postgresql', level: 'production' },
        { name: 'MySQL', icon: 'mysql', level: 'production' },
        { name: 'SQLite', icon: 'sqlite', level: 'projet' },
      ] },
      { label: { fr: 'ETL & décisionnel', en: 'ETL & BI' }, items: [
        { name: 'Talend Open Studio', icon: 'talend', level: 'production' },
        { name: 'Pentaho Data Integration', icon: null, level: 'production' },
        { name: 'Pentaho Schema Workbench', icon: null, level: 'production' },
        { name: 'Power BI', icon: null, level: 'production' },
        { name: 'Apache Hop', icon: null, level: 'projet' },
        { name: 'Streamlit', icon: 'streamlit', level: 'projet' },
      ] },
    ],
    uses: [
      { fr: 'Pipelines ETL multi-sources', en: 'Multi-source ETL pipelines' },
      { fr: 'Séries temporelles', en: 'Time series' },
      { fr: 'Schéma en étoile & OLAP', en: 'Star schema & OLAP' },
      { fr: 'Tableaux de bord KPI', en: 'KPI dashboards' },
    ],
  },
  {
    id: 'web', glyph: 'layers', size: 'narrow',
    title: { fr: 'Full-stack', en: 'Full-stack' },
    lede: {
      fr: 'Rendre la donnée consultable : API typées et interfaces qui tiennent la charge.',
      en: 'Make data usable: typed APIs and interfaces that hold up under load.',
    },
    groups: [
      { label: { fr: 'Interface', en: 'Frontend' }, items: [
        { name: 'React', icon: 'react', level: 'production' },
        { name: 'TypeScript', icon: 'typescript', level: 'production' },
        { name: 'JavaScript', icon: 'javascript', level: 'production' },
        { name: 'HTML / CSS', icon: 'html5', level: 'production' },
        { name: 'Vue.js', icon: 'vuedotjs', level: 'projet' },
      ] },
      { label: { fr: 'Serveur', en: 'Backend' }, items: [
        { name: 'FastAPI', icon: 'fastapi', level: 'production' },
        { name: 'PHP', icon: 'php', level: 'production' },
        { name: 'NestJS', icon: 'nestjs', level: 'projet' },
        { name: 'Java', icon: 'openjdk', level: 'projet' },
      ] },
    ],
    uses: [
      { fr: 'API REST sous 50 ms', en: 'REST API under 50 ms' },
      { fr: 'Graphiques sur séries longues', en: 'Charts over long series' },
    ],
  },
  {
    id: 'infra', glyph: 'cloud', size: 'narrow',
    title: { fr: 'Cloud & DevOps', en: 'Cloud & DevOps' },
    lede: {
      fr: 'Mettre en production et garder en vie : conteneurs, VM, sauvegardes, tests.',
      en: 'Ship it and keep it alive: containers, VMs, backups, tests.',
    },
    groups: [
      { label: { fr: 'Conteneurs & cloud', en: 'Containers & cloud' }, items: [
        { name: 'Docker', icon: 'docker', level: 'production' },
        { name: 'Docker Compose', icon: 'docker', level: 'production' },
        { name: 'Google Cloud', icon: 'googlecloud', level: 'production' },
        { name: 'Nginx', icon: 'nginx', level: 'production' },
        { name: 'Linux', icon: 'linux', level: 'production' },
      ] },
      { label: { fr: 'Chaîne de dev', en: 'Dev toolchain' }, items: [
        { name: 'Git', icon: 'git', level: 'production' },
        { name: 'GitLab', icon: 'gitlab', level: 'production' },
        { name: 'Pytest', icon: 'pytest', level: 'production' },
        { name: 'Bash', icon: 'gnubash', level: 'production' },
      ] },
    ],
    uses: [
      { fr: 'Déploiement conteneurisé', en: 'Containerised deployment' },
      { fr: 'Sauvegardes planifiées', en: 'Scheduled backups' },
    ],
  },
];

/** Quatrième carte : l'architecture et les méthodes, adossées à des faits. */
export const practices: { title: L; lede: L; items: { name: L; detail: L }[] } = {
  title: { fr: 'Architecture & méthodes', en: 'Architecture & methods' },
  lede: {
    fr: 'Ce qui fait qu’un développement arrive en production, et y reste.',
    en: 'What gets a piece of work into production, and keeps it there.',
  },
  items: [
    { name: { fr: 'Modélisation avant code', en: 'Modelling before code' },
      detail: { fr: 'Schéma en étoile selon Kimball, hypertable de séries temporelles, UML sur l’application RH.', en: 'Kimball star schema, time-series hypertable, UML on the HR application.' } },
    { name: { fr: 'Contrats d’interface explicites', en: 'Explicit interface contracts' },
      detail: { fr: 'Format de fichier, schéma relationnel, contrat REST : chaque frontière entre services est spécifiée.', en: 'File format, relational schema, REST contract: every boundary between services is specified.' } },
    { name: { fr: 'Décisions réversibles', en: 'Reversible decisions' },
      detail: { fr: 'Suppression logique plutôt que destruction, ingestion idempotente, sauvegardes quotidiennes.', en: 'Logical deletion rather than destruction, idempotent ingestion, daily backups.' } },
    { name: { fr: 'Recette en conditions réelles', en: 'Acceptance testing in real conditions' },
      detail: { fr: 'Codes de statut, latences et fichiers produits vérifiés contre la production, pas seulement en local.', en: 'Status codes, latencies and generated files checked against production, not only locally.' } },
  ],
};
