import type { L } from '../i18n/ui';
import type { ImageMetadata } from 'astro';
import type { StackItem } from './projects';
import bouee from '../assets/covers/bouee-large.webp';

/**
 * En-tête et résumé des études de cas. Le corps éditorial reste en HTML dans
 * src/content/case-studies/ ; ici vit ce qui se lit en dix secondes : la
 * couverture, les chiffres, le problème, la réponse, l'impact, la fiche projet.
 * Chaque chiffre est repris du rapport correspondant.
 */
export type Slug = 'vigie-ocean' | 'entrepot-donnees' | 'radiographies';

export type Cover =
  | { kind: 'photo'; image: ImageMetadata; alt: L; title: L; caption: L }
  | { kind: 'star' }
  | { kind: 'matrix' };

export interface Study {
  slug: Slug;
  paths: Record<'fr' | 'en', string>;
  kicker: L;
  title: L;
  lede: L;
  stats: { value: L; label: L }[];
  tldr: { problem: L; answer: L; impact: L };
  facts: { role: L; period: L; team: L; frame: L };
  stack: StackItem[];
  cover: Cover;
  note?: { title: L; body: L };
  links?: { href: string; label: L; icon: 'file' | 'lock' }[];
}

export const studies: Study[] = [
  {
    slug: 'vigie-ocean',
    paths: { fr: '/vigie-ocean/', en: '/en/vigie-ocean/' },
    kicker: { fr: 'Supervision environnementale marine · Côte basque', en: 'Marine environmental monitoring · Basque coast' },
    title: { fr: 'Vigie Océan', en: 'Vigie Océan' },
    lede: {
      fr: 'Collecter, normaliser, valider, stocker et restituer en continu les mesures de sondes hétérogènes, sur une infrastructure unique, auto-hébergée et entièrement conteneurisée. De la sonde immergée dans l’estuaire de l’Adour jusqu’à l’écran de l’océanographe.',
      en: 'Continuously collect, normalise, validate, store and serve the readings of heterogeneous probes, on a single self-hosted, fully containerised infrastructure. From the probe submerged in the Adour estuary to the oceanographer’s screen.',
    },
    stats: [
      { value: { fr: '103 940', en: '103,940' }, label: { fr: 'mesures en base', en: 'measurements stored' } },
      { value: { fr: '×12,7', en: '12.7×' }, label: { fr: 'compression sans perte', en: 'lossless compression' } },
      { value: { fr: '< 50 ms', en: '< 50 ms' }, label: { fr: 'requêtes courantes', en: 'everyday queries' } },
      { value: { fr: '7', en: '7' }, label: { fr: 'conteneurs Docker', en: 'Docker containers' } },
    ],
    tldr: {
      problem: {
        fr: 'Chaque marque de sonde enferme ses mesures dans son propre cloud, son format, son fuseau et son abonnement. Pour un laboratoire qui en exploite plusieurs, la donnée se fragmente en silos.',
        en: 'Each probe brand locks its readings into its own cloud, format, timezone and subscription. For a laboratory running several, data fragments into silos.',
      },
      answer: {
        fr: 'Une plateforme auto-hébergée : un registre de parseurs qui reconnaît chaque format par son contenu, un stockage UTC en hypertable TimescaleDB, une API FastAPI et une interface React où chaque correction reste réversible.',
        en: 'A self-hosted platform: a parser registry that recognises each format by its contents, UTC storage in a TimescaleDB hypertable, a FastAPI backend and a React interface where every correction stays reversible.',
      },
      impact: {
        fr: 'Toutes les sondes au même endroit : 103 940 mesures en base, un historique compressé de 29 à 2,3 Mo sans perte, des requêtes courantes sous 50 ms et des courbes fluides à 60 images par seconde.',
        en: 'Every probe in one place: 103,940 measurements stored, a history compressed from 29 to 2.3 MB without loss, everyday queries under 50 ms and curves that stay smooth at 60 frames per second.',
      },
    },
    facts: {
      role: { fr: 'Conception, développement et mise en production — seul', en: 'Design, development and production rollout — single-handedly' },
      period: { fr: 'Avril – juillet 2026 · stage de fin de M1', en: 'April – July 2026 · final-year M1 internship' },
      team: { fr: 'Seul, en lien avec les constructeurs de sondes et la DSI de l’université', en: 'Solo, liaising with the probe manufacturers and the university IT department' },
      frame: { fr: 'UPPA Tech, plateau SCOPE — Anglet', en: 'UPPA Tech, SCOPE platform — Anglet' },
    },
    stack: [
      { name: 'Python', icon: 'python' }, { name: 'FastAPI', icon: 'fastapi' },
      { name: 'TimescaleDB', icon: 'timescale' }, { name: 'PostgreSQL', icon: 'postgresql' },
      { name: 'React', icon: 'react' }, { name: 'TypeScript', icon: 'typescript' },
      { name: 'Docker Compose', icon: 'docker' }, { name: 'Google Cloud', icon: 'googlecloud' },
      { name: 'Nginx', icon: 'nginx' }, { name: 'Pytest', icon: 'pytest' },
    ],
    cover: {
      kind: 'photo', image: bouee,
      alt: {
        fr: 'Bouée d’atterrissage rouge et blanche au large, avec une annexe pneumatique accostée pour une intervention de maintenance.',
        en: 'Red and white landfall buoy offshore, with an inflatable tender alongside for a maintenance operation.',
      },
      title: { fr: 'Intervention au large', en: 'Servicing offshore' },
      caption: { fr: 'La sonde vit sous cette bouée : y accéder impose une sortie en mer.', en: 'The probe lives under this buoy: reaching it means going out to sea.' },
    },
    links: [
      { href: '', label: { fr: 'Code source sous dépôt privé UPPA — accès sur demande', en: 'Source code in a private UPPA repository — access on request' }, icon: 'lock' },
    ],
  },
  {
    slug: 'entrepot-donnees',
    paths: { fr: '/entrepot-donnees/', en: '/en/data-warehouse/' },
    kicker: { fr: 'Décisionnel · Chaîne complète', en: 'Business intelligence · End-to-end chain' },
    title: { fr: 'Entrepôt de données', en: 'Data warehouse' },
    lede: {
      fr: 'Construire, de bout en bout, la chaîne qui va d’un fichier plat à un tableau de bord : modélisation dimensionnelle selon Kimball, ETL sous Talend, entrepôt MySQL, cube OLAP, puis restitution Power BI.',
      en: 'Build, end to end, the chain that runs from a flat file to a dashboard: Kimball dimensional modelling, ETL in Talend, a MySQL warehouse, an OLAP cube, then Power BI reporting.',
    },
    stats: [
      { value: { fr: '5 + 1', en: '5 + 1' }, label: { fr: 'dimensions et table de faits', en: 'dimensions and fact table' } },
      { value: { fr: '8', en: '8' }, label: { fr: 'data marts analytiques', en: 'analytical data marts' } },
      { value: { fr: '4', en: '4' }, label: { fr: 'mesures, sum ou avg', en: 'measures, sum or avg' } },
      { value: { fr: '4', en: '4' }, label: { fr: 'outils enchaînés', en: 'tools chained' } },
    ],
    tldr: {
      problem: {
        fr: 'Croiser la performance commerciale de colorants alimentaires avec leur impact sanitaire et environnemental : des mesures qui ne vivent pas dans le même tableau, à lire selon cinq axes.',
        en: 'Cross the commercial performance of food colourants with their health and environmental impact: measures that do not live in the same table, to be read along five axes.',
      },
      answer: {
        fr: 'Un schéma en étoile — une table de faits, cinq dimensions —, une chaîne ETL rejouable sous Talend, un entrepôt MySQL et un cube Pentaho où les montants s’additionnent et les scores se moyennent.',
        en: 'A star schema — one fact table, five dimensions —, a replayable ETL chain in Talend, a MySQL warehouse and a Pentaho cube where amounts sum and scores average.',
      },
      impact: {
        fr: 'Une chaîne décisionnelle complète et rejouable, de la source au tableau de bord Power BI : huit data marts prêts à l’analyse croisée.',
        en: 'A complete, replayable business-intelligence chain, from source to Power BI dashboard: eight data marts ready for cross-analysis.',
      },
    },
    facts: {
      role: { fr: 'Modélisation dimensionnelle, flux ETL, cube OLAP et restitution', en: 'Dimensional modelling, ETL flows, OLAP cube and reporting' },
      period: { fr: 'Mai – juillet 2025 · stage Data Analyst', en: 'May – July 2025 · Data Analyst internship' },
      team: { fr: 'En binôme avec Chanez Ressam', en: 'Paired with Chanez Ressam' },
      frame: { fr: 'AI UNIVERS · projet du module Entrepôt de données, M1 ISII', en: 'AI UNIVERS · Data Warehousing module project, M1 ISII' },
    },
    stack: [
      { name: 'Talend Open Studio', icon: 'talend' }, { name: 'MySQL', icon: 'mysql' },
      { name: 'Pentaho', icon: null }, { name: 'Power BI', icon: null }, { name: 'SQL', icon: null },
    ],
    cover: { kind: 'star' },
    note: {
      title: { fr: 'Précision honnête', en: 'An honest caveat' },
      body: {
        fr: 'Le jeu de données est simulé, construit pour être réaliste et exploitable. Ce qui se démontre ici n’est pas un résultat métier, mais la maîtrise d’une chaîne décisionnelle complète et des choix de conception qu’elle impose.',
        en: 'The dataset is simulated, built to be realistic and workable. What this demonstrates is not a business result, but command of a complete business-intelligence chain and of the design decisions it forces.',
      },
    },
    links: [
      { href: '/assets/RapportProjetEntrepotDeDonnees.pdf', label: { fr: 'Rapport complet (PDF, 62 p.)', en: 'Full report (PDF, 62 pp., French)' }, icon: 'file' },
    ],
  },
  {
    slug: 'radiographies',
    paths: { fr: '/radiographies/', en: '/en/chest-x-rays/' },
    kicker: { fr: 'Machine learning · Vision par ordinateur', en: 'Machine learning · Computer vision' },
    title: { fr: 'Radiographies pulmonaires', en: 'Chest X-rays' },
    lede: {
      fr: 'Distinguer automatiquement une radiographie normale d’une radiographie présentant une pneumonie. Deux familles de méthodes face à face : des descripteurs d’image conçus à la main avec une régression logistique, et un réseau convolutif qui apprend seul ses filtres.',
      en: 'Automatically telling a normal chest X-ray from one showing pneumonia. Two families of methods side by side: hand-crafted image descriptors with a logistic regression, and a convolutional network that learns its own filters.',
    },
    stats: [
      { value: { fr: '5 216', en: '5,216' }, label: { fr: 'radiographies', en: 'X-rays' } },
      { value: { fr: '96,5 %', en: '96.5%' }, label: { fr: 'exactitude en test', en: 'test accuracy' } },
      { value: { fr: '97,3 %', en: '97.3%' }, label: { fr: 'pneumonies détectées', en: 'pneumonia cases found' } },
      { value: { fr: '3', en: '3' }, label: { fr: 'approches comparées', en: 'approaches compared' } },
    ],
    tldr: {
      problem: {
        fr: 'Classer des radiographies en « normale » ou « pneumonie » sur un jeu déséquilibré : trois sur quatre montrent une pneumonie, si bien qu’un modèle naïf paraît déjà bon.',
        en: 'Classify X-rays as “normal” or “pneumonia” on an imbalanced set: three in four show pneumonia, so a naive model already looks good.',
      },
      answer: {
        fr: 'Quatre descripteurs d’image (Gabor, PHOG, DCT, Fourier) normalisés puis une régression logistique, mis face à un CNN de trois couches convolutives.',
        en: 'Four image descriptors (Gabor, PHOG, DCT, Fourier), normalised, then a logistic regression, set against a CNN with three convolutional layers.',
      },
      impact: {
        fr: '96,5 % d’exactitude sur 1 043 radios de test et 97,3 % des pneumonies détectées. Le CNN, en surapprentissage, est écarté : le modèle le plus simple l’emporte.',
        en: '96.5% accuracy on 1,043 test X-rays and 97.3% of pneumonia cases found. The CNN, overfitting, is set aside: the simplest model wins.',
      },
    },
    facts: {
      role: { fr: 'Extraction des descripteurs, modèles, évaluation et rapports', en: 'Descriptor extraction, models, evaluation and reports' },
      period: { fr: '2024 – 2025 · trois TP et un rapport final', en: '2024 – 2025 · three lab sessions and a final report' },
      team: { fr: 'En binôme avec Chanez Ressam', en: 'Paired with Chanez Ressam' },
      frame: { fr: 'Module IA – Apprentissage automatique · M1 ISII, Université d’Alger 1', en: 'AI – Machine Learning module · M1 ISII, Université d’Alger 1' },
    },
    stack: [
      { name: 'Python', icon: 'python' }, { name: 'scikit-learn', icon: 'scikitlearn' },
      { name: 'TensorFlow / Keras', icon: 'tensorflow' }, { name: 'PyTorch', icon: 'pytorch' },
      { name: 'OpenCV', icon: 'opencv' }, { name: 'NumPy', icon: 'numpy' }, { name: 'HDF5', icon: null },
    ],
    cover: { kind: 'matrix' },
    note: {
      title: { fr: 'Précision honnête', en: 'Honest disclaimer' },
      body: {
        fr: 'Projet de cours, pas un dispositif médical. Les résultats viennent d’un unique découpage aléatoire entre entraînement (80 %) et test (20 %). Les limites de méthode sont détaillées à la fin, dans « Ce que je referais aujourd’hui ».',
        en: 'A coursework project, not a medical device. The results come from a single random split between training (80%) and test (20%). The methodological limits are set out at the end, in “What I would do differently today”.',
      },
    },
  },
];

export const studyBySlug = (slug: Slug): Study => {
  const s = studies.find((x) => x.slug === slug);
  if (!s) throw new Error(`Étude inconnue : ${slug}`);
  return s;
};

/** L'étude suivante, en boucle : la lecture ne s'arrête jamais sur une impasse. */
export const nextStudy = (slug: Slug): Study => {
  const i = studies.findIndex((x) => x.slug === slug);
  return studies[(i + 1) % studies.length];
};
