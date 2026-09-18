# Spec 05 — Alertes automatiques + cron

> **Statut** : Proposé · **Priorité** : Haute · **Effort** : M · **Dépendances** : Spec 01, Spec 02, Spec 04

## 1. Objectif
Détecter automatiquement, chaque nuit, les situations qui nécessitent une action humaine : décrochage d'un élève (absences répétées), retards de prêt bibliothèque, retours à échéance proche — et les présenter dans un tableau de bord administrable avec suivi d'état (nouvelle / vue / traitée).

## 2. Valeur utilisateur
- Décrochage : une absence isolée passe inaperçue ; 3 absences sur 4 séances signale un élève qui décroche — l'asso peut réagir (appel au parent) avant la perte définitive.
- Bibliothèque : les retards sont constatés au lieu d'être découverts des mois plus tard ; le rappel préventif évite le retard.
- Admin : un seul écran à consulter, avec priorisation visuelle, au lieu de fouiller 5 collections.

## 3. Périmètre
- **Inclus** :
  - Collection `alertes` (type, cible, message, statut, dates).
  - Job nocturne de détection (3 détecteurs : décrochage, retards, rappels) via cron Vercel → route API authentifiée par `CRON_SECRET`.
  - Garde-fou anti-doublon : une seule alerte ouverte par (type, cible).
  - Tableau de bord admin : liste filtrable par type/statut, actions « marquer vue / traitée ».
- **Exclu** (pour cette itération) :
  - Envoi d'emails (Resend etc.) — prévu comme extension, non bloquant.
  - Alertes temps réel (événementiel) — le cron nocturne suffit pour des données qui changent au rythme hebdo.
  - Notifications push / SMS.

## 4. Spécification fonctionnelle

### 4.1 Types d'alertes
| Type | Déclencheur | Cible | Message type |
|---|---|---|---|
| `decrochage` | ≥ 3 absences (tout statut d'absence) sur les 4 dernières séances **auxquelles l'élève était attendu** | eleve | « 3 absences sur les 4 dernières séances » |
| `retard-bibliotheque` | prêt ouvert avec `dateRetourPrevue < aujourd'hui` | pret (+ eleve dérivée) | « Retard sur "Sésamath 4e" depuis le 10/09 » |
| `rappel-retour` | prêt ouvert, retour prévu dans ≤ 2 jours (et pas déjà en retard) | pret (+ eleve dérivée) | « Retour prévu le 20/09 » |

- Paramètres seuils (3 absences / 4 séances / 2 jours) : constants applicatifs en v1 (`src/utilities/alertsConfig.ts`), éditables plus tard via une global Payload si besoin.

### 4.2 Cycle de vie d'une alerte
1. **nouvelle** : créée par le cron.
2. **vue** : un admin/bénévole l'a consultée (manuel).
3. **traitee** : l'action humaine est faite (parent appelé, livre rendu) — manuel ; se ferme aussi automatiquement si la cause disparaît ? **Non** : le statut `traitee` reste manuel ; si la condition re-déclenche après traitement, une nouvelle alerte est créée (c'est voulu — l'alerte traitée documente l'action passée).
- Anti-doublon : le cron ne crée pas d'alerte si une alerte (type, même cible) existe avec statut `nouvelle` ou `vue`. Ex. un retard signalé la nuit 1 reste « nouvelle » ; le cron ne duplique pas les nuits suivantes.
- Résolution automatique douce : si une alerte `rappel-retour` voit son prêt rendu, le cron la passe à `traitee` avec note « résolue automatiquement (prêt rendu) » — évite le bruit obsolète. Idem `decrochage` si l'élève revient assidu (2 dernières séances présentes) : statut `traitee` auto avec note.

### 4.3 Exécution
- Cron Vercel (`vercel.json`) : `0 3 * * *` (3h UTC) → `GET /api/cron/alertes` avec header `Authorization: Bearer CRON_SECRET`.
- Route idempotente, réponse JSON `{ ok, creees, resolues }` ; timeout < 60 s (limites Vercel) — volumes faibles, OK ; limiter les requêtes (bulk find par élève plutôt que N+1 si nécessaire).
- Journalisation : `console.log` structuré du résumé d'exécution (visible dans les logs Vercel).

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
- Sidebar → groupe `Suivi` → `Alertes`. Un badge de comptage sur le groupe (custom admin component, v2 — pas bloquant).

