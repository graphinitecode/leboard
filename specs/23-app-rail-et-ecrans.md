# Spec 23 — Appli : rail droit et réorganisation des écrans

> **Statut** : Proposé · **Priorité** : Moyenne · **Effort** : M · **Dépendances** : Spec 22

## 1. Objectif
Compléter le shell de la spec 22 avec une colonne de droite (« rail ») inspirée de Duolingo : widgets contextuels sticky et petits liens de pied de page. Revoir écran par écran ce qui va dans le contenu principal ou dans le rail, et rapatrier `/rapports` dans le shell profs.

## 2. Valeur utilisateur
- Les informations secondaires (alertes, calendrier du mois, raccourcis, rappels) restent visibles pendant le défilement sans gêner le flux principal.
- Une colonne de contenu plus étroite, donc plus lisible (≈ 40rem, longueur de ligne GOV.UK).
- Les rapports sont accessibles depuis la navigation au lieu d'une page isolée sans portail.

## 3. Périmètre
- **Inclus** :
  - la prop `sidebar` de `DashboardPage` et `DetailPage` devient un rail ;
  - classes de rail mutualisées ;
  - liens de pied de page dans le rail ;
  - inventaire et réorganisation des écrans listés ci-dessous ;
  - `/rapports` dans le shell profs.
- **Exclu** : nouveaux widgets métier (pas de nouvelles requêtes de données) ; écrans Alertes et Plannings.

## 4. Spécification fonctionnelle
- **Grille** (≥ 64rem) : `[contenu ≈ 40rem] [rail ≈ 22rem]`, centrée dans l'espace à droite de la sidebar, écart 3rem. Le rail est `position: sticky; top: 1.5rem`.
- **Pages sans rail** : le contenu peut aller jusqu'à `--lpv-container`.
- **Liens de pied de page** : en bas du rail, liste compacte en petites capitales `lpv-muted`, à partir de `Footer.navItems` (légaux) et de « Nouveautés » ; plus le copyright.
- **Footer pleine largeur** : retiré de l'appli. Sur les pages sans rail et sur mobile, la même liste compacte s'affiche sous le contenu.
- **Inventaire** :

| Écran | Contenu principal | Rail |
|---|---|---|
| `/profs` tableau de bord | Titre et salutation, stats, « À traiter », « Séances à venir », « Historique » | Calendrier du mois · Alertes sur mes élèves · Raccourcis (`ActionIconcard` ×4) · liens |
| `/profs/eleves` | Stats, recherche et filtres, tableau, pagination, export CSV | « À surveiller » (AlertCards) · liens |
| `/profs/eleves/[id]` | Fiche (DetailPage), historiques | Prêts en cours (`PretsEleveCard`) · alertes de l'élève · liens |
| `/profs/seances/[id]` | Onglets présences, retour, progressions | Infos séance (date, lieu, série) · action « Modifier » · liens |
| `/profs/bibliotheque` (+ `/prets`) | Stats, catalogue ou prêts, tableau | « Rappels à venir » · « Alimenter le catalogue » · liens |
| `/profs/bibliotheque/livres/[id]` | Fiche livre | Actions · Retard · Informations (déjà en aside) · liens |
| `/profs/calendrier` | **Pleine largeur, sans rail** (le calendrier a besoin de place) | — |
| `/profs/disponibilites` | Liste des créneaux | Aide « Comment ça marche » · liens |
| Pages question (`QuestionPage` : nouvelle séance, prêt, etc.) | **Sans rail**, colonne étroite GOV.UK | — |
| `/profs/mon-profil`, `/parents/mon-profil` | Formulaire, sans rail | — |
| `/rapports`, `/rapports/[eleveId]` | Rapports, mis en forme avec `DashboardPage` / `DetailPage` | Période choisie · export · liens |
| `/parents` | Cartes enfants | Prochaines séances de la semaine · liens |
| `/parents/enfants/[id]` | Calendrier lecture, tableau | Livres empruntés · liens |

- **Rapports** :
  - `src/app/(frontend)/rapports/*` est rattaché au shell profs : un layout `rapports/layout.tsx` réutilise la config profs, ou les pages sont déplacées sous `/profs/rapports` avec une redirection depuis `/rapports` ;
  - accès admin et prof (inchangé) ;
  - les styles inline sont remplacés par les templates.

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
Tous les écrans de l'inventaire.

