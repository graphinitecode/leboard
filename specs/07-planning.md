# Spec 07 — Planning bénévoles/profs

> **Statut** : Proposé · **Priorité** : Moyenne · **Effort** : M · **Dépendances** : Spec 01, Spec 02

## 1. Objectif
Centraliser les disponibilités déclarées des profs/bénévoles et l'affectation aux créneaux, pour éviter les créneaux sans encadrant et les doubles réservations — dans une asso qui tourne avec des disponibilités variables.

## 2. Valeur utilisateur
- Coordinateur : vue hebdo de qui est là, quand, sur quel groupe ; repère immédiatement les trous de couverture.
- Profs/bénévoles : déclarent leurs dispos une fois, les voit évoluer, savent quand ils sont attendus.
- Fiabilise les séances (Spec 01) : la séance planifiée est la source de la séance réellement tenue.

## 3. Périmètre
- **Inclus** :
  - Global `planning` ou collection `creneaux` : créneaux récurrents hebdomadaires (ex. mardi 17h30–19h, salle A, matière) + affectation d'un prof et d'un groupe d'élèves.
  - Déclaration de disponibilités par les users prof : array `disponibilites` sur `users` (créneaux hebdo où ils sont dispo) — déjà esquissé dans l'architecture cible.
  - Indicateurs de couverture : un créneau sans prof assigné est visible (badge « à couvrir »).
  - Génération des `seances` à partir des créneaux (semence de la période suivante, manuelle en v1 : bouton « générer les séances du X au Y »).
