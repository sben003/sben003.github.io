# sben003.github.io

Portfolio personnel de **Salem Benzineh** — data engineer, data analyst, développeur full-stack.

En ligne : <https://sben003.github.io>

## Stack

| Brique | Choix | Pourquoi |
| --- | --- | --- |
| Générateur | [Astro](https://astro.build) 7, sortie 100 % statique | HTML pré-rendu, zéro framework envoyé au navigateur |
| Langage | TypeScript (strict) | Données typées : un texte sans sa traduction ne compile pas |
| Styles | Tailwind CSS 4 + jetons CSS (`src/styles/global.css`) | Un seul jeu de variables pilote les thèmes sombre et clair |
| Composants | Astro, inspirés de shadcn/ui (cartes, boutons, badges, modale) | Pas de React côté client : les interactions tiennent en ~5 Ko de TypeScript |
| Animations | Transitions CSS + `IntersectionObserver` | Même rendu que Framer Motion, sans 50 Ko de JavaScript |
| Polices | Geist et Geist Mono, auto-hébergées (`@fontsource-variable`) | Aucune requête vers un tiers |
| Images | `astro:assets` (AVIF + WebP, tailles multiples) | Portrait : 146 Ko → 5 à 31 Ko selon l'écran |
| Hébergement | GitHub Pages, déployé par GitHub Actions | Chaque push sur `main` part en ligne |

Scores Lighthouse mesurés en local, avec compression gzip comme sur GitHub Pages :
**100 / 100 / 100 / 100** (performance, accessibilité, bonnes pratiques, SEO), en
mobile comme en desktop, sur l'accueil et les deux études de cas. CLS : 0.

## Structure

```
.github/workflows/deploy.yml   build + publication GitHub Pages
public/                        copié tel quel : favicon, og.png, photos, rapport PDF, robots.txt
scripts/
  charts.py                    génère les graphiques depuis les vraies mesures
  data/colorants.csv           jeu de données (simulé) de l'entrepôt
  extract-icons.mjs            fige les tracés Simple Icons dans src/data/brand-icons.ts
src/
  assets/portrait.jpg          portrait (optimisé au build, EXIF retirés)
  components/                  Hero, Strengths, CaseCard, StarSchema, SkillsBento, Timeline, Contact…
    case/                      en-tête d'étude (couverture), « En bref », étude suivante
  content/
    case-studies/*.html        texte des études de cas (FR et EN) + meta.json
    charts/*.html              graphiques générés — ne pas éditer
    diagrams/*.html            schémas d'architecture (ouverts en modale depuis l'accueil)
  data/                        profil, projets, compétences, parcours — toujours { fr, en }
    case-studies.ts            en-tête et résumé de chaque étude : couverture, chiffres, problème,
                               réponse, impact, fiche projet
    strengths.ts               « Ce que j'apporte » : quatre compétences, chacune liée à sa preuve
  lib/charts.ts                insère les graphiques ; les plus lourds sortent en /charts/*.svg
  i18n/ui.ts                   libellés d'interface bilingues
  layouts/Base.astro           <head>, SEO, thème, en-tête, pied de page
  pages/                       une route par page (URL inchangées depuis l'ancien site)
                               + assets/brands.svg.ts, le sprite des icônes de marque
  scripts/main.ts              thème, apparitions, compteurs, copie d'e-mail, modales, graphiques
  styles/global.css            jetons de couleur, composants, graphiques, études de cas
```

Pages publiques : `/`, `/en/`, `/vigie-ocean/`, `/en/vigie-ocean/`, `/entrepot-donnees/`,
`/en/data-warehouse/`, `/radiographies/`, `/en/chest-x-rays/`.

`_sources/` (hors dépôt, ignoré par Git) contient les documents lus pour rédiger : rapports de
TP, brouillons. Rien n'en est publié tel quel.

## Travailler en local

Node 22.12 ou plus récent.

```bash
npm install
npm run dev        # http://localhost:4321, rechargement à chaud
npm run build      # génère dist/
npm run preview    # sert dist/ pour vérifier le rendu final
npm run check      # vérification TypeScript des composants
```

> **Windows avec Smart App Control** : le binaire natif du compilateur Astro peut
> être bloqué (`Cannot find native binding`, code 4551). Installer sa variante
> WebAssembly, sans l'ajouter au `package.json` (la CI Linux n'en a pas besoin) :
>
> ```bash
> npm i --no-save --force @astrojs/compiler-binding-wasm32-wasi@0.5.1
> ```
>
> À refaire après chaque `npm install` / `npm ci`. La version doit correspondre à
> celle de `node_modules/@astrojs/compiler-binding`.

