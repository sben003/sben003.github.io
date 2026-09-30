import type { L } from '../i18n/ui';

/**
 * Règle : aucun lien qui n'existe pas. Le dépôt Vigie Océan est privé
 * (github.com/sben003/Vigie-Ocean-UPPA renvoie 404 en anonyme) et la
 * plateforme n'est pas exposée publiquement — on le dit plutôt que de
 * fabriquer un bouton « démo live » mort.
 */

export interface StackItem { name: string; icon: string | null }

export interface CaseProject {
  id: string;
  name: L;
  status: L;
  kicker: L;
  headline: L;
  context: L;
  problem: L;
  solution: L;
  role: L;
  results: { value: L; label: L }[];
  pipeline: L[];
  stack: StackItem[];
  href: L;
  /** Clé du schéma d'architecture à ouvrir en modale. */
  diagram: 'vigie' | 'warehouse';
  extra?: { href: string; label: L; icon: 'file' | 'lock' };
  note?: L;
}

export const cases: CaseProject[] = [
  {
    id: 'vigie-ocean',
    name: { fr: 'Vigie Océan', en: 'Vigie Océan' },
    status: { fr: 'En production', en: 'In production' },
    kicker: { fr: 'Supervision environnementale marine · Côte basque', en: 'Marine environmental monitoring · Basque coast' },
    headline: { fr: 'De la sonde immergée à l’écran de l’océanographe', en: 'From the submerged probe to the oceanographer’s screen' },
    context: { fr: 'Stage de fin de M1 · UPPA Tech, plateau SCOPE · avril – juillet 2026', en: 'Final-year M1 internship · UPPA Tech, SCOPE platform · April – July 2026' },
    problem: {
      fr: 'Les sondes océanographiques sont vendues avec l’abonnement cloud de leur constructeur. Pour un laboratoire qui exploite plusieurs marques, les mesures se fragmentent en silos incompatibles, chacune dans son format, son fuseau et son coût récurrent.',
      en: 'Oceanographic probes ship with their manufacturer’s cloud subscription. For a laboratory running several brands, readings fragment into incompatible silos, each with its own format, timezone and recurring cost.',
    },
    solution: {
      fr: 'Une plateforme auto-hébergée en sept conteneurs Docker : un registre de parseurs qui reconnaît chaque format en lisant le contenu du fichier, un stockage UTC en hypertable TimescaleDB compressée, une API FastAPI, et une interface React où toute correction reste réversible.',
      en: 'A self-hosted platform in seven Docker containers: a parser registry that recognises each format by reading the file’s contents, UTC storage in a compressed TimescaleDB hypertable, a FastAPI backend, and a React interface where every correction stays reversible.',
    },
    role: {
      fr: 'Conception, développement et mise en production — seul. Architecture, ingestion, base de données, API, interface et déploiement.',
      en: 'Design, development and production rollout — single-handedly. Architecture, ingestion, database, API, interface and deployment.',
    },
    results: [
      { value: { fr: '×12,7', en: '12.7×' }, label: { fr: 'compression, 29 → 2,3 Mo sans perte', en: 'compression, 29 → 2.3 MB lossless' } },
      { value: { fr: '< 50 ms', en: '< 50 ms' }, label: { fr: 'requêtes courantes, 117 ms au pire cas', en: 'everyday queries, 117 ms worst case' } },
      { value: { fr: '60 img/s', en: '60 fps' }, label: { fr: 'au zoom, 1 800 points par courbe', en: 'while zooming, 1,800 points per curve' } },
      { value: { fr: '14', en: '14' }, label: { fr: 'tests Pytest, sauvegardes quotidiennes', en: 'Pytest tests, daily backups' } },
    ],
    pipeline: [
      { fr: 'Sondes 4G', en: '4G probes' },
      { fr: 'FTP', en: 'FTP' },
      { fr: 'Ingestion Python', en: 'Python ingestion' },
      { fr: 'Contrôle qualité', en: 'Quality control' },
      { fr: 'TimescaleDB', en: 'TimescaleDB' },
      { fr: 'API FastAPI', en: 'FastAPI' },
      { fr: 'React', en: 'React' },
    ],
    stack: [
      { name: 'Python', icon: 'python' }, { name: 'FastAPI', icon: 'fastapi' },
      { name: 'TimescaleDB', icon: 'timescale' }, { name: 'PostgreSQL', icon: 'postgresql' },
      { name: 'React', icon: 'react' }, { name: 'TypeScript', icon: 'typescript' },
      { name: 'Docker Compose', icon: 'docker' }, { name: 'Google Cloud', icon: 'googlecloud' },
      { name: 'Nginx', icon: 'nginx' }, { name: 'Pytest', icon: 'pytest' },
    ],
    href: { fr: '/vigie-ocean/', en: '/en/vigie-ocean/' },
    diagram: 'vigie',
    note: { fr: 'Code source sous dépôt privé UPPA — accès sur demande.', en: 'Source code in a private UPPA repository — access on request.' },
  },
  {
    id: 'entrepot-donnees',
    name: { fr: 'Entrepôt de données', en: 'Data warehouse' },
    status: { fr: 'Stage · AI UNIVERS', en: 'Internship · AI UNIVERS' },
    kicker: { fr: 'Décisionnel · Chaîne complète', en: 'Business intelligence · End-to-end' },
    headline: { fr: 'D’un fichier plat à un cube OLAP et un tableau de bord', en: 'From a flat file to an OLAP cube and a dashboard' },
    context: { fr: 'Stage Data Analyst, AI UNIVERS · mai – juillet 2025 · rendu comme projet de module, M1 ISII', en: 'Data Analyst internship, AI UNIVERS · May – July 2025 · submitted as a module project, M1 ISII' },
    problem: {
      fr: 'Croiser la performance commerciale de colorants alimentaires avec leur impact sanitaire et environnemental : des mesures qui ne vivent pas dans le même tableau, à lire selon cinq axes.',
      en: 'Cross the commercial performance of food colourants with their health and environmental impact: measures that do not live in the same table, to be read along five axes.',
    },
    solution: {
      fr: 'Un schéma en étoile selon Kimball — une table de faits, cinq dimensions —, une chaîne ETL rejouable sous Talend, un entrepôt MySQL, un cube Pentaho où les montants s’additionnent et les scores se moyennent, puis Power BI.',
      en: 'A Kimball star schema — one fact table, five dimensions —, a replayable ETL chain in Talend, a MySQL warehouse, a Pentaho cube where amounts sum and scores average, then Power BI.',
    },
    role: {
      fr: 'En binôme avec Chanez Ressam : modélisation dimensionnelle, flux ETL, cube OLAP et restitution.',
      en: 'Paired with Chanez Ressam: dimensional modelling, ETL flows, OLAP cube and reporting.',
    },
    results: [
      { value: { fr: '5 + 1', en: '5 + 1' }, label: { fr: 'dimensions et table de faits', en: 'dimensions and fact table' } },
      { value: { fr: '8', en: '8' }, label: { fr: 'data marts analytiques', en: 'analytical data marts' } },
      { value: { fr: '4', en: '4' }, label: { fr: 'mesures, sum ou avg selon leur nature', en: 'measures, sum or avg by nature' } },
      { value: { fr: '100', en: '100' }, label: { fr: 'ventes modélisées (jeu simulé)', en: 'sales modelled (simulated set)' } },
    ],
    pipeline: [
      { fr: 'CSV consolidé', en: 'Consolidated CSV' },
      { fr: 'Talend', en: 'Talend' },
      { fr: 'MySQL', en: 'MySQL' },
      { fr: 'Cube OLAP', en: 'OLAP cube' },
      { fr: 'Power BI', en: 'Power BI' },
    ],
    stack: [
      { name: 'Talend Open Studio', icon: 'talend' }, { name: 'MySQL', icon: 'mysql' },
      { name: 'Pentaho', icon: null }, { name: 'Power BI', icon: null }, { name: 'SQL', icon: null },
    ],
    href: { fr: '/entrepot-donnees/', en: '/en/data-warehouse/' },
    diagram: 'warehouse',
    extra: { href: '/assets/RapportProjetEntrepotDeDonnees.pdf', label: { fr: 'Rapport (PDF, 62 p.)', en: 'Report (PDF, 62 pp., French)' }, icon: 'file' },
  },
];

