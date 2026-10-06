# Spec 15 — Séances récurrentes

## 1. Objectif
Créer en une fois une séance qui se répète (chaque semaine ou chaque mois), avec ou sans date de fin, et gérer la série depuis le calendrier.

## 2. Valeur utilisateur
- Le prof ne ressaisit plus chaque semaine le même cours.
- La pastille signale d'un coup d'œil une séance récurrente, et si sa série a une fin.

## 3. Périmètre
- **Inclus** : choix « Une seule fois / Chaque semaine / Chaque mois » à la création, fin « Jamais / Jusqu'à une date » ; icône de récurrence dans la pastille ; déplacement et changement de durée avec portée ; suppression avec portée depuis la fiche séance.
- **Exclu** : exceptions sans séance (« pas de cours pendant les vacances » autrement qu'en supprimant les séances concernées) ; modification de la matière ou du groupe à l'échelle de la série ; récurrence quotidienne ou toutes les deux semaines.

## 4. Spécification fonctionnelle
- **Hebdomadaire** : même jour de semaine et même heure chaque semaine, à partir du jour choisi.
- **Mensuelle** : même jour de semaine au même rang (« le 2e mardi ») ; un 5e jour de semaine devient « le dernier » du mois.
- **Fin** : date (dernier jour possible, incluse) ou jamais. Sans fin, les séances existent sur **3 mois glissants**, prolongés par le cron quotidien.
- **Occurrences réelles** : chaque occurrence est une séance (appel, présences, retour), rattachée à la série.
- **Heure de Paris** : l'heure reste la même de part et d'autre d'un changement d'heure.
- **Portée** (déplacer, changer la durée, supprimer) : cette séance / celle-ci et les suivantes / toute la série. « Toute la série » ne touche jamais les séances passées (historique des présences). Au-delà de « cette séance », la règle suit (jour, heure, durée) pour les séances à générer.
- **Suppression** : « celle-ci et les suivantes » et « toute la série » arrêtent la série (date de fin la veille) ; une série qui n'a plus aucune séance disparaît. Un prof ne supprime que les séances d'une série ; une séance ponctuelle reste supprimable par l'administration seule.
- **Fin des cours** : aucune occurrence ne peut finir après 18h (création, décalage).

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
- `/profs/seances/nouvelle` : étapes « Cette séance se répète-t-elle ? » puis « Jusqu'à quand se répète-t-elle ? ».
- Calendrier prof : icône `rivet-icons:sync` dans la pastille ; modale de portée au dépôt ou au redimensionnement.
- Fiche séance : ligne « Répétition », carte « Séance récurrente » → `/profs/seances/[id]/supprimer`.

### 5.3 États & interactions
- Icône colorée (couleur du portail) : série sans fin. Icône atténuée : série avec une date de fin.
- Modale de portée : « Cette séance seulement » cochée par défaut ; Annuler remet la pastille en place.

### 5.5 Thème clair/sombre & accessibilité
- L'icône porte un libellé (« Séance récurrente, sans fin » / « …avec une date de fin ») : l'état n'est jamais porté par la couleur seule.

### 5.6 Micro-copy (FR)
- « Une seule fois », « Chaque semaine », « Chaque mois », « Jamais », « Jusqu'à une date », « Dernier jour ».
- « Chaque semaine le mardi, sans fin », « Chaque mois le 2e mardi, jusqu'au 15 décembre 2026 ».
- Portée : « Cette séance seulement », « Cette séance et les suivantes », « Toutes les séances de la série ».

## 6. Spécification technique
### 6.1 Fichiers
- **Nouveaux** : `src/collections/Series`, `src/seances/domain/recurrence.ts`, `src/seances/infrastructure/series.server.ts`, `src/seances/infrastructure/series.endpoints.ts`, `src/shared/fuseau.ts`, `src/components/organisms/o-portee-serie.tsx`, `src/app/(frontend)/profs/seances/[id]/supprimer/`, migration `20261006_112127_seances_recurrentes`.
- **Modifiés** : `Seances` (champ `serie`, endpoints), cron `/api/cron/alertes` (prolongation), calendrier (dépôt, hooks, organism), parcours de création, fiche séance.

### 6.2 Données & persistance
- `series` : `frequence`, `premiere` et `fin` (AAAA-MM-JJ), `heureDebut` (HH:mm), `duree`, `matiere`, `groupe`, `prof`, `genereJusqua`.
- `seances.serie` : relation vers la série (vide = ponctuelle).

### 6.3 API / contraintes
- `POST /api/series` : crée la série et génère ses séances (hook `afterChange`).
- `POST /api/seances/:id/serie` `{ portee, date, duree }` ; `POST /api/seances/:id/supprimer` `{ portee }` — accès vérifié avec les règles de la collection (un prof n'atteint que ses séances).
- Le cron prolonge les séries dans la route existante (nombre de crons Vercel limité).

## 7. Critères d'acceptation
- [x] La création propose la répétition et sa fin ; une série crée ses séances jusqu'à la fin ou sur 3 mois.
- [x] La pastille affiche l'icône de récurrence, colorée sans fin, atténuée avec une fin.
- [x] Déplacer ou redimensionner une séance récurrente demande la portée ; une séance ponctuelle s'enregistre directement.
- [x] La fiche d'une séance récurrente permet de la supprimer avec la portée choisie ; le passé est conservé.
- [x] Les occurrences gardent l'heure de Paris au changement d'heure.
- [x] Lint, typecheck, tests passent.

## 8. Risques & questions ouvertes
- Une série « jamais » dépend du cron quotidien : s'il ne tourne pas, l'horizon de 3 mois n'avance plus.
- Modifier la matière ou les élèves d'une série n'est pas encore possible (séance par séance seulement).
