/**
 * Source unique des compétences. Consommée au build par build/render.mjs,
 * qui génère le HTML statique injecté dans les pages FR et EN.
 *
 * `level` n'est pas une note sur cinq : c'est un fait vérifiable.
 *   production — la techno a servi dans un système livré et exploité
 *   projet     — la techno a servi dans un projet académique ou un prototype
 *
 * `icon` est un slug Simple Icons. Un slug inconnu retombe sur un glyphe
 * neutre : voir build/icons.mjs. Ne jamais inventer de slug.
 */

/**
 * Icônes de marque sur les badges de compétences.
 *
 * false (défaut) — badges purement typographiques + pastille de niveau.
 *   Les 29 glyphes pèsent 17 Ko compressés, contre 10 Ko pour tout le
 *   contenu de la page : sur un site dont l'exigence est la légèreté, la
 *   décoration coûterait plus cher que l'information. Les icônes restent
 *   affichées sur les pills du projet vedette, où elles ont un vrai rôle.
 *
 * true — icônes Simple Icons sur chaque badge. Une ligne à changer,
 *   puis `node build/render.mjs`.
 */
export const showBrandIcons = false;

export const levels = {
  production: {
    fr: { label: 'Production', title: 'Utilisé dans un système livré et exploité' },
    en: { label: 'Production', title: 'Used in a system shipped and operated' },
  },
  projet: {
    fr: { label: 'Projet', title: 'Utilisé en projet académique ou en prototype' },
    en: { label: 'Project', title: 'Used in an academic project or a prototype' },
  },
};

export const domains = [
  {
    id: 'data',
    span: 2,
    glyph: 'database',
    title: { fr: 'Data & Analytics', en: 'Data & Analytics' },
    lede: {
      fr: 'Conduire la donnée de la source brute à l’indicateur : ingestion, normalisation, contrôle qualité, modélisation, restitution.',
      en: 'Take data from raw source to indicator: ingestion, normalisation, quality control, modelling, reporting.',
    },
    groups: [
      {
        label: { fr: 'Langages & calcul', en: 'Languages & computation' },
        items: [
          { name: 'Python', icon: 'python', level: 'production' },
          { name: 'Pandas', icon: 'pandas', level: 'production' },
          { name: 'SQL', icon: 'postgresql', level: 'production' },
          { name: 'NumPy', icon: 'numpy', level: 'projet' },
          { name: 'Scikit-learn', icon: 'scikitlearn', level: 'projet' },
        ],
      },
      {
        label: { fr: 'Bases de données', en: 'Databases' },
        items: [
          { name: 'TimescaleDB', icon: 'timescale', level: 'production' },
          { name: 'PostgreSQL', icon: 'postgresql', level: 'production' },
          { name: 'MySQL', icon: 'mysql', level: 'production' },
          { name: 'SQLite', icon: 'sqlite', level: 'projet' },
        ],
      },
      {
        label: { fr: 'ETL & décisionnel', en: 'ETL & BI' },
        items: [
          { name: 'Talend Open Studio', icon: 'talend', level: 'production' },
          { name: 'Pentaho Data Integration', icon: null, level: 'production' },
          { name: 'Pentaho Schema Workbench', icon: null, level: 'production' },
          { name: 'Power BI', icon: null, level: 'production' },
          { name: 'Apache Hop', icon: null, level: 'projet' },
          { name: 'Streamlit', icon: 'streamlit', level: 'projet' },
        ],
      },
    ],
    uses: {
      fr: ['Pipelines ETL multi-sources', 'Séries temporelles à pas fixe', 'Schéma en étoile & cubes OLAP', 'Contrôle qualité avant insertion', 'Tableaux de bord KPI'],
      en: ['Multi-source ETL pipelines', 'Fixed-step time series', 'Star schema & OLAP cubes', 'Quality control before insert', 'KPI dashboards'],
    },
  },

  {
    id: 'web',
    span: 1,
    glyph: 'code',
    title: { fr: 'Développement web', en: 'Web development' },
    lede: {
      fr: 'Rendre la donnée consultable : API typées et interfaces qui tiennent la charge.',
      en: 'Make data usable: typed APIs and interfaces that hold up under load.',
    },
    groups: [
      {
        label: { fr: 'Interface', en: 'Frontend' },
        items: [
          { name: 'React', icon: 'react', level: 'production' },
          { name: 'TypeScript', icon: 'typescript', level: 'production' },
          { name: 'JavaScript', icon: 'javascript', level: 'production' },
          { name: 'HTML / CSS', icon: 'html5', level: 'production' },
          { name: 'Bootstrap', icon: 'bootstrap', level: 'production' },
          { name: 'Vue.js', icon: 'vuedotjs', level: 'projet' },
        ],
      },
      {
        label: { fr: 'Serveur', en: 'Backend' },
        items: [
          { name: 'FastAPI', icon: 'fastapi', level: 'production' },
          { name: 'PHP', icon: 'php', level: 'production' },
          { name: 'NestJS', icon: 'nestjs', level: 'projet' },
          { name: 'Java', icon: 'openjdk', level: 'projet' },
        ],
      },
    ],
    uses: {
      fr: ['API REST sous 50 ms', 'Graphiques sur séries longues', 'Exports Excel horodatés'],
      en: ['REST API under 50 ms', 'Charts over long series', 'Timestamped Excel exports'],
    },
  },

  {
    id: 'infra',
    span: 1,
    glyph: 'cloud',
    title: { fr: 'Infrastructure & exploitation', en: 'Infrastructure & operations' },
    lede: {
      fr: 'Mettre en production et garder en vie : conteneurs, VM, sauvegardes, tests.',
      en: 'Ship it and keep it alive: containers, VMs, backups, tests.',
    },
    groups: [
      {
        label: { fr: 'Conteneurs & cloud', en: 'Containers & cloud' },
        items: [
          { name: 'Docker', icon: 'docker', level: 'production' },
          { name: 'Docker Compose', icon: 'docker', level: 'production' },
          { name: 'Google Cloud Platform', icon: 'googlecloud', level: 'production' },
          { name: 'Nginx', icon: 'nginx', level: 'production' },
          { name: 'Linux', icon: 'linux', level: 'production' },
        ],
      },
      {
        label: { fr: 'Chaîne de dev', en: 'Dev toolchain' },
        items: [
          { name: 'Git', icon: 'git', level: 'production' },
          { name: 'GitLab', icon: 'gitlab', level: 'production' },
          { name: 'Pytest', icon: 'pytest', level: 'production' },
          { name: 'Bash', icon: 'gnubash', level: 'production' },
          { name: 'Jupyter', icon: 'jupyter', level: 'projet' },
        ],
      },
    ],
    uses: {
      fr: ['Déploiement conteneurisé', 'VM cloud & contraintes réseau', 'Sauvegardes planifiées', 'Tests d’intégration'],
      en: ['Containerised deployment', 'Cloud VM & network constraints', 'Scheduled backups', 'Integration tests'],
    },
  },
];