### 5.2 Disposition (wireframe)
```
┌──────────┬───────────────────────────┬─────────────────────┐
│ sidebar  │ Tableau de bord     (h1)  │ ┌─────────────────┐ │
│          │ Bonjour Marie             │ │ Octobre 2026    │ │
│          │ [3 séances][2 retours][1] │ │ calendrier mois │ │
│          │ À traiter                 │ └─────────────────┘ │
│          │ ┌───────────────────────┐ │ ┌─────────────────┐ │
│          │ │ Séance du 3 oct. ▸    │ │ │ Alertes (2)     │ │
│          │ └───────────────────────┘ │ └─────────────────┘ │
│          │ Séances à venir           │ RACCOURCIS          │
│          │ …                         │ À PROPOS · MENTIONS │
│          │                           │ NOUVEAUTÉS · RGPD   │
└──────────┴───────────────────────────┴─────────────────────┘
              ≈ 40rem                     ≈ 22rem, sticky
```

### 5.3 États & interactions
- Cartes du rail vides : texte `__empty-text` existant (« Aucune alerte »).
- Le rail ne défile pas séparément ; il est sticky tant que sa hauteur tient dans la fenêtre, sinon il défile avec la page.

### 5.4 Responsive
- Sous 64rem : le rail passe **sous** le contenu, en une colonne, cartes empilées.
- Sous 48rem : même chose, avec les liens de pied de page en fin de page au-dessus de la tabbar.

### 5.5 Thème clair/sombre & accessibilité
- Rail en `<aside aria-label="Informations complémentaires">`.
- L'ordre DOM est contenu puis rail, pour qu'un lecteur d'écran lise d'abord le principal.
- Liens de pied de page dans un `<nav aria-label="Liens du site">`.

### 5.6 Micro-copy (FR)
Titres de cartes existants conservés ; nouveau : « Comment ça marche », « Infos séance », « Prochaines séances », « Livres empruntés ».

## 6. Spécification technique
### 6.1 Fichiers (nouveaux / modifiés)
- **Nouveaux** :
  - `src/components/molecules/m-rail-links.tsx` (liens de pied de page compacts) ;
  - `src/components/templates/t-rail-page.tsx` (`RailPage`, pour les écrans qui n'utilisent ni `DashboardPage` ni `DetailPage` mais ont un rail : disponibilités, parents) ;
  - `src/app/(frontend)/rapports/layout.tsx` (ou déplacement sous `/profs/rapports`) ;
  - tests `tests/int/rail-page.int.spec.tsx`, `rail-links.int.spec.tsx`.
- **Modifiés** :
  - `src/components/templates/t-dashboard-page.tsx`, `t-detail-page.tsx` (rail, `aria-label`) ;
  - `src/app/(frontend)/styles/_dashboard.scss` (grille 40rem / 22rem à 64rem, sticky, classes `lpv-t-dashboard-page__aside*` renommées en `lpv-t-rail__*` avec alias temporaire) ;
  - `t-app-shell.tsx` (footer retiré, `m-rail-links` en repli) ;
  - les vues de l'inventaire (`ProfsDashboardView.tsx`, `ElevesView`, `BibliothequeView`, `SeanceProfView`, `ParentsEnfantsView`, `profs/disponibilites/page.tsx`, `rapports/*`) ;
  - tests `dashboard-page`, `detail-page` et des vues concernées.

### 6.2 Données & persistance
Aucune migration. Les widgets du rail réutilisent les données déjà chargées par chaque page ; un widget qui demanderait une requête supplémentaire (ex. « Prochaines séances » parents) n'en ajoute qu'une, simple, côté serveur.

### 6.3 API / contraintes
- Pas de `position: fixed` pour le rail (sticky seulement), pour garder l'impression et le zoom corrects.
- Styles d'impression : sidebar, tabbar et rail masqués (`_base.scss` `@media print`).

## 7. Critères d'acceptation
- [ ] En ≥ 64rem, chaque écran de l'inventaire suit sa ligne du tableau (contenu et rail, ou pleine largeur).
- [ ] Sous 64rem, le rail est sous le contenu ; l'ordre de lecture est correct au lecteur d'écran.
- [ ] Les liens de pied de page apparaissent dans le rail ou en fin de page ; plus de footer pleine largeur dans l'appli.
- [ ] `/rapports` s'affiche dans le shell profs, entrée « Rapports » active, accès inchangé.
- [ ] Impression d'une fiche élève sans sidebar, rail ni tabbar.
- [ ] Lint, typecheck et tests int passent.

## 8. Risques & questions ouvertes
- Bandeau de statut en haut à droite comme chez Duolingo (compteurs) : utile pour « alertes actives » ou « retours en attente » ? Proposition : hors périmètre, à évaluer après usage.
- `/rapports` : faut-il le déplacer sous `/profs/rapports` (cohérence des URLs) ou seulement l'habiller ? Proposition : le déplacer, avec une redirection 308.
- Les écrans très larges (tableaux élèves et prêts) supportent-ils 40rem ? Sinon, ces deux écrans passent en contenu élargi (≈ 48rem) avec le rail réduit.