### 5.2 Disposition (wireframe)
```
┌─────────────────────────────────────────────────────────────┐
│ ALERTES  [nouvelle ▾] [tous types ▾]                        │
├─────────────────────────────────────────────────────────────┤
│ ● 18/09 · décrochage      Léa M. (4e)      3 absences/4     │ [vue] [traitée]
│ ● 18/09 · retard biblio   Karim B.         depuis 10/09     │ [vue] [traitée]
│ ○ 17/09 · rappel retour   Sara K.          échéance 19/09   │ [traitée]
└─────────────────────────────────────────────────────────────┘
```

### 5.3 États & interactions
- Tri : nouvelles d'abord, puis par date décroissante.
- Actions rapides sur la ligne (mark vue / mark traitée). Un commentaire facultatif « résolution » documente l'action (ex. « parent rappelé le 19/09 »).

### 5.4 Responsive
Admin natif.

### 5.5 Thème clair/sombre & accessibilité
Point ● coloré par type + libellé (pas que la couleur).

### 5.6 Micro-copy (FR)
- « Marquer comme vue », « Marquer comme traitée », « Aucune alerte — tout va bien 🎉 » (ou sobre : « Aucune alerte ouverte »).

## 6. Spécification technique

### 6.1 Fichiers (nouveaux / modifiés)
- Nouveaux : `src/collections/Alertes/index.ts`, `src/utilities/alerts/` (`detecterDecrochage`, `detecterRetards`, `detecterRappels`, `creerAlerteSiInexistante`, `resoudreSiCauseDisparue`), `src/app/api/cron/alertes/route.ts`, `vercel.json` (cron).
- Modifiés : `payload.config.ts`, `.env.example` (déjà `CRON_SECRET`).

### 6.2 Données & persistance
- `alertes` : `type` (select), `eleve` (relation, selon type), `pret` (relation, optionnel), `message` (text), `statut` (select : `nouvelle`/`vue`/`traitee`), `dateCreation` (date, défaut now), `dateTraitement` (date, optionnel), `resolution` (text, optionnel).
- Index : `(type, statut)` pour l'anti-doublon ; `statut` pour le dashboard.

### 6.3 API / contraintes
- Route cron : vérification stricte du Bearer secret ; `runtime = 'nodejs'` ; pas de cache.
- Accès `alertes` : admin CRUD ; `benevole-bibliotheque` read+update (statut) pour ses retards ; prof read des alertes `decrochage` le concernant (via ses élèves) — affinage dans Spec 02.
- Le cron utilise la Local API (`getPayload`) avec `overrideAccess: true` (pas d'utilisateur).

## 7. Critères d'acceptation
- [ ] Un élève avec 3 absences sur ses 4 dernières séances attendues génère une alerte `decrochage`.
- [ ] Un élève avec 2 absences sur 4 ne génère rien ; 3 absences mais étalées sur 8 séances ne génère rien.
- [ ] Un prêt dépassé génère `retard-bibliotheque` ; un prêt à échéance J+1 génère `rappel-retour` ; un prêt rendu ne génère rien.
- [ ] Relancer le cron deux fois le même jour ne duplique aucune alerte.
- [ ] Le cron résout automatiquement le rappel d'un prêt rendu.
- [ ] La route sans le bon secret renvoie 401 ; avec le secret, renvoie le résumé JSON.
- [ ] Un admin peut faire évoluer les statuts et ajouter une résolution.
- [ ] Lint, typecheck, tests (détecteurs unitaires + route) passent.

## 8. Risques & questions ouvertes
- Définition « séances attendues » pour le décrochage : les 4 dernières séances du **groupe** de l'élève (pas toutes les séances de l'asso). À implémenter via le champ `groupe` de `seances` — vérifier la requête inverse (séances contenant l'élève dans l'array `groupe` ; sinon dénormaliser `groupeId` sur la séance).
- Emails (Resend) : à activer en v2 — la fonction `creerAlerteSiInexistante` est le point d'accroche prévu.
- Un élève absent longtemps (maladie) : le décrochage se déclenchera — c'est correct (l'asso doit le savoir, même si justifié), la résolution manuelle documente le cas.
- Heure du cron : 3h UTC = 5h Paris — ok ; ou passer en 1h UTC en hiver. Détail cosmétique.