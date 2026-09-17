# sben003.github.io

Portfolio personnel de **Salem Benzineh** — développeur / data engineer.

En ligne : <https://sben003.github.io>

## Ce que c'est

Un site statique, sans framework et sans dépendance d'exécution. Aucune police
externe, aucun traceur, aucune requête vers un tiers.

Trois sections sont générées depuis des fichiers de données par un script Node
qui tourne **sur ta machine** (voir « Données et génération »). Ce qui est publié
reste du HTML statique : GitHub Pages ne compile rien.

### Quatre pages

| Page | Fichier |
| --- | --- |
| Accueil (FR) | `index.html` |
| Accueil (EN) | `en/index.html` |
| Étude de cas Vigie Océan (FR) | `vigie-ocean/index.html` |
| Étude de cas Vigie Océan (EN) | `en/vigie-ocean/index.html` |

### Le reste

| Fichier | Rôle |
| --- | --- |
| `assets/styles.css` | Toute la mise en forme, thèmes clair et sombre inclus |
| `assets/main.js` | Bascule de thème + surlignage de la section courante |
| `assets/img/*.webp` | Photographies du stage, déjà optimisées |
| `assets/og.png` | Aperçu affiché quand le lien est partagé (LinkedIn, etc.) |
| `assets/CV-Salem-Benzineh.pdf` | Le CV téléchargeable (généré depuis le `.docx`) |
| `.nojekyll` | Demande à GitHub Pages de servir les fichiers tels quels |

### Données et génération

Trois sections de la page d'accueil — **Projet vedette**, **Projets** et
**Compétences** — ne s'écrivent plus à la main. Elles sont générées depuis des
fichiers de données, en français et en anglais d'un coup, ce qui supprime le
risque de voir les deux langues diverger.

| Fichier | Rôle |
| --- | --- |
| `data/skills.mjs` | Domaines, technologies, niveaux, tags de cas d'usage, pratiques |
| `data/projects.mjs` | Projet vedette + projets secondaires |
| `build/render.mjs` | Génère le HTML et l'injecte entre les marqueurs `<!-- gen:… -->` |
| `build/brand-icons.mjs` | Tracés d'icônes Simple Icons figés (fichier généré) |
| `build/fragments/` | Le schéma d'architecture de l'accueil, maintenu à la main |

```bash
# après toute modification dans data/
npm run build          # ou : node build/render.mjs
```

**Ne pas éditer à la main** le HTML situé entre `<!-- gen:nom:start -->` et
`<!-- gen:nom:end -->` : la prochaine génération l'écrasera. Tout le reste des
pages reste éditable normalement.

Le site publié demeure du HTML statique : `build/` ne part jamais au navigateur,
et **aucun `npm install` n'est nécessaire** — les tracés d'icônes sont figés dans
le dépôt.

### Icônes

