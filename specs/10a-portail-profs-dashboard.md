# Spec 10a — Portail profs : connexion + tableau de bord

> **Statut** : Accepté · **Priorité** : Haute · **Effort** : S · **Dépendances** : Spec 10, Spec 02

## 1. Objectif
Donner au prof une porte d'entrée unique : se connecter et voir d'emblée ce qu'il doit faire aujourd'hui.

## 2. Valeur utilisateur
- Zéro friction : la première chose vue est « ai-je une séance aujourd'hui ? ».
- Le badge « retour à faire » rend visible le travail en retard (compte-rendus de séances passées non saisis).

## 3. Périmètre
- **Inclus** :
  - `/profs/login` : formulaire email + mot de passe (POST `/api/users/login`, cookie `payload-token`).
  - Gate `requireProf()` : rôle `prof` ou `admin`, sinon redirect `/profs/login`.
  - `/profs` : tableau de bord avec sections Aujourd'hui / Cette semaine / Passées récentes / Mes élèves.
  - Badge « ⏳ Retour à faire » sur toute séance dont le champ `retour` est vide.
- **Exclu** : inscription en libre-service (les comptes sont créés par l'admin), 2FA.

## 4. Spécification fonctionnelle
- Auth : le système natif de Payload (session JWT, reset de mot de passe, verrouillage après échecs) — rien de réinventé.
- Le dashboard liste les séances où `prof = user` sur une fenêtre glissante (7 derniers jours → 30 prochains jours), triées par date.
- Découpage : « Aujourd'hui » (date du jour), « Cette semaine » (à venir après aujourd'hui), « Passées récentes » (7 derniers jours).
- « Mes élèves » : les élèves dont le prof est `profReferent`, avec lien vers la fiche (10c).
- Un `parent` ou une session anonyme accédant à `/profs` est redirigé vers `/profs/login`.

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
- URL `/profs` — la page d'accueil du portail prof. Usage typique : ouverture 15 min avant la séance, sur mobile.

### 5.2 Disposition (wireframe)
```
┌──────────────────────────────────────┐
│ Tableau de bord     [Mes dispos]     │
│ ── Aujourd'hui ───────────────────── │
│ ▸ 17:30 · Maths            ⏳ retour │
│ ── Cette semaine ─────────────────── │
│ ▸ Mer 24/09 14:00 · Français         │
│ ── Passées récentes ──────────────── │
│ ▸ Mardi 23/09 · Maths      ⏳ retour │
│ ── Mes élèves (12) ───────────────── │
│ ▸ Léa Martin (4e)                    │
└──────────────────────────────────────┘
```

### 5.3 États & interactions
- Séance sans retour passée → badge orange ; avec retour → rien.
- Chaque item est un lien vers `/profs/seances/[id]`.

### 5.4 Responsive
Mobile-first : liste verticale, liens larges (tap ≥ 44 px).

### 5.5 Thème & accessibilité
Contrastes AA ; libellés explicites ; navigation clavier possible.

### 5.6 Micro-copy (FR)
- « Aucune séance aujourd'hui. », « Rien d'autre cette semaine. »
- « ⏳ Retour à faire », « Mes élèves », « Mes disponibilités ».

## 6. Spécification technique
### 6.1 Fichiers
- `src/utilities/profAuth.ts` (getMeUserServer, requireProf)
- `src/app/(frontend)/profs/login/page.tsx`, `LoginForm.tsx`
- `src/app/(frontend)/profs/page.tsx`

### 6.2 Données
- Aucune écriture. Lectures : `seances` (where prof = user, date >= -7j, depth 1), `eleves` (where profReferent = user).

### 6.3 API / contraintes
- Local API avec `overrideAccess: false` + `user` attaché — double sécurité (Where + access rules).

## 7. Critères d'acceptation
- [x] Login valide → dashboard ; invalide → message « Email ou mot de passe incorrect. »
- [x] Les séances d'un autre prof n'apparaissent jamais.
- [x] Une séance passée sans retour porte le badge.
- [x] Un parent est redirigé vers le login.

## 8. Risques & questions ouvertes
- Fenêtre « passées récentes » : 7 jours fixes en v1 ; un onglet « tout l'historique » est un facile follow-up.