export interface SmallProject { name: L; kicker: L; context: L; summary: L; stack: string[] }

export const academic: SmallProject[] = [
  {
    name: { fr: 'Job Board', en: 'Job Board' },
    kicker: { fr: 'Web · équipe agile', en: 'Web · agile team' },
    context: { fr: 'M1 SIGLIS, UPPA · 2025 – 2026', en: 'M1 SIGLIS, UPPA · 2025 – 2026' },
    summary: { fr: 'Application web conteneurisée développée en équipe agile, avec une chaîne d’intégration et de déploiement continus.', en: 'A containerised web application built by an agile team, with a continuous integration and deployment pipeline.' },
    stack: ['Vue.js', 'NestJS', 'Docker', 'CI/CD'],
  },
  {
    name: { fr: 'Pipeline ETL multi-sources', en: 'Multi-source ETL pipeline' },
    kicker: { fr: 'Data engineering', en: 'Data engineering' },
    context: { fr: 'M1 SIGLIS, UPPA · 2025 – 2026', en: 'M1 SIGLIS, UPPA · 2025 – 2026' },
    summary: { fr: 'Nettoyage et unification de sources CSV, API et SQL dans un pipeline construit sous Apache Hop.', en: 'Cleaning and unifying CSV, API and SQL sources in a pipeline built with Apache Hop.' },
    stack: ['Apache Hop', 'ETL', 'SQL'],
  },
  {
    name: { fr: 'Classification d’images médicales', en: 'Medical image classification' },
    kicker: { fr: 'Machine learning', en: 'Machine learning' },
    context: { fr: 'M1 ISII, Université d’Alger 1 · 2024 – 2025', en: 'M1 ISII, Université d’Alger 1 · 2024 – 2025' },
    summary: { fr: 'Approche hybride combinant un réseau convolutif et des descripteurs manuels, sur un jeu de données déséquilibré.', en: 'A hybrid approach combining a convolutional network with hand-crafted descriptors, on an imbalanced dataset.' },
    stack: ['Python', 'CNN', 'Feature engineering'],
  },
  {
    name: { fr: 'Prédiction de prix immobiliers', en: 'Property price prediction' },
    kicker: { fr: 'Machine learning', en: 'Machine learning' },
    context: { fr: 'M1 ISII, Université d’Alger 1 · 2024 – 2025', en: 'M1 ISII, Université d’Alger 1 · 2024 – 2025' },
    summary: { fr: 'Modèle de Gradient Boosting entraîné avec Scikit-learn, exposé dans une interface Tkinter.', en: 'A Gradient Boosting model trained with Scikit-learn, exposed through a Tkinter interface.' },
    stack: ['Python', 'Scikit-learn', 'Tkinter'],
  },
];
