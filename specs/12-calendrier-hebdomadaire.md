# Spec 12 — Calendrier hebdomadaire avec pastilles

> **Statut** : Accepté · **Priorité** : Moyenne · **Effort** : L · **Dépendances** : Spec 01, Spec 02, Spec 07, Spec 10

## 1. Objectif
Donner aux profs (et aux parents, pour leurs enfants) une vue de la semaine type agenda : les séances s'affichent comme des pastilles positionnées sur une grille jour × heure, comme dans une application de calendrier. Côté prof, le calendrier est interactif : déplacement des séances par glisser-déposer et création par clic sur une case vide.

## 2. Valeur utilisateur
- Le prof voit sa semaine d'un coup d'œil (les listes du dashboard demandent une lecture ligne à ligne).
- Déplacer une séance (report) devient un geste direct, sans passer par l'admin.
- Le parent visualise la semaine de son enfant comme il le ferait dans son agenda personnel.

## 3. Périmètre
- **Inclus** :
  - Organism `o-week-calendar` : grille 6 colonnes (lun→sam) × créneaux 30 min (8h→20h).
  - Pastilles séances (position, durée, couleur par matière, lien fiche séance).
  - Bandes de disponibilités déclarées en fond (profs, lecture seule).
  - Navigation semaine (‹ ›, « Aujourd'hui »).
  - Mode prof : drag & drop natif + création via modale (matière, heure, durée, groupe).
  - Vue parent lecture seule sur la fiche enfant (données servies côté serveur).
  - Démo statique sur `/design-system` (mode `demo`).
  - Dashboard profs : le calendrier remplace les sections « Aujourd'hui » et « Cette semaine » (stats et « Passées récentes » restent).
- **Exclu** : déplacement des disponibilités (lecture seule) ; récurrences/exceptions ponctuelles ; vue mois ; vue fusionnée multi-enfants côté parents ; salles ; notifications de modification.

## 4. Spécification fonctionnelle
- **Fenêtre** : la semaine commence lundi 00:00 et finit dimanche (lundi→samedi affichés). Navigation ±7 jours, retour à la semaine courante.
- **Positionnement** : une pastille est positionnée à `date` (datetime) et s'étend sur `duree` minutes (défaut 60 si absent). Les séances hors plage 8h–20h sont affichées bornées dans la grille.
- **Chevauchements** : deux séances du même créneau sont affichées côte à côte (répartition simple).
- **Drag & drop (prof)** : saisir une pastille et la déposer sur une case déplace la séance (PATCH `date`/`duree`, durée conservée) ; calcul cible = colonne (jour) + rangée (heure de début, arrondie 30 min). Échec réseau → toast d'erreur et retour à la position initiale. Alternative clavier : la modale d'édition permet de changer la date/heure sans drag.
- **Création (prof)** : clic (ou drop de rien) sur une case vide ouvre la modale de création : matière (select), heure début (préremplie par la case), durée (30/60/90), groupe (élèves du prof, multi-select). Validation client : pas de chevauchement avec une séance existante du prof sur la semaine. À la création, les présences sont pré-créées par le hook existant (Spec 01).
- **Dispos (prof)** : les disponibilités hebdo (`jour`, `heureDebut`, `heureFin`) s'affichent en fond hachuré sur chaque semaine — elles ne sont pas datées.
- **Parents** : lecture seule, séances du groupe de l'enfant, accès servi par le serveur (`overrideAccess` contrôlé, 404 hors périmètre), semaine via `?semaine=` (ISO ou ancre de date).
- **Droits** : le mode interactif n'est rendu que si l'utilisateur courant est prof/admin — jamais côté parent.

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
- `/profs` (dashboard) — remplace les listes « Aujourd'hui » et « Cette semaine ».
- `/parents/enfants/[id]` — nouvelle section « Cette semaine ».
- `/design-system` — section « Calendrier hebdomadaire » (mode demo).

### 5.2 Disposition (wireframe)
```
Semaine du 23 au 28 septembre          ‹ ›  Aujourd'hui
        Lun 23      Mar 24      Mer 25      Jeu 26      Ven 27      Sam 28
 14h00 ┌──────────┐
       │ Maths    │                       ┌──────────┐
 15h00 │ Maths-3e │                       │ Anglais  │
       └──────────┘                       │ 5e       │
 16h00                       ┌──────────┐└──────────┘
                             │ Français │          ░░ dispos ░░
 17h00                       │ 6e       │     ░░░░░░░░░░░░░░░░░
                             └──────────┘
```
Pastille = lien vers la fiche séance ; case vide = cible de dépôt (prof).

### 5.3 États & interactions
- Chargement : squelette ou libellé « Chargement de la semaine… » ; semaine vide : InsetText « Aucune séance cette semaine. »
- Pastille survolée (drag) : opacité réduite ; cible de dépôt survolée : surlignage.
- Modale création/édition : pattern existant (`m-modal`, focus piégé, Escape).

### 5.4 Responsive
Mobile-first : la grille passe en défilement horizontal avec colonnes de largeur fixe (les pastilles restent lisibles) ; la navigation semaine reste au-dessus.

### 5.5 Thème clair/sombre & accessibilité
- Couleurs via tokens `--lpv-*` ; pastille jamais codée par la couleur seule (libellé matière + groupe).
- Le drag a une alternative clavier (modale). Les pastilles sont des liens focusables ; focus visible 44px minimum sur les contrôles.
- Contraste AA sur fonds hachurés.

### 5.6 Micro-copy (FR)
- « Semaine du 23 au 28 septembre », « Aujourd'hui », « Aucune séance cette semaine. »
- Modale : « Nouvelle séance », « Déplacer la séance », « Enregistrer », « Annuler ».
- Erreur : « Impossible d'enregistrer le déplacement. » / « Cette séance chevauche une autre séance. »

## 6. Spécification technique
### 6.1 Fichiers (nouveaux / modifiés)
- **Nouveaux** : `src/calendrier/domain/calendrier.entity.ts`, `src/calendrier/domain/calendrier.utils.ts`, `src/calendrier/infrastructure/calendrier.repository.ts`, `src/calendrier/application/calendrier.handlers.ts`, `src/calendrier/application/calendrier.hooks.ts`, `src/calendrier/index.ts` ; `src/components/organisms/o-week-calendar.tsx` (+ client) ; `src/app/(frontend)/styles/_calendrier.scss` ; tests (`calendrier.utils.unit.spec.ts`, `o-week-calendar.int.spec.tsx`).
- **Modifiés** : `lpvboard.scss` (@use calendrier), `ProfsDashboardView.tsx` (calendrier remplace 2 listes), `parents/enfants/[id]/page.tsx` (section Cette semaine), `design-system/page.tsx` (démo), `specs/README.md`.

### 6.2 Données & persistance
- Aucune nouvelle collection. Lectures : `seances` (fenêtre de dates, prof = soi via API ; côté serveur pour parents via `groupe = eleve`). Écritures : `create seances`, `patch seances` (date, duree) — access rules existantes.
- Les dispos restent sur `users` (Spec 07), lues via le hook existant.

### 6.3 API / contraintes
- Côté client : `GET /seances?where=prof=me AND date>=debut AND date<=fin` (httpClient, session cookie). Côté parent : `payload.find` serveur avec `overrideAccess` après `verifierParentEleve` (pattern fiche enfant).
- Timezone : les dates sont traitées en local navigateur (fr-FR) ; le serveur rend les pastilles parents avec le même calcul de bornes.
- Drag & drop : API HTML5 native, aucun ajout de dépendance ; la logique de calcul (jour/créneau cible, chevauchement) est extraite en fonctions pures testées.

## 7. Critères d'acceptation
- [ ] Le prof voit ses séances de la semaine en pastilles + ses dispos en fond, navigue ‹ › et « Aujourd'hui ».
- [ ] Glisser une pastille la déplace (PATCH) ; échec → toast d'erreur, position restaurée.
- [ ] Clic sur une case vide ouvre la modale de création ; la séance apparaît et ses présences sont pré-créées.
- [ ] Le dashboard /profs affiche le calendrier à la place des listes « Aujourd'hui » / « Cette semaine ».
- [ ] Le parent voit la semaine de son enfant en lecture seule ; 404 hors périmètre ; aucune interface de modification.
- [ ] La démo statique est visible sur /design-system, en clair et en sombre.
- [ ] Lint, typecheck, tests (unit utils + int organism) passent.

## 8. Risques & questions ouvertes
- DnD natif moins fluide qu'une lib (pas d'animation de fantôme riche) — acceptable en v1 ; `@dnd-kit` en option si le ressenti est insuffisant.
- Les dispos hebdo se répètent sur toutes les semaines (pas d'exception ponctuelle « absent le 12/10 ») — conforme au modèle actuel.
- Création : le choix « groupe » liste les élèves du prof (requête existante) ; un vrai concept de groupe-classe viendra plus tard (Spec 07).
- Conflits de prof entre deux créneaux : validation serveur limitée en v1 (check client + access rules) ; la Spec 07 couvre les chevauchements côté créneaux.