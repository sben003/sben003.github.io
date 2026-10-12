export type Lang = 'fr' | 'en';

/** Texte bilingue : chaque chaîne affichée existe dans les deux langues. */
export interface L {
  fr: string;
  en: string;
}

export const t = (field: L | string, lang: Lang): string =>
  typeof field === 'string' ? field : field[lang];

/** Préfixe de chemin d'une page selon la langue. */
export const home = (lang: Lang): string => (lang === 'fr' ? '/' : '/en/');

export const ui = {
  skip: { fr: 'Aller au contenu principal', en: 'Skip to main content' },
  nav: {
    projects: { fr: 'Projets', en: 'Projects' },
    skills: { fr: 'Compétences', en: 'Skills' },
    path: { fr: 'Parcours', en: 'Background' },
    contact: { fr: 'Contact', en: 'Contact' },
  },
  navLabel: { fr: 'Sections du site', en: 'Site sections' },
  menu: { fr: 'Ouvrir le menu', en: 'Open the menu' },
  langLabel: { fr: 'Langue', en: 'Language' },
  themeToDark: { fr: 'Passer en thème sombre', en: 'Switch to dark theme' },
  themeToLight: { fr: 'Passer en thème clair', en: 'Switch to light theme' },

  hero: {
    status: { fr: 'Ouvert aux opportunités · alternance dès septembre 2026', en: 'Open to opportunities · apprenticeship from September 2026' },
    roles: { fr: 'Data engineer · Data analyst · Full-stack', en: 'Data engineer · Data analyst · Full-stack' },
    hook: {
      fr: 'Je construis des chaînes de données de bout en bout — de la sonde immergée au tableau de bord.',
      en: 'I build end-to-end data pipelines — from the submerged probe to the dashboard.',
    },
    sub: {
      fr: 'Étudiant en Master 2 Informatique SIGLIS à l’Université de Pau et des Pays de l’Adour, à Anglet. Ma dernière mission : concevoir et mettre en production, seul, une plateforme de supervision environnementale marine.',
      en: 'Master 2 Computer Science student (SIGLIS track) at the Université de Pau et des Pays de l’Adour, in Anglet. My latest assignment: designing and shipping, single-handedly, a marine environmental monitoring platform.',
    },
    ctaProjects: { fr: 'Voir mes projets', en: 'See my projects' },
    ctaContact: { fr: 'Me contacter', en: 'Get in touch' },
    ctaCv: { fr: 'Télécharger mon CV', en: 'Download my CV' },
    location: { fr: 'Anglet · Pays basque', en: 'Anglet · Basque Country' },
    portraitAlt: { fr: 'Portrait de Salem Benzineh', en: 'Portrait of Salem Benzineh' },
    traceNote: {
      fr: 'En fond : température et conductivité relevées à la station Port de Bayonne, mars 2025 – juin 2026.',
      en: 'In the background: temperature and conductivity recorded at the Port of Bayonne station, March 2025 – June 2026.',
    },
  },

  sections: {
    projects: { eyebrow: { fr: 'Études de cas', en: 'Case studies' }, title: { fr: 'Projets phares', en: 'Flagship projects' },
      lede: { fr: 'Présentés par l’impact : le problème, la réponse technique, mon rôle, et ce qui a été mesuré.', en: 'Presented by impact: the problem, the technical answer, my role, and what was measured.' } },
    skills: { eyebrow: { fr: 'Stack', en: 'Stack' }, title: { fr: 'Compétences', en: 'Skills' },
      lede: { fr: 'Regroupées par domaine. Chaque techno indique si elle a servi dans un système livré ou dans un projet.', en: 'Grouped by domain. Each technology says whether it served in a shipped system or in a project.' } },
    path: { eyebrow: { fr: 'Parcours', en: 'Background' }, title: { fr: 'Expérience & formation', en: 'Experience & education' } },
    contact: { eyebrow: { fr: 'Contact', en: 'Contact' }, title: { fr: 'Parlons de votre équipe data', en: 'Let’s talk about your data team' },
      lede: { fr: 'Je cherche une alternance à partir de septembre 2026 (rythme 2 semaines / 2 semaines), puis un stage de fin d’études à partir de mars 2027. Je réponds à chaque message.', en: 'I am looking for an apprenticeship from September 2026 (two weeks on, two weeks off), then a final-year internship from March 2027. I reply to every message.' } },
  },

  project: {
    problem: { fr: 'Le problème', en: 'The problem' },
    solution: { fr: 'La réponse', en: 'The answer' },
    role: { fr: 'Rôle', en: 'Role' },
    results: { fr: 'Résultats mesurés', en: 'Measured results' },
    stack: { fr: 'Stack', en: 'Stack' },
    caseStudy: { fr: 'Étude de cas complète', en: 'Full case study' },
    architecture: { fr: 'Voir l’architecture', en: 'View architecture' },
    close: { fr: 'Fermer', en: 'Close' },
    realData: { fr: 'Données réelles · survolez la courbe', en: 'Real data · hover the curve' },
    report: { fr: 'Rapport (PDF, 62 p.)', en: 'Report (PDF, 62 pp.)' },
    others: { fr: 'Projets académiques', en: 'Academic projects' },
    othersLede: { fr: 'Travaux de master, en binôme ou en équipe. Les chiffres affichés viennent des rapports rendus.', en: 'Master’s coursework, in pairs or in teams. The figures shown come from the reports handed in.' },
    flow: { fr: 'La chaîne', en: 'The pipeline' },
    starHint: { fr: 'Modèle en étoile · survolez une dimension', en: 'Star schema · hover a dimension' },
    archTitle: { fr: 'Architecture', en: 'Architecture' },
  },

  levels: {
    production: { fr: 'Utilisé dans un système livré et exploité', en: 'Used in a system shipped and operated' },
    projet: { fr: 'Utilisé en projet ou en prototype', en: 'Used in a project or a prototype' },
    productionShort: { fr: 'en production', en: 'in production' },
    projetShort: { fr: 'en projet', en: 'in a project' },
    legend: { fr: 'Légende', en: 'Legend' },
    uses: { fr: 'Mis en œuvre pour', en: 'Applied to' },
    seen: { fr: 'À voir en contexte', en: 'See it in context' },
  },

  path: {
    experience: { fr: 'Expérience', en: 'Experience' },
    education: { fr: 'Formation', en: 'Education' },
    languages: { fr: 'Langues', en: 'Languages' },
    read: { fr: 'Étude de cas', en: 'Case study' },
  },

  contact: {
    copy: { fr: 'Copier l’adresse', en: 'Copy address' },
    copied: { fr: 'Adresse copiée dans le presse-papier', en: 'Address copied to clipboard' },
    write: { fr: 'Écrire un e-mail', en: 'Write an email' },
  },

  footer: {
    built: { fr: 'Construit avec Astro et Tailwind CSS, hébergé sur GitHub Pages.', en: 'Built with Astro and Tailwind CSS, hosted on GitHub Pages.' },
    source: { fr: 'Code source', en: 'Source code' },
    other: { fr: 'English version', en: 'Version française' },
  },

  cs: {
    back: { fr: 'Retour aux projets', en: 'Back to projects' },
  },
} as const;
