# Spec 14 — Type scale responsive des titres

> **Statut** : Accepté · **Priorité** : Moyenne · **Effort** : S · **Dépendances** : Spec 11 (design system)

## 1. Objectif
Faire varier la taille des classes de titres (`lpv-h1`, `lpv-h2`, `lpv-h3`) selon la taille
d'écran, sur trois paliers, en transposant le [type scale GOV.UK](https://design-system.service.gov.uk/styles/type-scale/)
et ses principes (blogs GDS 2018 et 2022).

## 2. Valeur utilisateur
- Les titres géants du desktop ne débordent plus en mobile ; la hiérarchie reste lisible.
- Le corps de texte ne rétrécit jamais : accessibilité (malvoyants, dyslexie — la BDA
  recommande ≥ 16px/1rem).

## 3. Périmètre
- **Inclus** : map Sass `$lpv-type-scale` + mixin `lpv-font-size($point)` dans `_mixins.scss`
  (couche settings/helpers façon GOV.UK), consommation par `.lpv-h1/2/3` dans `_base.scss`,
  page vitrine `/design-system/typography`, docs (§1.10).
- **Exclu** : alignement des autres tailles du codebase sur l'échelle (labels, tokens
  `--lpv-font-size-md/xl`, cards/stats) — passe dédiée ultérieure.

## 4. Spécification

| Point | Classe | Mobile < 48rem | Tablet ≥ 48rem (Tailwind `md`) | Desktop ≥ 64rem (Tailwind `lg`) |
|---|---|---|---|---|
| 48 | `.lpv-h1` | 32px / lh 35px | 40px / lh 45px | 48px / lh 50px |
| 24 | `.lpv-h2` | 21px / lh 25px | 24px / lh 30px | 24px / lh 30px |
| 19 | `.lpv-h3` | 19px / lh 25px | 19px / lh 25px | 19px / lh 25px |

Règles :
- Breakpoints alignés sur Tailwind (`md` = 48rem, `lg` = 64rem) — cohérents avec les
  utilitaires Tailwind déjà utilisés sur les pages.
- Jamais de texte sous 19px (GDS 2022) ; seules les grandes tailles rétrécissent en mobile.
- Line-heights multiples de 5px (rythme vertical).
- Unités `rem` (racine 16px) : le texte suit le zoom navigateur (WCAG 2.1 1.4.4).
- Le point 40px (h1 tablet) n'est pas un point officiel GOV.UK : progression régulière
  32 → 40 → 48 choisie pour la régularité (+8 par palier), line-height 45px respecte le
  rythme des 5px.

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
Toutes les pages utilisant `lpv-h1/2/3` ; vitrine sur `/design-system/typography`.

### 5.2 Disposition (wireframe)
Inchangé — seules les tailles varient par palier.

### 5.3 États & interactions
Aucun (CSS pur).

### 5.4 Responsive
C'est l'objet de la spec : 3 paliers media queries `min-width`.

### 5.5 Thème clair/sombre & accessibilité
Aucun impact couleur ; zoom/rem préservé, jamais < 19px.

### 5.6 Micro-copy (FR)
Aucune.

## 6. Spécification technique
### 6.1 Fichiers (nouveaux / modifiés)
- **Modifiés** : `src/app/(frontend)/styles/_mixins.scss` (map + mixin),
  `_base.scss` (consommation), `docs/design-system.md` (§1.10), `specs/README.md`,
  `CHANGELOG.md`.
- **Nouveaux** : `src/app/(frontend)/design-system/typography/page.tsx`,
  classes `lpv-ds-type*` dans `_design-system.scss`, la présente spec.