# Spec 21 — Page Nouveautés

> **Statut** : Proposé · **Priorité** : Basse · **Effort** : S · **Dépendances** : Spec 17

## 1. Objectif
Publier `CHANGELOG.md` sur une page publique `/nouveautes`, comme le prévoit déjà `AGENTS.md`, pour que l'équipe et les familles voient les évolutions de l'outil.

## 2. Valeur utilisateur
- Les profs et bénévoles découvrent les nouveautés sans annonce séparée.
- La règle « changelog user-facing » (vérifiée par `pnpm changelog:check`) trouve sa raison d'être.

## 3. Périmètre
- **Inclus** : route `/nouveautes` ; rendu du markdown ; lien dans le footer et dans le menu « Plus » de l'appli (spec 22).
- **Exclu** : badge « nouveau » ou notification de version dans l'appli ; flux RSS.

## 4. Spécification fonctionnelle
- La page lit `CHANGELOG.md` à la racine du dépôt côté serveur, au build (page statique, `dynamic = 'force-static'`) : chaque déploiement suit le fichier.
- Le préambule (titre « Changelog » et paragraphe Keep a Changelog) n'est pas affiché ; il est remplacé par le `h1` « Nouveautés » et une phrase d'introduction.
- La section `## [Unreleased]` est **ignorée**, même non vide.
- Chaque version `## [X.Y.Z] — AAAA-MM-JJ` devient un bloc au pattern GOV.UK [« Updates / change history »](https://design-system.service.gov.uk/patterns/) :
  - `h2` « Version X.Y.Z » ;
  - `<time>` « 7 octobre 2026 » ;
  - sous-sections (Ajouté, Modifié, Corrigé, Retiré, Sécurisé) en `h3`, avec une couleur de `a-tag` par type ;
  - listes à puces.
- Les 5 dernières versions sont ouvertes ; les plus anciennes sont regroupées dans un `a-details` « Versions précédentes ».
- Le parseur est volontairement minimal (titres `##` et `###`, puces `-`, gras et liens inline) : un module pur `src/utilities/parseChangelog.ts`, testé, plutôt qu'une dépendance markdown complète.

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
Lien « Nouveautés » dans le footer (colonne liens utiles) et dans le menu « Plus » de l'appli.

### 5.2 Disposition (wireframe)
```
Nouveautés                                          (h1)
Les dernières évolutions de LPV Board.
─────────────────────────────────────────────
Version 0.15.0                                      (h2)
7 octobre 2026
[Ajouté]
• Dans l'historique de présence d'un élève, …
[Corrigé]
• Le statut d'un élève …
─────────────────────────────────────────────
▸ Versions précédentes
```

### 5.3 États & interactions
- Fichier absent ou vide : « Aucune nouveauté publiée pour le moment. ».
- Détails repliables au clavier.

### 5.4 Responsive
Une colonne, largeur de lecture limitée à `--lpv-container-xs`.

### 5.5 Thème clair/sombre & accessibilité
Hiérarchie `h1` > `h2` > `h3` ; le type de changement est porté par le texte du tag, pas par la couleur seule.

### 5.6 Micro-copy (FR)
« Nouveautés », « Les dernières évolutions de LPV Board. », « Version », « Versions précédentes ».

## 6. Spécification technique
### 6.1 Fichiers (nouveaux / modifiés)
- **Nouveaux** :
  - `src/app/(frontend)/nouveautes/page.tsx` ;
  - `src/utilities/parseChangelog.ts` et `src/utilities/parseChangelog.test.ts` ;
  - organism `src/components/organisms/o-changelog.tsx` ;
  - `tests/int/changelog.int.spec.tsx`.
- **Modifiés** : seed du footer (`scripts/seed-site.ts`, lien ajouté si absent).

### 6.2 Données & persistance
Aucune : le fichier `CHANGELOG.md` est la source.

### 6.3 API / contraintes
- Lecture avec `fs.readFile(path.join(process.cwd(), 'CHANGELOG.md'))` dans un server component.
- Vérifier que Vercel inclut le fichier dans la sortie de la fonction (`outputFileTracingIncludes` dans `next.config.ts` si la page n'est pas statique).

## 7. Critères d'acceptation
- [ ] `/nouveautes` affiche les versions publiées du changelog, la plus récente en premier, sans la section Unreleased.
- [ ] Les 5 dernières versions sont visibles, les autres sont dans « Versions précédentes ».
- [ ] Tests unitaires du parseur : version, date, sections, puces, gras, liens, Unreleased ignoré, fichier vide.
- [ ] Le lien « Nouveautés » est présent dans le footer.
- [ ] Lint, typecheck et tests passent.

## 8. Risques & questions ouvertes
- Le titre de version utilise un tiret cadratin (`— 2026-10-07`) alors qu'AGENTS.md écrit `: YYYY-MM-DD`. Le parseur accepte les deux.
- Page publique : le changelog ne doit jamais contenir d'information interne, ce que garantit déjà `pnpm changelog:check`.
