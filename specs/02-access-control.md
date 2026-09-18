# Spec 02 — Access control par rôle

> **Statut** : Proposé · **Priorité** : Haute · **Effort** : M · **Dépendances** : Spec 01

## 1. Objectif
Définir qui peut lire/écrire quoi, collection par collection et champ par champ, selon le rôle (`admin`, `prof`, `benevole-bibliotheque`, `parent`). Garantir qu'un prof ne voit que ses séances/élèves, qu'un bénévole bibliothèque n'a pas accès aux données pédagogiques, et qu'aucun compte `parent` ne peut accéder à l'admin Payload.

## 2. Valeur utilisateur
- Sécurité et RGPD : des données de mineurs ne doivent pas être visibles par n'importe quel compte authentifié (le template actuel laisse tout user authentifié tout faire).
- Confiance : les profs voient une interface épurée ne contenant que ce qui les concerne.
- Base du portail parents (Spec 06) : les règles définies ici seront réutilisées par l'API du portail.

## 3. Périmètre
- **Inclus** :
  - Helpers d'access réutilisables (`isAdmin`, `hasRole`, helpers de périmètre prof).
  - Règles collection par collection : `users`, `eleves`, `seances`, `presences` (+ règles à venir pour `progressions`, `livres`, `prets`, `alertes` référencées dans leurs specs).
  - Accès aux champs sensibles (`parents`, `consentementRGPD` sur `eleves`).
  - Blocage de l'admin Payload pour les rôles `parent` (et éventuellement `benevole-bibliotheque` si son usage se limite au futur portail).
- **Exclu** (pour cette itération) : l'implémentation des collections citées qui n'existent pas encore (Spec 03/04/05) — cette spec définit la convention et les règles pour les collections existantes (Spec 01).

## 4. Spécification fonctionnelle

### 4.1 Matrice d'accès (collections cœur)

| Collection / action | admin | prof | benevole-bibliotheque | parent |
|---|---|---|---|---|
| `users` read | tout | soi-même | soi-même | soi-même |
| `users` create/update | tout | soi-même (profil) | soi-même (profil) | soi-même (profil) |
| `users` delete | tout | — | — | — |
| `users` role (champ) | oui | non | non | non |
| `eleves` read | tout | ses élèves référents (+ élèves de ses séances) | nom, niveau, groupe (nécessaire aux prêts) | ses enfants (pour le portail, Spec 06) |
| `eleves` create/update/delete | oui | non | non | non |
| `eleves.parents`, `eleves.consentementRGPD` (champs) | lecture/écriture | masqués | masqués | lecture de sa fiche (Spec 06) |
| `seances` read | tout | où `prof = soi` | non | séances de ses enfants (Spec 06, lecture via portail) |
| `seances` create/update | oui | où `prof = soi` | non | non |
| `seances` delete | oui | non | non | non |
| `presences` read | tout | séances où `prof = soi` | non | présences de ses enfants (Spec 06) |
| `presences` create/update | oui | séances où `prof = soi` | non | non |

- « Ses élèves référents » : `eleves.profReferent = user.id`.
- Un prof peut-il créer une séance ? Oui (il organise sa séance) mais elle lui est automatiquement assignée (hook force `prof = user` si rôle `prof`).

### 4.2 Règles transversales
- Non authentifié : aucun accès (aucune route publique de données métier).
- Le filtrage par relation (ex. `seances.prof = user`) retourne une **Where clause** (`{ prof: { equals: user.id } }`), pas un booléen — standard Payload.
- Requêtes à travers relation (ex. `progressions` filtrées par `eleve.profReferent`) : vérifier le support dans Payload 3 ; fallback fiable = dupliquer le champ (ex. `profReferent` copié sur la doc fille via hook `beforeChange`) pour requêter directement.
- Les accès API REST et GraphQL découlent des mêmes règles (une seule source de vérité).
- Rôle `parent` : `admin: () => false` sur la collection `users` (pas d'accès au panel admin) ; ses accès read se limitent à ce que le portail exposera (Spec 06) — en v1, read `eleves` restreint à ses enfants.

### 4.3 Champs sensibles
- `eleves.parents` et `eleves.consentementRGPD` : `field.access.read` et `field.access.update` réservés à `admin`.
- `users.role` : lecture par soi-même ok, écriture admin only.
- `users.telephone` : visible par admin et soi-même.

## 5. UI / UX
- Admin Payload : les rôles non-admin ne voient dans la sidebar que les collections qu'ils peuvent lire (Payload le déduit des access functions — à vérifier en testant).
- 403 propre : l'API renvoie `403` avec message générique, pas de fuite d'information (« Accès refusé »).
- Pas d'UI custom dans cette spec.

### 5.6 Micro-copy (FR)
- « Vous n'avez pas les droits nécessaires pour cette action. »

## 6. Spécification technique

### 6.1 Fichiers (nouveaux / modifiés)
- Nouveaux : `src/access/roles.ts` (`isAdmin`, `hasRole`, `adminOnlyField`), `src/access/eleves.ts`, `src/access/seances.ts`, `src/access/presences.ts`, `src/access/users.ts`.
- Modifiés : les 4 collections (Spec 01) pour brancher les access functions ; `src/access/authenticated.ts` reste pour les cas génériques.
- Types : étendre le type `User` (`role`) — vient de `payload-types.ts` après Spec 01.

### 6.2 Données & persistance
Aucun changement de schéma, sauf fallback « champ dupliqué » si nécessaire (ex. `seances.profReferent` déjà présent — pas de duplication requise en v1).

### 6.3 API / contraintes
- Les access functions doivent être pures et rapides (Where clauses en base, pas de filtrage post-lecture, sauf cas relation complexe documenté).
- Tests recommandés (vitest, env int existante) : pour chaque rôle × collection × action (read/create/update/delete), vérifier autorisation/refus — matrice de tests paramétrée.

## 7. Critères d'acceptation
- [ ] Un `prof` listant `seances` ne voit que les séances où il est assigné (vérifié API REST et admin).
- [ ] Un `prof` ne peut pas modifier une séance d'un autre prof (update → 403/0 résultat).
- [ ] Un `benevole-bibliotheque` lit `eleves` mais ne voit ni `parents` ni `consentementRGPD`, et ne peut rien écrire sur `eleves`.
- [ ] Un `benevole-bibliotheque` ne voit ni `seances` ni `presences` dans l'admin ni via l'API.
- [ ] Un `parent` ne peut pas se connecter à l'admin Payload (message d'exclusion) et ne peut rien écrire.
- [ ] Seul un `admin` peut changer le rôle d'un user.
- [ ] Chaque cellule de la matrice 4.1 est couverte par un test (passé ou 403).
- [ ] `pnpm lint`, typecheck et `pnpm test:int` passent.

## 8. Risques & questions ouvertes
- Payload 3 : le panel admin d'un user sans accès `admin` sur aucune collection peut planter ou boucler — à tester avec le rôle `parent` (fallback : redirect ou page dédiée).
- `field.access.read` masque le champ dans l'API aussi : vérifier que le portail parents (Spec 06) pourra malgré tout exposer les infos parents via une route custom côté serveur (bypass avec `overrideAccess`).
- Le périmètre « élèves de ses séances » pour un prof (au-delà du référent) : utile pour éviter les angles morts, mais élargit la lecture des fiches élèves — décision : l'inclure (lecture seule, sans champs sensibles).
- Quid des bénévoles non-bibliothèque sans rôle spécifique ? En v1 : ils ne devraient pas avoir de compte, ou un rôle `prof` sans séance assignée. À confirmer avec l'asso.