## Publier

```bash
git add -A
git commit -m "Mise à jour du portfolio"
git push
```

Le workflow `.github/workflows/deploy.yml` installe, construit et publie. Suivi dans
l'onglet **Actions** du dépôt ; compter une à deux minutes. Réglage à faire une seule
fois : **Settings → Pages → Source : GitHub Actions**.

## Modifier le contenu

**Accueil** — tout vient de `src/data/` et `src/i18n/ui.ts`. Chaque texte porte ses
deux langues (`{ fr: '…', en: '…' }`) : impossible d'en oublier une.

| Pour changer… | Fichier |
| --- | --- |
| Nom, e-mail, liens, CV, chiffres du hero | `src/data/profile.ts` |
| Études de cas (cartes de l'accueil), projets académiques | `src/data/projects.ts` |
| Compétences, niveaux, cas d'usage | `src/data/skills.ts` |
| Expérience, formation, langues | `src/data/timeline.ts` |
| Titres de section, boutons, statut de disponibilité | `src/i18n/ui.ts` |

**Études de cas** — trois couches :

- `src/data/case-studies.ts` : ce qui se lit en trente secondes (couverture, chiffres clés,
  problème / réponse / impact, rôle, période, équipe, cadre, stack, note d'honnêteté) ;
- `src/content/case-studies/<slug>.<fr|en>.html` : le corps de l'étude, section par section ;
- `meta.json` : titre, description et sommaire de navigation.

Une nouvelle étude se déclare dans ces trois fichiers et dans `src/pages/`. L'ordre du
tableau `studies` fixe l'« étude suivante » proposée en fin de page. Reporter chaque modification dans les deux
langues. Un commentaire `<!-- chart:nom -->` insère le graphique correspondant.

**Niveau des technologies** — `production` (point plein) : a servi dans un système
livré et exploité. `projet` (point creux) : projet académique ou prototype. C'est un
fait vérifiable, pas une note.

### Remettre le CV en ligne

Le CV est **volontairement masqué** : le document contient encore
`Rythme [À COMPLÉTER]`. Une fois corrigé :

1. déposer le PDF dans `public/assets/CV-Salem-Benzineh.pdf` ;
2. dans `src/data/profile.ts`, remplacer `cv: null` par
   `cv: '/assets/CV-Salem-Benzineh.pdf'`.

Les boutons « Télécharger mon CV » apparaissent alors dans le hero et le contact.

Le numéro de téléphone du CV ne doit **jamais** apparaître dans les pages (spam).

### Régénérer les graphiques

Les courbes sont tracées depuis les vraies mesures de la station Port de Bayonne
(export Excel de Vigie Océan) et depuis `scripts/data/colorants.csv`.

```bash
pip install openpyxl                 # une fois
npm run charts                       # écrit src/content/charts/*.html
```

Chemin de l'export Excel surchargeable par la variable `SERIES_XLSX`. Les séries
sont mises en cache dans `.cache/` (non versionné).

### Ajouter une photo

Déposer un WebP dans `public/assets/img/`, **sans EXIF** (les photos de téléphone
contiennent les coordonnées GPS) :

```python
from PIL import Image, ImageOps
im = ImageOps.exif_transpose(Image.open("source.jpeg")).convert("RGB")
im.thumbnail((1200, 1200), Image.LANCZOS)
clean = Image.new(im.mode, im.size); clean.putdata(list(im.getdata()))
clean.save("public/assets/img/nom.webp", "WEBP", quality=78, method=6)
```

Toujours renseigner `width`, `height`, `loading="lazy"` et un `alt` descriptif.
**Droit à l'image** : ne publier que des photos où les tiers ne sont pas
identifiables, ou avec leur accord.

### Icônes de marque

Tracés [Simple Icons](https://simple-icons.org) (CC0 ; les marques appartiennent à
leurs détenteurs), figés dans `src/data/brand-icons.ts`. Au build, ils deviennent un
sprite séparé, `/assets/brands.svg` (`src/pages/assets/brands.svg.ts`), mis en cache
une fois pour tout le site : inliné, il pesait 35 % de la page d'accueil. Pour en
ajouter une :

```bash
npm i --no-save simple-icons
# ajouter le slug dans SLUGS, dans scripts/extract-icons.mjs
node scripts/extract-icons.mjs
```

**Ne jamais « optimiser » ces tracés** : arrondir les décimales rend les séquences
de nombres ambiguës et corrompt les glyphes.

## Notes techniques

- **Thème** : sombre par défaut ; le bouton bascule en clair et mémorise le choix
  (`localStorage`, clé `sb-theme`). Un script en ligne dans le `<head>` l'applique
  avant le premier rendu : pas de flash.
- **Amélioration progressive** : sans JavaScript, tout le contenu est visible ; les
  apparitions, compteurs, info-bulles et le bouton de thème s'ajoutent par-dessus.
  Les compteurs finissent toujours sur le texte exact rendu côté serveur.
- **Graphiques** : SVG générés, couleurs pilotées par les jetons CSS (ils suivent le
  thème). La série brute de 46 000 points est dessinée en enveloppe min/max par
  colonne de pixels ; les courbes interactives sont sous-échantillonnées par LTTB.
- **Pièges CSS rencontrés** : une règle `.parent élément` (0-1-1) écrase une classe
  seule (0-1-0) — la bascule des schémas large / vertical en a souffert. Le reset de
  Tailwind remet `margin: 0` sur `<dialog>` : il faut rendre `margin: auto` pour que
  la modale soit centrée.
- **Stabilité de la mise en page** : les polices latines sont préchargées et le bouton
  de thème a sa place réservée dès le premier rendu (invisible sans JS).
- **Graphiques différés** : un graphique de plus de 12 000 caractères est publié à part
  (`/charts/<nom>.<langue>.svg`) et chargé à l'approche du lecteur, dans un emplacement au
  ratio exact de son SVG. La page Vigie Océan est passée ainsi de 81 à 36 Ko compressés.
- **Photos** : celles des études s'agrandissent au clic (visionneuse native `<dialog>`). La
  couverture passe par `astro:assets` (AVIF/WebP, trois largeurs).
- **SEO** : `canonical` et `hreflang` croisés, Open Graph, `schema.org/Person`,
  sitemap généré (`/sitemap-index.xml`), `robots.txt`.

## Provenance des chiffres

**Vigie Océan** — rapport de stage M1 et dépôt du projet : 103 940 mesures,
compression de 29 Mo à 2,3 Mo (facteur 12,7), requêtes sous 50 ms (117 ms au pire
cas), 1 800 points par courbe à 60 images/s, 14 tests Pytest, 7 conteneurs.

**Entrepôt de données** — rapport `RapportProjetEntrepotDeDonnees.pdf` : 100 ventes,
5 dimensions + 1 table de faits, 8 data marts, 4 mesures. Le jeu de données est
**simulé** ; les pages le disent explicitement.

**AI UNIVERS** — CV : cinq sources hétérogènes, trois tableaux de bord Power BI. Ces
chiffres décrivent le périmètre du stage, distincts de ceux du rapport, qui décrivent
le projet d'entrepôt rendu comme travail de module.

**Radiographies pulmonaires** — rapports de TP 01 à 03 et rapport final « Projet IA »
(module IA – Apprentissage automatique, Université d'Alger 1, 2024 – 2025) : 5 216
radiographies (3 875 / 1 341), matrice de confusion 273 / 17 / 20 / 733 sur 1 043 radios de
test, AUC 0,99 (sortie du code ; le texte du rapport écrit 0,98), courbes du CNN sur cinq
époques, 19 034 177 paramètres. Les pourcentages de la page sont calculés depuis la matrice.

**Prix immobiliers** — rapports de TP 04 à 07 : R² de 64 % (régression linéaire), 62 % (arbre
de décision), 61 % (forêt aléatoire). Aucun rapport ne mentionne de Gradient Boosting.

**Comptage de pièces** — rapport « Système de comptage des pièces de monnaie » : sur 50
images, 85 % d'exactitude, 90 % de précision, 80 % de rappel. La photo de démonstration du
rapport est une image Getty Images : elle n'est pas publiée.

Ne modifier aucun de ces chiffres sans une source correspondante.
