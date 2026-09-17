# sben003.github.io

Portfolio personnel de **Salem Benzineh** — développeur / data engineer.

En ligne : <https://sben003.github.io>

## Ce que c'est

Un site statique, sans framework, sans build et sans dépendance : trois fichiers
de contenu (`index.html`, `en/index.html`, `assets/styles.css`) et un script de
3 Ko. Aucune police externe, aucun traceur, aucune requête vers un tiers.

| Fichier | Rôle |
| --- | --- |
| `index.html` | Page française |
| `en/index.html` | Page anglaise |
| `assets/styles.css` | Toute la mise en forme, thèmes clair et sombre inclus |
| `assets/main.js` | Bascule de thème + surlignage de la section courante |
| `assets/og.png` | Aperçu affiché quand le lien est partagé (LinkedIn, etc.) |
| `assets/CV-Salem-Benzineh.pdf` | Le CV téléchargeable — **à déposer ici** |
| `.nojekyll` | Demande à GitHub Pages de servir les fichiers tels quels |

## Mettre à jour le site

Le site se publie tout seul : **tout ce qui est poussé sur `main` part en ligne**
en une à deux minutes. Pas de build, pas d'étape intermédiaire.

```bash
# 1. modifier les fichiers (index.html, en/index.html, assets/styles.css…)

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
`git add -A && git commit -m "Nouveau CV" && git push`. Les deux boutons de
téléchargement, en français et en anglais, pointent déjà sur ce chemin.

### Modifier un texte

Les deux pages sont indépendantes : **une modification de contenu doit être
reportée dans `index.html` et dans `en/index.html`**, sinon les versions
divergent.

### Modifier les couleurs

Tout est en haut de `assets/styles.css`, dans les variables `:root` — puis une
seconde fois pour le thème sombre. La palette actuelle reprend celle du CV :
anthracite `#22282E`, cuivre `#8F4A28`.

### Régénérer l'image de partage

`assets/og.png` est l'aperçu affiché sur LinkedIn. Pour la refaire après un
changement de titre, réexécuter le script de génération (voir l'historique du
projet) ou remplacer le fichier par une image 1200 × 630.

## Notes techniques

- **Thème** : suit la préférence système par défaut ; le bouton force un thème
  et mémorise le choix dans `localStorage`. Un script en ligne dans le `<head>`
  applique le thème avant le premier rendu, ce qui évite le clignotement blanc.
- **Accessibilité** : HTML sémantique, lien d'évitement, navigation au clavier,
  `aria-label` sur les contrôles, contrastes conformes AA dans les deux thèmes.
- **SEO** : `canonical` + `hreflang` croisés entre les deux langues, Open Graph,
  données structurées `schema.org/Person`, `sitemap.xml` et `robots.txt`.
- **Schéma d'architecture** : SVG en ligne, en deux versions — une large et une
  empilée pour mobile — dont les couleurs sont pilotées par les variables CSS,
  donc il suit automatiquement le thème.
