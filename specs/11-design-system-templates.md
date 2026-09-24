# Spec 11 — Design system : couche Templates

> **Statut** : Accepté · **Priorité** : Moyenne · **Effort** : M · **Dépendances** : Spec 10 (portails implémentés)

## 1. Objectif
Extraire les structures de page répétées des portails (shell, fiche détail, dashboard, formulaire centré) dans une couche Templates de l'atomic design, pour que chaque nouvelle page assemble des slots au lieu de recopier du markup.

## 2. Valeur utilisateur
- Cohérence garantie entre portails : même shell, même squelette de fiche, même dashboard.
- Un changement de structure (skip link, footer, hiérarchie de titres) se fait une seule fois.
- Créer une page devient « remplir des slots », moins d'erreur possible.

## 3. Périmètre
- **Inclus** :
  - 4 templates : `t-portal-page`, `t-detail-page`, `t-dashboard-page`, `t-form-page`.
  - Déplacement de `PageContent` (molecule → template, renommé `PortalPage`).
  - Migration des consommateurs : layouts portails, `/rgpd`, fiche élève.
  - Section vitrine `/design-system` + tests int par template.
- **Exclu** : template « page vitrine générique » (2 usages seulement, règle de trois) ; refonte CSS ; organisms métier.

## 4. Spécification fonctionnelle
- **PortalPage** : API de l'ancien `PageContent` — slot `header` (reçoit `ServiceHeader`, qui reste molecule), `children`, `footerLinks`, `portail` (`profs` | `parents` | `eleves`). Rend : `lpv-shell` + `data-lpv-portail`, skip link, `<main id="contenu-principal">`, footer.
- **DetailPage** : slots `backHref` + `backLabel`, `title`, `tag?`, `meta?` (nœud React, ex. SummaryList), `sections[]` `{ title, children }`. Sections rendues en `h2.lpv-h2` + contenu ; l'état vide reste géré par l'appelant (les templates ne portent pas de micro-copy).
- **DashboardPage** : `stats[]` `{ value, label, detail?, detailColor? }` + `sections[]` `{ title, children }`. La grille stats reproduit `lpv-cards-grid` / `lpv-stat`.
- **FormPage** : `title`, `subtitle?`, `children` dans le conteneur `lpv-login` existant.

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
Layouts portails (`/profs`, `/parents`), `/rgpd`, fiche élève, dashboard profs, pages login.

### 5.2 Disposition (wireframe)
Inchangé visuellement — les templates assemblent les classes existantes (`lpv-shell`, `lpv-container`, `lpv-cards-grid`, `lpv-login`) ; nouveau SCSS limité à ce qui manque.

### 5.3 États & interactions
Aucun état propre : composants serveur purs, sans interaction.

### 5.4 Responsive
Hérité des classes sous-jacentes (mobile-first).

### 5.5 Thème clair/sombre & accessibilité
Skip link conservé, un seul `h1` par page, sections en `h2`, pas d'information portée par la couleur seule.

### 5.6 Micro-copy (FR)
Aucune — tout le texte vient des slots.

## 6. Spécification technique
### 6.1 Fichiers (nouveaux / modifiés)
- **Nouveaux** : `src/components/templates/t-portal-page.tsx`, `t-detail-page.tsx`, `t-dashboard-page.tsx`, `t-form-page.tsx`, `t-question-page.tsx` (page-question GOV.UK, ajoutée en cours d'implémentation), `index.ts` (barrel) ; `tests/int/portal-page.int.spec.tsx`, `detail-page.int.spec.tsx`, `dashboard-page.int.spec.tsx`, `form-page.int.spec.tsx`.
- **Modifiés** : `m-service-header.tsx` (suppression `PageContent`), `molecules/index.ts` (export retiré), `profs/layout.tsx`, `parents/layout.tsx`, `rgpd/page.tsx` (→ `PortalPage`), `profs/eleves/[id]/page.tsx` (→ `DetailPage`), `design-system/page.tsx` (section Templates), `docs/design-system.md` §3, `specs/README.md`.

### 6.2 Données & persistance
Aucune — les templates ne font ni fetch ni écriture ; les données arrivent par props/slots.

### 6.3 API / contraintes
- Server components (pas de `'use client'`).
- Exports anglais simples (`PortalPage`, `DetailPage`, `DashboardPage`, `FormPage`), fichiers `t-` préfixés, classes `lpv-t-{block}__{element}`.

## 7. Critères d'acceptation
- [ ] `/profs`, `/parents`, `/rgpd` rendus identiques via `PortalPage` ; `PageContent` n'existe plus.
- [ ] Fiche élève rendue identique via `DetailPage`.
- [ ] Les 4 templates sont démontrés sur `/design-system`.
- [ ] Chaque template a un test int (render, slots, classes attendues).
- [ ] Lint, typecheck, tests int existants passent.

## 8. Risques & questions ouvertes
- Régression visuelle lors de la migration → vérifier les 4 pages migrées avant/après.
- `DashboardPage` reste-t-il pertinent si les dashboards divergent ? Oui tant que la grille stats est commune ; sinon on le retirera.