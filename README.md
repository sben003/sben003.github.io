# sben003.github.io

Portfolio personnel de **Salem Benzineh** — développeur / data engineer.

En ligne : <https://sben003.github.io>

## Ce que c'est

Un site statique, sans framework, sans build et sans dépendance. Aucune police
externe, aucun traceur, aucune requête vers un tiers.

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
| `assets/CV-Salem-Benzineh.pdf` | Le CV téléchargeable — **à déposer ici** |
| `.nojekyll` | Demande à GitHub Pages de servir les fichiers tels quels |

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

### Remplacer le CV

Déposer le PDF dans `assets/` sous le nom exact `CV-Salem-Benzineh.pdf`, puis
`git add -A && git commit -m "Nouveau CV" && git push`. Les boutons de
téléchargement, en français et en anglais, pointent déjà sur ce chemin.

### Modifier un texte

Les quatre pages sont indépendantes. **Une modification de contenu doit être
reportée dans la page française et dans son équivalent anglais**, sinon les deux
versions divergent.

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
- **Pièges CSS rencontrés** : une règle `display` sur `.diagram svg` ou
  `.theme-toggle svg` (spécificité 0-1-1) écrase les règles de bascule portées
  par une simple classe (0-1-0), et les deux variantes s'affichent en même temps.
  Les commentaires dans le CSS le rappellent à l'endroit concerné.

## Provenance des chiffres

Les chiffres de l'étude de cas proviennent du rapport de stage M1 et du dépôt du
projet : 103 940 mesures, compression de 29 Mo à 2,3 Mo (facteur 12,7), latences
relevées en production, 14 tests Pytest dans `api/tests/`. Ne pas les modifier
sans une source correspondante.
