import type { L } from '../i18n/ui';

export interface Job {
  when: L;
  kind: L;
  role: L;
  org: L;
  summary: L;
  points: L[];
  tags: string[];
  href?: L;
}

export const experience: Job[] = [
  {
    when: { fr: 'Avr. – juil. 2026', en: 'Apr – Jul 2026' },
    kind: { fr: 'Stage de fin de M1', en: 'Final-year M1 internship' },
    role: { fr: 'Data engineer', en: 'Data engineer' },
    org: { fr: 'UPPA Tech, plateau SCOPE — Anglet', en: 'UPPA Tech, SCOPE platform — Anglet' },
    summary: {
      fr: 'Plateforme de supervision environnementale marine conçue et mise en production seul : Vigie Océan.',
      en: 'A marine environmental monitoring platform designed and shipped single-handedly: Vigie Océan.',
    },
    points: [
      { fr: 'VM Google Cloud et service Python de rapatriement FTP, pour contourner un réseau fermé aux connexions entrantes.', en: 'Google Cloud VM and a Python FTP retrieval service, to work around a network closed to inbound connections.' },
      { fr: 'Parseurs par constructeur, contrôle qualité par bornes physiques, stockage UTC en hypertable compressée.', en: 'Per-vendor parsers, physical-bound quality control, UTC storage in a compressed hypertable.' },
      { fr: 'API FastAPI sous 50 ms, interface React avec sous-échantillonnage LTTB, déploiement Docker Compose.', en: 'FastAPI backend under 50 ms, React interface with LTTB downsampling, Docker Compose deployment.' },
    ],
    tags: ['Python', 'TimescaleDB', 'FastAPI', 'React', 'Docker'],
    href: { fr: '/vigie-ocean/', en: '/en/vigie-ocean/' },
  },
  {
    when: { fr: 'Mai – juil. 2025', en: 'May – Jul 2025' },
    kind: { fr: 'Stage', en: 'Internship' },
    role: { fr: 'Data analyst', en: 'Data analyst' },
    org: { fr: 'AI UNIVERS', en: 'AI UNIVERS' },
    summary: {
      fr: 'Chaîne décisionnelle complète, de la source au tableau de bord.',
      en: 'A complete business-intelligence chain, from source to dashboard.',
    },
    points: [
      { fr: 'ETL sur cinq sources hétérogènes, avec Talend Open Studio et Pentaho Data Integration.', en: 'ETL across five heterogeneous sources, using Talend Open Studio and Pentaho Data Integration.' },
      { fr: 'Cubes OLAP modélisés sous Pentaho Schema Workbench.', en: 'OLAP cubes modelled in Pentaho Schema Workbench.' },
      { fr: 'Trois tableaux de bord Power BI de suivi des KPI, livrés aux équipes métier.', en: 'Three Power BI dashboards tracking KPIs, delivered to the business teams.' },
    ],
    tags: ['Talend', 'Pentaho', 'OLAP', 'Power BI', 'SQL'],
    href: { fr: '/entrepot-donnees/', en: '/en/data-warehouse/' },
  },
  {
    when: { fr: 'Mars – mai 2024', en: 'Mar – May 2024' },
    kind: { fr: 'Stage de fin de licence', en: 'Final-year bachelor internship' },
    role: { fr: 'Développeur full-stack', en: 'Full-stack developer' },
    org: { fr: 'Banque El BADR — Alger', en: 'Banque El BADR — Algiers' },
    summary: {
      fr: 'Application interne de gestion RH — paie, congés, dossiers d’environ 50 collaborateurs — en remplacement d’un traitement manuel.',
      en: 'An internal HR application — payroll, leave, records for around 50 staff — replacing a manual process.',
    },
    points: [
      { fr: 'Modélisation UML et conception de la base MySQL.', en: 'UML modelling and MySQL database design.' },
      { fr: 'Développement PHP, Bootstrap et JavaScript ; mode d’emploi et support utilisateurs.', en: 'PHP, Bootstrap and JavaScript development; user manual and support.' },
    ],
    tags: ['PHP', 'MySQL', 'JavaScript', 'UML'],
  },
];

export const education: { when: string; title: L; school: L; note?: L }[] = [
  { when: '2026 – 2027', title: { fr: 'Master 2 Informatique — parcours SIGLIS', en: 'Master 2 in Computer Science — SIGLIS track' },
    school: { fr: 'Université de Pau et des Pays de l’Adour, Anglet', en: 'Université de Pau et des Pays de l’Adour, Anglet' } },
  { when: '2025 – 2026', title: { fr: 'Master 1 Informatique — parcours SIGLIS', en: 'Master 1 in Computer Science — SIGLIS track' },
    school: { fr: 'Université de Pau et des Pays de l’Adour, Anglet', en: 'Université de Pau et des Pays de l’Adour, Anglet' } },
  { when: '2024 – 2025', title: { fr: 'Master 1 Ingénierie des Systèmes Informatiques Intelligents', en: 'Master 1 in Intelligent Information Systems Engineering' },
    school: { fr: 'Université d’Alger 1', en: 'Université d’Alger 1' },
    note: { fr: 'Année validée avant réorientation vers le cursus français', en: 'Year completed before transferring to the French curriculum' } },
  { when: '2021 – 2024', title: { fr: 'Licence Ingénierie des Systèmes d’Information et Logiciels', en: 'Bachelor in Information Systems and Software Engineering' },
    school: { fr: 'Université d’Alger 1', en: 'Université d’Alger 1' } },
];

export const languages: { name: L; level: L }[] = [
  { name: { fr: 'Arabe', en: 'Arabic' }, level: { fr: 'Langue maternelle', en: 'Native' } },
  { name: { fr: 'Français', en: 'French' }, level: { fr: 'C1 · certifié TCF', en: 'C1 · TCF certified' } },
  { name: { fr: 'Anglais', en: 'English' }, level: { fr: 'B2', en: 'B2' } },
];
