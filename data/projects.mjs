/**
 * Source unique des projets. Consommée au build par build/render.mjs.
 *
 * Règle : aucun lien qui n'existe pas. Le dépôt Vigie Océan est privé
 * (github.com/sben003/Vigie-Ocean-UPPA renvoie 404 en anonyme) et la
 * plateforme n'est pas exposée publiquement — on le dit au lieu de
 * fabriquer un bouton « Démo live » mort.
 */

export const featured = {
  id: 'vigie-ocean',
  name: 'Vigie Océan',
  status: { fr: 'En production', en: 'In production' },
  kicker: {
    fr: 'Supervision environnementale marine · Côte basque',
    en: 'Marine environmental monitoring · Basque coast',
  },
  headline: {
    fr: 'De la sonde immergée à l’écran de l’océanographe',
    en: 'From the submerged probe to the oceanographer’s screen',
  },
  role: {
    fr: 'Conception, développement et mise en production — seul',
    en: 'Design, development and production rollout — single-handedly',
  },
  context: {
    fr: 'UPPA Tech, plateau SCOPE · Stage de fin de M1 · Avril – juillet 2026',
    en: 'UPPA Tech, SCOPE platform · Final-year M1 internship · April – July 2026',
  },
  problem: {
    fr: 'Les sondes océanographiques sont vendues avec l’abonnement cloud propriétaire de leur constructeur. Pour un laboratoire qui exploite plusieurs marques, les mesures se fragmentent en silos incompatibles et le budget paie des abonnements récurrents.',
    en: 'Oceanographic probes ship with their manufacturer’s proprietary cloud subscription. For a laboratory running several brands, readings fragment into incompatible silos and the budget keeps paying recurring fees.',
  },
  solution: {
    fr: 'Une plateforme auto-hébergée en sept conteneurs Docker : un registre de parseurs qui reconnaît chaque format en lisant le contenu du fichier, une hypertable TimescaleDB compressée, une API FastAPI, et une interface React où toute correction reste réversible.',
    en: 'A self-hosted platform in seven Docker containers: a parser registry that recognises each format by reading the file’s contents, a compressed TimescaleDB hypertable, a FastAPI backend, and a React interface where every correction stays reversible.',
  },
  stack: [
    { name: 'Python', icon: 'python' },
    { name: 'FastAPI', icon: 'fastapi' },
    { name: 'TimescaleDB', icon: 'timescale' },
    { name: 'PostgreSQL', icon: 'postgresql' },
    { name: 'React', icon: 'react' },
    { name: 'TypeScript', icon: 'typescript' },
    { name: 'Docker Compose', icon: 'docker' },
    { name: 'Google Cloud', icon: 'googlecloud' },
    { name: 'Nginx', icon: 'nginx' },
    { name: 'Pytest', icon: 'pytest' },
  ],
  showcase: {
    src: 'assets/img/sonde-bouee.webp',
    width: 900,
    height: 1200,
    alt: {
      fr: 'Tube noir d’une sonde multiparamètre fixé par colliers inox sous le flotteur de la bouée d’atterrissage de Bayonne.',
      en: 'Black tube of a multiparameter probe clamped with stainless steel brackets under the float of the Bayonne landfall buoy.',
    },
    caption: {
      fr: 'La sonde NKE WiMo mouillée sous la bouée d’atterrissage — première source de la chaîne.',
      en: 'The NKE WiMo probe moored under the landfall buoy — the first source in the chain.',
    },
    // Bandeau secondaire sous la photo principale
    strip: [
      { src: 'assets/img/coffret-acquisition.webp', width: 900, height: 1200,
        alt: { fr: 'Intérieur du coffret d’acquisition : centrale programmable, régulateur solaire, batteries.',
               en: 'Inside the acquisition cabinet: programmable logger, solar controller, batteries.' } },
      { src: 'assets/img/station-quai.webp', width: 1200, height: 900,
        alt: { fr: 'Station de mesure sur un quai du port de Bayonne, alimentée par panneau solaire.',
               en: 'Monitoring station on a quay at the port of Bayonne, powered by a solar panel.' } },
      { src: 'assets/img/biofouling.webp', width: 900, height: 1200,
        alt: { fr: 'Sonde relevée après immersion, colonisée par des organismes marins.',
               en: 'Probe recovered after immersion, colonised by marine organisms.' } },
    ],
  },
  metrics: [
    { value: '103 940', valueEn: '103,940',
      label: { fr: 'mesures en base', en: 'measurements stored' },
      note:  { fr: 'pas de 15 min, 15 chunks', en: '15-min step, 15 chunks' } },
    { value: '×12,7', valueEn: '12.7×',
      label: { fr: 'compression du stockage', en: 'storage compression' },
      note:  { fr: '29 Mo → 2,3 Mo, sans perte', en: '29 MB → 2.3 MB, lossless' } },
    { value: '< 50 ms', valueEn: '< 50 ms',
      label: { fr: 'réponse de l’API', en: 'API response' },
      note:  { fr: 'relevé en production', en: 'measured in production' } },
  ],
  actions: [
    { kind: 'primary', href: { fr: 'vigie-ocean/', en: 'vigie-ocean/' },
      label: { fr: 'Lire l’étude de cas', en: 'Read the case study' }, icon: 'arrow' },
    { kind: 'ghost', href: { fr: '#contact', en: '#contact' },
      label: { fr: 'Demander une démo', en: 'Request a walkthrough' }, icon: 'mail' },
  ],
  // Affiché tel quel, sans lien : le dépôt n'est pas public.
  repoNote: {
    fr: 'Code source sous dépôt privé UPPA — accès sur demande.',
    en: 'Source code in a private UPPA repository — access on request.',
  },
};

