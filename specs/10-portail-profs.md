# Spec 10 — Portail profs

> **Statut** : Proposé · **Priorité** : Haute · **Effort** : M · **Dépendances** : Spec 01, Spec 02, Spec 03

## 1. Objectif
Offrir aux profs un front web dédié, pensé pour la saisie rapide (notamment mobile, avant/après séance), en réutilisant l'auth et les access rules Payload — au lieu de les faire utiliser l'admin Payload générique.

## 2. Valeur utilisateur
- Ergonomie : un prof non-tech voit uniquement « mes séances → marquer les absents → écrire le retour », sans naviguer dans les collections.
- Mobile-first : la saisie des présences se fait dans la salle, sur un téléphone.
- Sécurité : l'API Payload + `overrideAccess: false` appliquent déjà le périmètre du prof.

## 3. Périmètre
- **Inclus** :
  - `/profs` : accueil (mes séances à venir / récentes), lien vers ses élèves.
  - `/profs/seances/[id]` : prise de présence rapide (toggle par élève), retour de séance (textarea → richText lexical minimal), ajout de progressions par élève.
  - `/profs/disponibilites` : éditer ses disponibilités hebdo.
  - Auth par session Payload, gate rôle `prof` (admin accepté pour démo/test).
- **Exclu** (pour cette itération) : gestion des élèves/groupes, bibliothèque, édition des créneaux (l'admin reste le lieu de configuration).

## 4. Spécification fonctionnelle
- Le prof ne voit que ses séances (règle Spec 02, appliquée par requête `where prof = user`).
- Présence : toggle présent/absent/absent-justifié par élève ; sauvegarde immédiate (optimiste) via API REST `PATCH /api/presences/[id]` (cookie `payload-token`).
- Retour : zone de texte simple ; stocké dans le champ lexical `retour` de la séance (conversion texte → lexical).
- Progression : sélection compétence (filtrée par matière de la séance) + niveau + commentaire ; `POST /api/progressions`.
- Disponibilités : liste jour/plage, ajout/suppression ; `PATCH /api/users/[id]` (soi-même).

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
`/profs` — accessible depuis mobile pendant la séance.

### 5.2 Disposition (wireframe)
```
/profs                        /profs/seances/[id]
┌──────────────────────┐      ┌──────────────────────────────┐
│ Mes séances          │      │ Mardi 23/09 · Maths          │
│ ▸ Aujourd'hui (1)    │      │ Présences :                  │
│   17:30 Maths        │      │  Léa M.    [Présent] ▾       │
│ ▸ Cette semaine (3)  │      │  Karim B.  [Absent] ▾        │
│ ▸ Passées récentes   │      │  + commentaire absence       │
│ Mes élèves (12)      │      │ Retour : [__________]        │
│ [Mes disponibilités] │      │ [+ Ajouter une progression]  │
└──────────────────────┘      └──────────────────────────────┘
```

### 5.3 États & interactions
- Toggle présence avec feedback immédiat ; erreur → toast « Échec de l'enregistrement ».
- Bouton « Tout présents » (case majoritaire).

### 5.4 Responsive
Mobile-first (la saisie se fait en salle).

### 5.5 Thème & accessibilité
Thème système, contrastes AA, boutons ≥ 44 px.

### 5.6 Micro-copy (FR)
« Marquer les absents », « Enregistré », « Échec de l'enregistrement », « Ma disponibilité ».

## 6. Spécification technique
- Server components + Server Actions (Local API, `overrideAccess: false`, `user` attaché) — pas de client secret.
- Conversion textarea → lexical : `{ root: { children: [{ children: [{ text }], type: 'paragraph' }], type: 'root' } }`.
- Réutilise `getMeUserServer` (rôle `prof` ou `admin`).

## 7. Critères d'acceptation
- [ ] Un `prof` se connecte et voit uniquement ses séances.
- [ ] Il toggle les présences et le changement est persisté.
- [ ] Il écrit un retour qui apparaît dans la séance (admin + portail parents).
- [ ] Il ajoute une progression liée à la séance.
- [ ] Il édite ses disponibilités.
- [ ] Un `parent` accédant à `/profs` est redirigé/404.
- [ ] Lint, typecheck passent.

## 8. Risques & questions ouvertes
- Toggle optimiste vs server action : garder simple (server action + revalidate).
- Les admins ont-ils accès au portail ? Oui (lecture), utile pour la démo/support.
- Plus tard : notifications push aux profs d'une séance annulée.