Les icônes de marque proviennent de [Simple Icons](https://simple-icons.org)
(icônes sous licence CC0 ; les marques appartiennent à leurs détenteurs). Elles
sont inlinées dans un sprite SVG, une seule fois par page.

Par défaut elles n'apparaissent que sur les pills du projet vedette : les
29 glyphes de la section Compétences pèsent 17 Ko compressés contre 10 Ko pour
tout le contenu de la page. Pour les activer partout, passer `showBrandIcons` à
`true` en haut de `data/skills.mjs`, puis régénérer.

Pour ajouter un glyphe absent du sprite :

```bash
npm install simple-icons          # temporaire, hors du dépôt
# ajouter le slug voulu dans la liste SLUGS de build/extract-icons.mjs
node build/extract-icons.mjs
npm run build
```

## Mettre à jour le site

Le site se publie tout seul : **tout ce qui est poussé sur `main` part en ligne**
en une à deux minutes. Pas de build, pas d'étape intermédiaire.

```bash
# 1. modifier les fichiers

# 2. vérifier en local avant de publier
python -m http.server 8765
#    puis ouvrir http://127.0.0.1:8765

# 3. publier
git add -A
git commit -m "Mise à jour du portfolio"
git push
```

Attendre une à deux minutes, puis recharger <https://sben003.github.io> avec
`Ctrl + F5` (le cache du navigateur est parfois têtu).

### Remettre le CV en ligne

Le CV est **volontairement hors ligne** : le document contient encore
`Rythme [À COMPLÉTER]`. Une fois corrigé :

1. retirer la ligne `assets/CV-Salem-Benzineh.pdf` du `.gitignore` ;
2. remettre le bouton dans l'intro et dans la section Contact des deux pages
   d'accueil (voir le commit « Compétences en bento… » pour le markup exact) :

```html
<a class="btn btn--primary" href="assets/CV-Salem-Benzineh.pdf" download>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path d="M12 3v12M7 11l5 5 5-5M4 20h16"/>
  </svg>
  Télécharger le CV (PDF)
</a>
```

Pour régénérer le PDF depuis le `.docx` (Word requis) :

```powershell
$w = New-Object -ComObject Word.Application
$d = $w.Documents.Open("...ssets\CV_Salem_Benzineh_Data_Alternance_2026.docx", $false, $true)
$d.ExportAsFixedFormat("...ssets\CV-Salem-Benzineh.pdf", 17)
$d.Close($false); $w.Quit()
```

### Modifier un texte

Deux cas, à ne pas confondre.

**Compétences, projets, projet vedette** — éditer `data/skills.mjs` ou
`data/projects.mjs`, où chaque texte porte ses deux variantes `fr` et `en`, puis
`npm run build`. Les deux langues restent forcément synchronisées.

**Tout le reste** (intro, expérience, parcours, contact, pages d'étude de cas) —
édition directe du HTML. Dans ce cas, **reporter la modification dans la page
française et dans son équivalent anglais**, sinon les deux versions divergent.

### Ajouter une photo

Les images sont en WebP, redimensionnées à 1200 px sur leur plus grand côté, et
**réencodées sans leurs EXIF** — les photos de téléphone contiennent les
coordonnées GPS du lieu de prise de vue, qui n'ont rien à faire en ligne.

```python
from PIL import Image, ImageOps
im = ImageOps.exif_transpose(Image.open("source.jpeg")).convert("RGB")
im.thumbnail((1200, 1200), Image.LANCZOS)
clean = Image.new(im.mode, im.size)          # nouvelle image = aucun EXIF reporté
clean.putdata(list(im.getdata()))
clean.save("assets/img/nom.webp", "WEBP", quality=78, method=6)
```

Dans le HTML, toujours renseigner `width`, `height`, `loading="lazy"` et un
`alt` descriptif — sans quoi la page saute au chargement et l'image devient
invisible aux lecteurs d'écran.

**Attention au droit à l'image** : ne publier que des photos où les tiers ne sont
pas identifiables, ou avec leur accord.

### Modifier les couleurs

Tout est en haut de `assets/styles.css`, dans les variables `:root` — puis une
seconde fois pour le thème sombre. La palette reprend celle du CV : anthracite
`#22282E`, cuivre `#8F4A28`.

## Notes techniques

- **Ne pas « optimiser » les tracés d'icônes.** Une tentative d'arrondi des
  décimales a produit des glyphes corrompus : arrondir une valeur à zéro ou
  retirer un zéro de tête rend la séquence de nombres ambiguë et les
  coordonnées fusionnent (`C5.3729.0384.0003` devenait `C5.370.040 5.39 0`).
  Les tracés Simple Icons sont déjà minifiés ; ils sont recopiés tels quels.

- **Thème** : suit la préférence système par défaut ; le bouton force un thème et
  mémorise le choix dans `localStorage`. Un script en ligne dans le `<head>`
  applique le thème avant le premier rendu, ce qui évite le clignotement blanc.
- **Accessibilité** : HTML sémantique, lien d'évitement, navigation au clavier,
  `aria-label` sur les contrôles, contrastes conformes AA dans les deux thèmes.
- **SEO** : `canonical` + `hreflang` croisés entre les quatre pages, Open Graph,
  données structurées `schema.org/Person`, `sitemap.xml` et `robots.txt`.
- **Schémas** : SVG en ligne, en deux versions — une large et une empilée pour
  mobile — dont les couleurs sont pilotées par les variables CSS, donc ils
  suivent automatiquement le thème. Le basculement se fait à 52 rem.
- **Pièges CSS rencontrés** (trois fois le même) : une règle du type
  `.parent élément { … }` vaut 0-1-1 et **écrase** une règle de classe seule
  (0-1-0). Cela a cassé successivement la bascule des icônes de thème
  (`.theme-toggle svg`), l'affichage des deux schémas d'architecture
  (`.diagram svg`) et la répartition dans les cartes projet (`.card p`). En cas
  de règle qui « ne s'applique pas », comparer les spécificités avant tout.
- **`aspect-ratio` sur `<img>`** : n'est pas honoré par tous les moteurs quand
  l'image porte des attributs `width`/`height`. Le ratio est donc posé sur un
  bloc parent `.ratio`, l'image le remplissant en absolu.

## Provenance des chiffres

Les chiffres de l'étude de cas proviennent du rapport de stage M1 et du dépôt du
projet : 103 940 mesures, compression de 29 Mo à 2,3 Mo (facteur 12,7), latences
relevées en production, 14 tests Pytest dans `api/tests/`. Ne pas les modifier
sans une source correspondante.