export const projects = [
  {
    id: 'entrepot-colorants',
    name: { fr: 'Entrepôt de données — ventes de colorants naturels',
            en: 'Data warehouse — natural food colourant sales' },
    kicker: { fr: 'Décisionnel · Binôme', en: 'Business intelligence · Pair project' },
    context: { fr: 'Master 1 ISII, Université d’Alger 1 · 2024 – 2025',
               en: 'Master 1 ISII, Université d’Alger 1 · 2024 – 2025' },
    summary: {
      fr: 'Système d’aide à la décision sur l’évolution et l’impact des ventes de colorants naturels dans l’agroalimentaire. Schéma en étoile autour d’une table de faits et de cinq dimensions, chaîne ETL sous Talend Open Studio, entrepôt MySQL, cube OLAP puis restitution Power BI. Mesures suivies : quantité vendue, montant, score sanitaire et score environnemental.',
      en: 'A decision-support system on the evolution and impact of natural colourant sales in the food industry. Star schema around one fact table and five dimensions, ETL chain in Talend Open Studio, MySQL warehouse, OLAP cube and Power BI reporting. Measures tracked: quantity sold, amount, health score and environmental score.',
    },
    stack: ['Talend Open Studio', 'MySQL', 'OLAP', 'Power BI', 'Schéma en étoile'],
    note: { fr: 'Projet réalisé en binôme avec Chanez Ressam.',
            en: 'Built as a pair with Chanez Ressam.' },
    action: { href: 'assets/RapportProjetEntrepotDeDonnees.pdf',
              label: { fr: 'Rapport complet (PDF, 62 p.)', en: 'Full report (PDF, 62 pp.)' } },
  },
  {
    id: 'job-board',
    name: { fr: 'Job Board', en: 'Job Board' },
    kicker: { fr: 'Web · Équipe agile', en: 'Web · Agile team' },
    context: { fr: 'Master 1 SIGLIS, UPPA · 2025 – 2026', en: 'Master 1 SIGLIS, UPPA · 2025 – 2026' },
    summary: {
      fr: 'Application web conteneurisée développée en équipe selon une méthode agile, avec une chaîne d’intégration et de déploiement continus.',
      en: 'A containerised web application built by a team following an agile method, with a continuous integration and deployment pipeline.',
    },
    stack: ['Vue.js', 'NestJS', 'Docker', 'CI/CD'],
  },
  {
    id: 'etl-hop',
    name: { fr: 'Pipeline ETL multi-sources', en: 'Multi-source ETL pipeline' },
    kicker: { fr: 'Data engineering', en: 'Data engineering' },
    context: { fr: 'Master 1 SIGLIS, UPPA · 2025 – 2026', en: 'Master 1 SIGLIS, UPPA · 2025 – 2026' },
    summary: {
      fr: 'Nettoyage et unification de sources CSV, API et SQL dans un pipeline construit sous Apache Hop.',
      en: 'Cleaning and unifying CSV, API and SQL sources in a pipeline built with Apache Hop.',
    },
    stack: ['Apache Hop', 'ETL', 'SQL'],
  },
  {
    id: 'cnn-medical',
    name: { fr: 'Classification d’images médicales', en: 'Medical image classification' },
    kicker: { fr: 'Machine learning', en: 'Machine learning' },
    context: { fr: 'Master 1 ISII, Université d’Alger 1 · 2024 – 2025',
               en: 'Master 1 ISII, Université d’Alger 1 · 2024 – 2025' },
    summary: {
      fr: 'Approche hybride combinant un réseau de neurones convolutif et des descripteurs manuels, sur un jeu de données déséquilibré.',
      en: 'A hybrid approach combining a convolutional neural network with hand-crafted descriptors, on an imbalanced dataset.',
    },
    stack: ['Python', 'CNN', 'Feature engineering'],
  },
  {
    id: 'prix-immobilier',
    name: { fr: 'Prédiction de prix immobiliers', en: 'Property price prediction' },
    kicker: { fr: 'Machine learning', en: 'Machine learning' },
    context: { fr: 'Master 1 ISII, Université d’Alger 1 · 2024 – 2025',
               en: 'Master 1 ISII, Université d’Alger 1 · 2024 – 2025' },
    summary: {
      fr: 'Modèle de Gradient Boosting entraîné avec Scikit-learn, exposé dans une interface Tkinter.',
      en: 'A Gradient Boosting model trained with Scikit-learn, exposed through a Tkinter interface.',
    },
    stack: ['Python', 'Scikit-learn', 'Tkinter'],
  },
];
