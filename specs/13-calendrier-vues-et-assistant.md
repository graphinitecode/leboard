# Spec 13 — Calendrier : vues multiples, sélection de plage et assistant de création

> **Statut** : Accepté · **Priorité** : Moyenne · **Effort** : L · **Dépendances** : Spec 12

## 1. Objectif
Corriger la grille hebdomadaire en mobile (défilement horizontal illisible) et faire évoluer la création de séance vers le pattern « une question par écran » du design system, avec sélection de plage au clic-tirer — tout en ajoutant plusieurs vues (jour, liste condensée, mini-calendrier de navigation).

## 2. Valeur utilisateur
- En mobile, le prof lit enfin son agenda : une colonne jour à la fois, pastilles lisibles.
- Créer une séance = glisser la plage voulue (visuel direct) puis un parcours guidé de 5 questions courtes, comme l'assistant de disponibilités (Spec 10d).
- Le mini-calendrier mensuel permet de sauter à un jour éloigné sans cliquer ‹ › dix fois.

## 3. Périmètre
- **Inclus** :
  - Toggle de vues `Semaine | Jour | Liste` (molécule `SegmentedToggle`).
  - Vue jour : une colonne, utilisée automatiquement en mobile (< 48rem) et sélectionnable en desktop.
  - Vue liste condensée : jours de la semaine avec pastilles listées verticalement (jours vides exclus).
  - Mini-calendrier mensuel de navigation : cliquer un jour affiche sa semaine/jour ; les jours de la semaine affichée sont surlignés.
  - Sélection de plage au clic-tirer sur les cases vides (mode prof) : mousedown → glisser → mouseup.
  - Bouton « + Nouvelle séance » dans la barre du calendrier.
  - Assistant de création step-by-step (5 étapes) remplaçant la modale : jour → début → fin (+ récap) → matière → élèves.