/**
 * Quatrième carte du bento : ce ne sont pas des technologies mais des
 * pratiques. Chaque entrée est adossée à un fait du stage ou d'un projet.
 */
export const practices = {
  glyph: 'compass',
  title: { fr: 'Méthodes & pratiques', en: 'Methods & practice' },
  lede: {
    fr: 'Ce qui fait qu’un développement arrive en production, et y reste.',
    en: 'What gets a piece of work into production, and keeps it there.',
  },
  items: [
    {
      name: { fr: 'Itérations courtes et livrables', en: 'Short, shippable iterations' },
      detail: {
        fr: 'Cinq incréments successifs sur Vigie Océan, chacun clos par un déploiement réel plutôt qu’une planification figée.',
        en: 'Five successive increments on Vigie Océan, each closed by a real deployment rather than a frozen plan.',
      },
    },
    {
      name: { fr: 'Contrats d’interface explicites', en: 'Explicit interface contracts' },
      detail: {
        fr: 'Format de fichier, schéma relationnel, contrat REST : chaque frontière entre services est spécifiée et stable.',
        en: 'File format, relational schema, REST contract: every boundary between services is specified and stable.',
      },
    },
    {
      name: { fr: 'Recette en conditions réelles', en: 'Acceptance testing in real conditions' },
      detail: {
        fr: 'Codes de statut, latences, intégrité des fichiers produits — vérifiés contre la production, pas seulement en local.',
        en: 'Status codes, latencies, integrity of generated files — checked against production, not just locally.',
      },
    },
    {
      name: { fr: 'Réversibilité des décisions', en: 'Reversible decisions' },
      detail: {
        fr: 'Suppression logique plutôt que destruction, idempotence de l’ingestion, sauvegardes quotidiennes automatisées.',
        en: 'Logical deletion rather than destruction, idempotent ingestion, automated daily backups.',
      },
    },
    {
      name: { fr: 'Documentation d’exploitation', en: 'Operations documentation' },
      detail: {
        fr: 'Guide de reprise, procédure de restauration, mode d’emploi utilisateur — pour que le projet survive au départ de son auteur.',
        en: 'Recovery guide, restore procedure, user manual — so the project outlives whoever wrote it.',
      },
    },
    {
      name: { fr: 'Modélisation avant code', en: 'Modelling before code' },
      detail: {
        fr: 'UML sur l’application RH, schéma en étoile sur l’entrepôt de données, modèle dimensionnel avant les cubes.',
        en: 'UML on the HR application, star schema on the data warehouse, dimensional model before the cubes.',
      },
    },
  ],
};