- **Exclu** (pour cette itération) :
  - Remplacements de dernière minute avec notifications push/email.
  - Vue calendrier drag-and-drop riche (une table + formulaire suffisent en v1).
  - Gestion des salles multiples complexes (champ `salle` texte simple suffit).
  - Portail de disponibilités self-service pour bénévoles externes (se fait dans l'admin pour les comptes `prof`).

## 4. Spécification fonctionnelle

### 4.1 Créneaux
- Collection `creneaux` : `jour` (select lun→dim), `heureDebut`, `heureFin` (times), `salle` (text, optionnel), `matiere` (select, cohérent avec séances), `prof` (relation users, filtré rôle prof/admin), `groupe` (relation eleves, multiple), `actif` (checkbox — un créneau inactif n'est plus généré).
- Unicité : un prof ne peut pas être sur 2 créneaux qui se chevauchent (validation `beforeChange` : même jour + chevauchement horaire + même prof → erreur).
- Le groupe d'un créneau devient le `groupe` des séances générées.

### 4.2 Disponibilités
- Sur `users` (rôle prof) : array `disponibilites` : { `jour`, `heureDebut`, `heureFin` }. Saisie par le prof lui-même (Spec 02 : chacun édite son profil).
- À l'affectation d'un prof sur un créneau : avertissement (non bloquant) si le créneau n'est pas couvert par une de ses disponibilités déclarées (« Ce créneau n'est pas dans les disponibilités déclarées de ce prof »).

### 4.3 Génération de séances
- Action admin (endpoint custom ou script) : pour une période (ex. « du 01/10 au 31/10 »), génère une `seance` par créneau actif × occurrence hebdomadaire dans la période, avec `date`, `matiere`, `groupe`, `prof` copiés.
- Idempotence : ne régénère pas une séance déjà existante pour le même créneau + date (check beforeChange).
- Les séances générées sont modifiables ensuite (cas des reports) — la séance ne référence pas le créneau à vie (champ `creneau` relation, optionnel, pour la traçabilité).

### 4.4 Indicateurs
- Vue list `creneaux` : badge « à couvrir » si `prof` vide ; badge « conflit » si un doublon de prof a passé la validation (ex. après édition).
- Compte d'élèves par créneau (longueur du `groupe`).

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
- Sidebar → groupe `Planning` : `Creneaux`. Action « Générer les séances » depuis la list view (custom button, v1 possible via endpoint + lien).

### 5.2 Disposition (wireframe)
```
Créneaux (tri : jour puis heure)
┌───────────────────────────────────────────────────────────────┐
│ Jour     Heures      Matière   Prof        Élèves    Statut   │
│ Mardi    17:30–19:00 Maths     J. Dupont   8         OK       │
│ Mercredi 14:00–15:30 Français  —           6         ⚠ à couvrir │
│ Jeudi    17:30–19:00 Anglais   M. Lefevre  5         ⚠ pas dans les dispos │
└───────────────────────────────────────────────────────────────┘
[ Générer les séances du 01/10 au 31/10 ]
```

### 5.3 États & interactions
- Choix du prof : dropdown filtré sur les profs disponibles ce jour (dispos déclarées) d'abord, tous ensuite (grisés).
- Génération : écran de confirmation (nombre de séances attendues), puis toast de résultat (« 26 séances créées, 0 doublon »).

### 5.4 Responsive
Admin natif.

### 5.5 Thème clair/sombre & accessibilité
Horaires affichés en 24h ; badges avec libellé.

### 5.6 Micro-copy (FR)
- « Ce créneau n'a pas de prof assigné. », « Conflit : ce prof est déjà affecté sur un créneau qui se chevauche. »
- « Générer les séances » / « 26 séances créées. »

## 6. Spécification technique

### 6.1 Fichiers (nouveaux / modifiés)
- Nouveaux : `src/collections/Creneaux/index.ts`, champ `disponibilites` sur `Users`, `src/endpoints/genererSeances/route.ts` (ou custom action admin), hook de chevauchement `src/hooks/creneaux/verifierChevauchement.ts`.
- Modifiés : `payload.config.ts`, `Users` (array dispos).

### 6.2 Données & persistance
- Créneaux récurrents stockés simplement (jour + times) — pas de bibliothèque de calendrier nécessaire en v1.
- Séances générées : champ `creneau` nullable pour la traçabilité + unicité (creneau, date) applicative.

### 6.3 API / contraintes
- Endpoint custom (admin only, `overrideAccess` interne) : `POST { periodeDebut, periodeFin }` → `{ creees, ignorees }`. Auth par session admin (usage depuis l'admin) — pas de secret cron nécessaire.
- Fuseaux : stocker les times sans timezone ambiguë (strings HH:mm) et la date de séance en `date` complète à la génération (timezone Europe/Paris côté génération).

## 7. Critères d'acceptation
- [ ] Un admin crée des créneaux avec prof, groupe, matière, salle.
- [ ] Deux créneaux chevauchants avec le même prof sont refusés avec le message prévu.
- [ ] Un créneau sans prof affiche « à couvrir ».
- [ ] Assigner un prof non déclaré disponible ce jour affiche l'avertissement (non bloquant).
- [ ] La génération sur une période crée exactement les séances attendues, idempotente au 2e appel.
- [ ] Chaque séance générée pré-crée les présences (règle Spec 01).
- [ ] Un prof peut éditer ses propres disponibilités dans son profil.
- [ ] Lint, typecheck, tests (chevauchement, idempotence génération) passent.

## 8. Risques & questions ouvertes
- Les vacances scolaires : la génération naïve crée des séances pendant les vacances. En v1 : l'admin supprime/ajuste après génération (ou choisit des périodes propres). Une liste de jours fériés/vacances (global `calendrier`) peut venir en v2.
- Double-bookage d'une **salle** (si plusieurs créneaux même salle) : à valider aussi ? En v1, une seule salle probable — champ texte, pas de validation.
- Volumes : ~10 créneaux × 40 semaines = ~400 séances/an — trivial.
- Les disponibilités en array simple suffisent-elles (pas d'exceptions ponctuelles type « absent le 12/10 ») ? En v1 oui ; les exceptions pourraient passer par l'absence de séance générée puis ré-ajustée manuellement.