# Institut Clémentine — refonte du site (page d'accueil)

Maquette fonctionnelle de la page d'accueil, en HTML / CSS / JS statique (aucun build).

## Lancer la prévisualisation

```bash
node .claude/serve.js
```

puis ouvrir http://127.0.0.1:8765/ (ou n'importe quel serveur statique à la racine du dossier).

## Structure

- `index.html` — page d'accueil (contenu, SVG interactifs, données structurées schema.org)
- `assets/css/main.css` — charte graphique (couleurs du logo : orange #fa6a00, terracotta #a56141, nude #cdaa98, sauge #e2e8c9)
- `assets/js/main.js` — préchargeur, défilement fluide (Lenis), animations (GSAP ScrollTrigger), cartographie corporelle, curseur
- `assets/js/scene.js` — scène 3D du héro (Three.js) : sculpture d'arcs inspirée du symbole du logo
- `assets/img/` — logo vectorisé (`logo.svg`, `logo-light.svg`, `symbol.svg`) + photos reprises du site actuel

## Sections de la page

1. Héro 3D + chiffres clés
2. Bandeau marques partenaires
3. Expertises (4 pôles)
4. Cartographie corporelle interactive (11 zones, SVG dynamique)
5. Plateau technique (9 technologies, défilement horizontal épinglé)
6. Soin signature IB SLIM (diagramme SVG animé, compteurs)
7. Spa Jet (22 jets animés)
8. Prestations (grille bento, tarifs « à partir de » issus de la grille actuelle)
9. L'Institut (charte, piliers, chiffres)
10. Rendez-vous (horaires réels, plan Google Maps)
11. Pied de page

## Points à valider avec le client

- Toutes les informations (prestations, tarifs, horaires, technologies, marques) proviennent du site actuel. Rien n'a été inventé.
- Les photos des sections sont celles du site actuel, retravaillées (recadrage, agrandissement). Une séance photo professionnelle améliorerait nettement les sections Expertises et Prestations.
- La photo de fond du héro vient d'Unsplash (licence Unsplash, usage commercial libre, sans attribution obligatoire) : https://unsplash.com/photos/2c99fff964d7. Elle est servie depuis le CDN Unsplash ; la rapatrier dans `assets/img/` avant la mise en ligne définitive.
- Les liens « Mentions légales », « Données personnelles », « Télécharger la grille tarifaire » pointent vers des pages à créer.
- Les chiffres « 80+ protocoles » et « 9 technologies » sont comptés à partir de la grille tarifaire et des pages technologies actuelles.

## Dépendances (CDN, versions figées)

- GSAP 3.12.5 + ScrollTrigger (cdnjs)
- Lenis 1.1.13 (jsdelivr)
- Three.js 0.160.0 (jsdelivr, import map)
- Google Fonts : Fraunces, Manrope, IBM Plex Mono
