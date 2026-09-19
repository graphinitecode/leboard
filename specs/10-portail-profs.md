# Spec 10 — Portail profs

> **Statut** : Accepté · **Priorité** : Haute · **Effort** : M · **Dépendances** : Spec 01, Spec 02, Spec 03, Spec 07

## 1. Objectif
Offrir aux profs un front web dédié, pensé pour la saisie rapide (notamment mobile, avant/après séance), en réutilisant l'auth et les access rules Payload — au lieu de les faire utiliser l'admin Payload générique.

## 2. Valeur utilisateur
- Ergonomie : un prof non-tech voit uniquement « mes séances → marquer les absents → écrire le retour », sans naviguer dans les collections.
- Mobile-first : la saisie des présences se fait dans la salle, sur un téléphone.
- Sécurité : les access rules Payload appliquent déjà le périmètre du prof (`overrideAccess: false`).

## 3. Périmètre
- **Inclus** :
  - Connexion via la session Payload native (cookie JWT), gate rôle `prof` (admin accepté pour support/démo).
  - `/profs` — tableau de bord : séances à venir (aujourd'hui / cette semaine) et passées, avec badge « retour à faire ».
  - `/profs/seances/[id]` — détail séance : présences en un tap, retour, progression sans changer de page.
  - `/profs/eleves/[id]` — fiche élève lecture seule : historiques + alertes actives.
  - `/profs/disponibilites` — gestion de ses disponibilités hebdomadaires.
- **Exclu** (pour cette itération) : gestion des élèves/groupes, bibliothèque, édition des créneaux (l'admin reste le lieu de configuration), messagerie interne.

## 4. Spécification fonctionnelle
- Le prof ne voit que ses séances (règle Spec 02, appliquée par requête `where prof = user` avec `overrideAccess: false`).
- Présence : toggle présent/absent/absent-justifié par élève ; un seul tap ; sauvegarde immédiate via server action.
- Retour : zone de texte simple ; stocké dans le champ lexical `retour` de la séance (conversion texte → lexical).
- Progression : compétence + niveau + commentaire, liée à la séance ; dénormalisation automatique (hook Spec 03).
- Fiche élève : lecture seule ; champs sensibles (`parents`, `consentementRGPD`) invisibles via `field.access` ; alertes décrochage visibles uniquement par le prof référent.

## 5. UI / UX
Détailé par partie : `10a-dashboard.md` (connexion + dashboard), `10b-seance.md` (détail séance), `10c-fiche-eleve.md` (fiche élève), `10d-disponibilites.md` (planning/disponibilités).

## 6. Spécification technique
- Server components + Server Actions (Local API, `overrideAccess: false`, `user` attaché) — pas de secret client.
- Conversion textarea → lexical : `{ root: { children: [{ children: [{ text }], type: 'paragraph' }], type: 'root' } }`.
- Réutilise `getMeUserServer` (rôle `prof` ou `admin`).

## 7. Critères d'acceptation
- [x] Un `prof` se connecte et voit uniquement ses séances.
- [x] Il toggle les présences et le changement est persisté.
- [x] Il écrit un retour qui apparaît dans la séance (admin + portail parents).
- [x] Il ajoute une progression liée à la séance.
- [x] Il édite ses disponibilités.
- [x] Un `parent` accédant à `/profs` est redirigé vers `/profs/login`.
- [x] Lint, typecheck passent.

## 8. Risques & questions ouvertes
- Les admins ont-ils accès au portail ? Oui (lecture), utile pour la démo/support.
- Plus tard : notifications push aux profs d'une séance annulée.