- **Exclu** : drag & drop des dispos ; édition d'une séance existante via l'assistant (le déplacement par drag et l'édition restent comme en Spec 12) ; vue quinzaine ; récurrences.

## 4. Spécification fonctionnelle
- **Vue** : état `vue` ∈ `semaine` | `jour` | `liste`. En < 48rem, la grille semaine force la vue jour (la grille 6 colonnes reste accessible via le toggle en paysage large). Le choix est conservé en session (mémoire locale).
- **Vue jour** : une colonne du jour affiché + navigation ‹ › jour par jour ; même mécanique de pastilles, dispos et sélection de plage que la semaine.
- **Vue liste** : un bloc par jour (2e colonne : jour + date) listant les séances triées par heure ; jours sans séance exclus ; pastilles = mêmes liens que la grille.
- **Mini-calendrier** : mois affiché autour de la semaine courante, ‹ › mois ; chaque jour : pastille « a des séances » (point) ; cliquer un jour bascule sur la semaine le contenant (et sélectionne le jour si en vue jour).
- **Sélection de plage** : mousedown sur une case vide → glisser sur les créneaux contigus (même jour) → mouseup : plage surlignée ; à la fin, ouverture de l'assistant pré-rempli (jour, heure début, heure fin = créneau suivant). Mousemove/mouseup hors case = abandon propre. Support équivalent tactile (pointer events).
- **Bouton « + Nouvelle séance »** : ouvre l'assistant à l'étape 1, sans préremplissage.
- **Assistant** : réutilise le pattern `AvailabilityWizard` (stepper, boutons-choix jour, inputs time avec bornes 8h–20h, récapitulatif). La durée n'est plus un choix figé : elle découle de début/fin (durée min 30 min, fin après début). Étape matière : boutons-choix. Étape élèves : cases à cocher (élèves du prof). Valider → création (présences pré-créées par le hook existant) + toast succès + retour à la vue.
- **Chevauchements** : l'assistant affiche un avertissement si la plage chevauche une séance existante du prof (non bloquant, le serveur fait foi).
- **Déplacement (drag d'une pastille existante)** : inchangé (Spec 12) ; en vue jour, le drop se fait sur les cases du jour.

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
Dashboard `/profs` (mode prof), démo `/design-system` (mode demo). Les vues parent (lecture seule) bénéficient aussi du toggle vues et du responsive jour.

### 5.2 Disposition (wireframe)
```
[+ Nouvelle séance]   [Semaine|Jour|Liste]        [mini-cal]
Semaine du 22 au 27 septembre     ‹ ›  Aujourd'hui
        Lun 22      Mar 23      Mer 24  … (semaine, desktop)
   — vue Jour (mobile) —
Lun 22
 14h00 ┌────────────────────┐
       │ Maths · Maths-3e   │
 15h00 └────────────────────┘
   (‹ ›  naviguent le jour)
```

### 5.3 États & interactions
- Sélection de plage : surlignage `--active` sur les cases ; Escape annule.
- L'assistant conserve les valeurs à chaque étape ; « Modifier » (orange) au récap permet de revenir.
- Erreur réseau → toast ; état vide inchangé.

### 5.4 Responsive
- < 48rem : vue jour forcée par défaut, colonne pleine largeur, pastilles hauteur ≥ 44px, cibles larges.
- ≥ 48rem : semaine complète par défaut, toggle permet jour/liste.

### 5.5 Thème clair/sombre & accessibilité
- Toggle vues : `aria-pressed` (SegmentedToggle existant), jamais la couleur seule.
- Sélection au clavier : les cases restent focusables ; alternative au glisser = « + Nouvelle séance ».
- Mini-calendrier : boutons jour focusables, `aria-current="date"` sur aujourd'hui.

### 5.6 Micro-copy (FR)
- « Nouvelle séance », « Quel jour ? », « Quelle heure de début ? », « Quelle heure de fin ? »,
  « Quelle matière ? », « Quels élèves ? », « Valider », « Modifier », « Annuler ».
- Erreurs : « L'heure de fin doit être après l'heure de début. », « Cette séance chevauche une autre séance. »

## 6. Spécification technique
### 6.1 Fichiers (nouveaux / modifiés)
- **Nouveaux** : `src/components/organisms/o-seance-wizard.tsx` (assistant 5 étapes, supprimé ensuite au profit d'une page dédiée `/profs/seances/nouvelle` sur le template `QuestionPage` — cf. spec 11), `o-month-picker.tsx` (mini-calendrier) ; tests `o-week-calendar.int.spec.tsx` enrichi, `seance-wizard.int.spec.tsx`.
- **Modifiés** : `o-week-calendar.tsx` (états vue/jour, sélection plage, bouton, remplacement modale), `calendrier.utils.ts` (plages : `plageDepuisCases`, bornes), `calendrier.entity.ts` (`VueCalendrier`, `PlageSelectionnee`), `calendrier.repository.ts`/hooks si besoin, `_calendrier.scss` (suppression `min-width` en mobile, styles vues), `specs/README.md`, démo `/design-system` (toggle vues actif).

### 6.2 Données & persistance
Aucune nouvelle collection. Écritures inchangées (`POST /seances`, `PATCH /seances/:id`) ; la vue est un état d'UI (localStorage pour la préférence).

### 6.3 API / contraintes
- La sélection de plage utilise pointer events (`pointerdown/pointermove/pointerup`) avec `setPointerCapture` — couvre souris et tactile ; le drag HTML5 des pastilles existantes reste sur les events natifs.
- Calculs de plage/position : fonctions pures testées (`plageDepuisCases`, bornes chevauchement).
- Le mini-calendrier dérive ses jours « chargés » des événements déjà chargés (aucune requête supplémentaire en v1).

## 7. Critères d'acceptation
- [ ] En < 48rem, le calendrier s'affiche jour par jour, sans défilement horizontal ; pastilles ≥ 44px.
- [ ] Le toggle `Semaine | Jour | Liste` fonctionne en desktop ; la préférence persiste dans la session.
- [ ] La vue liste condensée exclut les jours vides et reste lisible.
- [ ] Le mini-calendrier surligne les jours de la semaine affichée et permet de sauter à un jour/mois.
- [ ] Cliquer-glisser une plage ouvre l'assistant pré-rempli ; « + Nouvelle séance » ouvre l'étape 1.
- [ ] L'assistant crée la séance (présences pré-créées) et ferme sur succès ; erreur → toast.
- [ ] La modale de création de la Spec 12 est supprimée ; le déplacement par drag reste opérationnel.
- [ ] La démo `/design-system` expose le toggle de vues et l'assistant.
- [ ] Lint, typecheck, tests passent.

## 8. Risques & questions ouvertes
- Pointer events sur la grille : gérer le scroll mobile pendant la sélection (désactiver le touch-scroll pendant le drag : `touch-action: none` sur les cases vides uniquement).
- Mini-calendrier : les jours « occupés » ne reflètent que la semaine chargée en v1 (les autres mois seront vus via navigation) — acceptable.
- La vue jour en mode prof multiplie les boutons-cases (24 rangées × 1) — perf triviale.