# Spec 01 — Collections cœur : Users (rôles), Eleves, Seances, Presences

> **Statut** : Proposé · **Priorité** : Haute · **Effort** : L · **Dépendances** : —

## 1. Objectif
Fonder le modèle de données de LPV Board : remplacer les collections de démo du template Payload (Pages, Posts…) par les collections métier de l'association. Toutes les autres specs (access, progression, bibliothèque, alertes, parents, planning, rapports) reposent sur ce socle.

## 2. Valeur utilisateur
C'est la précondition de tout le reste : sans modèle Eleves/Seances/Presences, aucun suivi d'assiduité, aucune progression, aucun rapport. Les rôles sur `users` conditionnent la sécurité de l'ensemble (admin, prof, bénévole bibliothèque, parent).

## 3. Périmètre
- **Inclus** :
  - Refonte de la collection `users` avec champ `role` (select : `admin` / `prof` / `benevole-bibliotheque` / `parent`) + champs profil (`nom`, `telephone`).
  - Nouvelle collection `eleves` (identité, niveau scolaire, prof référent, lien vers compte parent).
  - Nouvelle collection `seances` (date, matière, groupe, prof assigné, retour du prof).
  - Nouvelle collection `presences` séparée (eleve, seance, statut) — collection dédiée plutôt qu'array imbriqué dans `seances`, pour requêter facilement « toutes les absences d'un élève » (alertes décrochage).
  - Migration/suppression des collections de démo (`posts`, `pages`, etc.) hors config par défaut.
- **Exclu** (pour cette itération) :
  - Portail parents (Spec 06) — le rôle `parent` est créé ici mais son usage vient plus tard.
  - Access control fin (Spec 02) — cette spec pose le champ `role`, la Spec 02 définit les règles.
  - Planning, disponibilités (Spec 07), bibliothèque (Spec 04), RGPD (Spec 09 — un simple placeholder `consentementRGPD` sur `eleves` suffit ici).

## 4. Spécification fonctionnelle

### 4.1 Rôles (`users.role`)
| Rôle | Qui | Usage principal |
|---|---|---|
| `admin` | Bureau de l'asso | Tout gérer : élèves, séances, comptes, paramètres |
| `prof` | Professeurs / bénévoles animateurs | Saisir présences et retours sur **ses** séances |
| `benevole-bibliotheque` | Bénévoles bibliothèque | Gérer catalogue et prêts (Spec 04) |
| `parent` | Parents d'élèves | Consulter les retours/présences de leur enfant (Spec 06) |

- Le premier utilisateur est créé via l'admin Payload au premier lancement (bootstrap manuel, pas de signup public).
- Un seul compte par personne ; un parent avec plusieurs enfants reste un seul user `parent`, relié à plusieurs `eleves`.
- Changement de rôle : réservé à l'`admin`.

