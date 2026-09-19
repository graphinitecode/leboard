# Spec 10c — Portail profs : fiche élève

> **Statut** : Accepté · **Priorité** : Moyenne · **Effort** : S · **Dépendances** : Spec 10, Spec 02, Spec 05

## 1. Objectif
Donner au prof une vision d'ensemble d'un élève (assiduité, historique pédagogique, alertes) en lecture seule — le contexte qu'il lui manque quand il prend en charge un nouveau groupe.

## 2. Valeur utilisateur
- Continuité pédagogique : consulter les progressions passées d'un élève avant une séance.
- L'alerte décrochage à portée d'œil donne le bon réflexe (parler à l'élève, signaler l'admin).

## 3. Périmètre
- **Inclus** :
  - Historique de présence (année en cours, avec taux).
  - Historique des progressions et des retours de séance.
  - Alertes `decrochage` actives — visibles uniquement par le prof référent de l'élève.
- **Exclu** : coordonnées des parents et champ consentement RGPD (masqués par `field.access`, réservés à l'admin) ; édition d'une quelconque donnée ; alertes d'autres types (biblio).

## 4. Spécification fonctionnelle
- Lecture de l'élève via les access rules du prof (pas de bypass) : le prof accède aux élèves qu'il référence ou de ses séances ; les autres → 404.
- Présences : toutes les présences de l'élève, triées récentes d'abord, avec taux global.
- Progressions : 50 dernières, triées par date.
- Retours : les séances du groupe où un retour existe, récentes d'abord.
- Alertes : seulement si `eleve.profReferent = user` — requête `alertes` de type `decrochage` non traitées, avec `overrideAccess: true` (les access rules actuelles d'`alertes` sont admin-only ; le référent a une dérogation d'affichage encadrée par cette règle).

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
- Depuis le dashboard (« Mes élèves ») ou depuis une séance (nom de l'élève).

### 5.2 Disposition (wireframe)
```
┌──────────────────────────────────────┐
│ ← Tableau de bord                    │
│ Léa Martin (4e)   Groupe : Maths-3e  │
│ ┌ ⚠️ Alertes actives ──────────────┐ │
│ │ 3 absences sur les 4 dernières… │ │
│ └─────────────────────────────────┘ │
│ ── Présence — 86% ─────────────────  │
│ ▸ 23/09 · Maths · Présent           │
│ ▸ 16/09 · Maths · Absent            │
│ ── Progressions ───────────────────  │
│ ▸ 23/09 · Division — En cours       │
│ ── Retours de séance ──────────────  │
│   (12/09) « … »                     │
└──────────────────────────────────────┘
```

### 5.3 États & interactions
- Bloc alertes conditionnel (vide → invisible).
- Toutes sections en lecture pure, pas de bouton d'édition.

### 5.4 Responsive
Mobile-first, listes verticales.

### 5.5 Thème & accessibilité
Bloc alertes avec bordure + fond contrasté, non seulement coloré.

### 5.6 Micro-copy (FR)
- « Alertes actives », « Aucune présence enregistrée. », « Aucune progression. »

## 6. Spécification technique
### 6.1 Fichiers
- `src/app/(frontend)/profs/eleves/[id]/page.tsx` (server component, unique)

### 6.2 Données
- Lectures : `eleves` (findByID, overrideAccess false), `presences` (where eleve, -createdAt), `progressions` (where eleve, -date), `seances` (where groupe = eleve), `alertes` (décrochage ouvert, dérogation référent).
- Aucune écriture.

### 6.3 API / contraintes
- Toutes les requêtes avec `overrideAccess: false` + `user`, sauf `alertes` (dérogation encadrée en 4.).
- Les champs `parents`/`consentementRGPD` ne sont jamais lus ni affichés (field access les masque de toute façon).

## 7. Critères d'acceptation
- [x] Un prof voit la fiche de ses élèves ; 404 sur un élève hors périmètre.
- [x] Le taux de présence est cohérent avec l'historique affiché.
- [x] L'alerte décrochage n'apparaît que pour le référent.
- [x] Aucune coordonnée parent n'est exposée.

## 8. Risques & questions ouvertes
- La dérogation « référent lit les alertes de son élève » est implémentée dans la page (check + overrideAccess) — si la Spec 02 évolue vers des access rules d'`alertes` par rôle, migrer la logique dans `src/access/alertes.ts`.
- Suivre les absences justifiées séparément dans une future itération (mêmes stats que la Spec 08).