### 4.2 Eleves
- Champs : `prenom`, `nom`, `dateNaissance` (date, obligatoire), `niveau` (select : CP→Terminale), `groupe` (text ou select — groupe de niveau, ex. « Maths-3e »), `profReferent` (relation → `users`, optionnel), `parents` (relation → `users`, multiple, filtré sur rôle `parent`), `consentementRGPD` (placeholder : `checkbox` + `dateConsentement` — détaillé en Spec 09).
- `useAsTitle` : `nom prenom`.
- Un élève doit avoir au moins un parent **ou** un consentement manuel validé par un admin (cas d'un majeur) — règle de validation `beforeChange`.

### 4.3 Seances
- Champs : `date` (datetime), `matiere` (select : `maths`, `francais`, `anglais`, `autre` — liste ajustable par l'admin via une collection `matieres` simple si besoin, sinon select figé pour la v1), `groupe` (relation → `eleves`, multiple — les élèves inscrits à cette séance), `prof` (relation → `users`, filtré rôle `prof` ou `admin`), `retour` (richText lexical, compte-rendu du prof), `duree` (number, minutes, optionnel).
- Une séance passée ne bloque plus l'édition (un prof peut corriger une saisie tardive), mais les modifications postérieures à 30 jours loguent un avertissement (hook `beforeChange`).

### 4.4 Presences
- Champs : `seance` (relation → `seances`), `eleve` (relation → `eleves`), `present` (select : `present` / `absent` / `absent-justifie`), `commentaire` (text, optionnel — ex. motif d'absence justifiée).
- Contrainte d'unicité (seance, eleve) : un `beforeChange` vérifie qu'il n'existe pas déjà une présence pour ce couple — sinon `validation error` « Présence déjà enregistrée pour cet élève sur cette séance ».
- À la création d'une séance : pré-création automatique des présences `present` par défaut pour tous les élèves du `groupe` (hook `afterChange` sur `seances`) — le prof ne décoche que les absents, ce qui est le cas majoritaire.

### 4.5 Suppression des collections de démo
- Retirer de `payload.config.ts` : `Posts`, `Pages`, `Categories`, `Footer`, `Header`, plugins associés (search, seo, redirects, nested-docs, form-builder) si uniquement utilisés par ces collections.
- `Media` est conservé (utile plus tard pour les avatars/documents).

## 5. UI / UX
Cette spec est d'abord « back-office » : les collections sont visibles dans l'admin Payload, utilisé par les admins (les profs utiliseront un portail dédié, Spec 06+). L'UX admin reste celle de Payload.

### 5.1 Emplacement & déclencheurs
- Sidebar admin : groupe `Association` contenant `Eleves`, `Seances`, `Presences` ; groupe `Comptes` contenant `Users`.
- Tri par défaut : `seances` par date décroissante ; `presences` par seance.date décroissante.

### 5.2 Disposition (wireframe)
- Liste `seances` : colonnes `date`, `matiere`, `prof`, `# élèves`, `# absents`.
- Liste `eleves` : colonnes `nom`, `niveau`, `groupe`, `profReferent`.
- Vue détail `seance` : champs en haut, relation list `presences` (list view filtrée sur la séance) en dessous via un champ `ui`/custom component simple — acceptable en v1 de laisser l'utilisateur naviguer via la collection `presences` filtrée.

### 5.3 États & interactions
- Création d'une séance → toast de succès + les présences pré-remplies apparaissent en relation.
- Doublon de présence → message d'erreur inline sur le champ.

### 5.4 Responsive
Admin Payload natif (déjà responsive) — rien à faire.

### 5.5 Thème clair/sombre & accessibilité
Thème admin Payload natif (light/dark) — rien à faire.

### 5.6 Micro-copy (FR)
- « Présence déjà enregistrée pour cet élève sur cette séance. »
- « Un élève doit avoir au moins un parent relié ou une dérogation validée par un admin. »
- Labels : `Élève`, `Séance`, `Présence`, `Absent (justifié)`.

## 6. Spécification technique

### 6.1 Fichiers (nouveaux / modifiés)
- Modifiés : `src/payload.config.ts` (collections, retrait démo), `src/collections/Users/index.ts` (rôles).
- Nouveaux : `src/collections/Eleves/index.ts`, `src/collections/Seances/index.ts`, `src/collections/Presences/index.ts`, hooks dans `src/hooks/` (`preCreerPresencesSeance`, `verifierUnicitePresence`).
- Générés : `src/payload-types.ts` via `pnpm generate:types`.

### 6.2 Données & persistance
- Postgres (adapter déjà en place). `postgresAdapter` + `push` en dev, migrations en prod.
- Index : `presences` unique composite (seance_id, eleve_id) si supporté par l'adapter, sinon vérification applicative (4.4).

### 6.3 API / contraintes
- REST/Local API standard Payload — rien de custom.
- Contrainte : le filtrage `parents` sur rôle `parent` et `prof` sur rôle `prof` via `filterOptions` dans les champs relation.
- Seed de démo (`src/endpoints/seed`) : à neutraliser ou adapter aux nouvelles collections (décision : neutraliser, les vraies données viennent de l'admin).

## 7. Critères d'acceptation
- [ ] `pnpm dev` démarre sans les collections de démo et avec `eleves`, `seances`, `presences` visibles dans l'admin.
- [ ] Un admin peut créer un user avec chaque rôle (les 4 rôles sont proposés).
- [ ] Un admin crée un élève avec parent relié, niveau, groupe, prof référent.
- [ ] Créer une séance avec un groupe de 5 élèves crée automatiquement 5 présences à `present`.
- [ ] Marquer un élève `absent-justifie` avec commentaire fonctionne.
- [ ] Tenter de créer une 2e présence pour le même couple (séance, élève) échoue avec le message FR prévu.
- [ ] `pnpm generate:types` régénère `payload-types.ts` sans erreur ; `pnpm lint` et `pnpm typecheck` passent.

## 8. Risques & questions ouvertes
- Liste des matières : select figé en v1 ou collection `matieres` éditable dès maintenant ? (Décision à prendre — coût faible de la collection, mais plus d'UI.)
- La pré-création des présences à la création de séance peut créer beaucoup de docs ; acceptable vu les volumes (≤ ~30 élèves/groupe).
- Le champ `groupe` sur `eleves` (texte libre vs select vs collection) : à stabiliser en même temps que les matières.
- Vérifier le comportement de l'unicité composite avec `db-postgres` (contrainte nativement supportée via `indexes` de la collection ? sinon hook).