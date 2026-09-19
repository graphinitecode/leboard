# Spec 10b — Portail profs : détail séance (présences, retour, progressions)

> **Statut** : Accepté · **Priorité** : Haute · **Effort** : M · **Dépendances** : Spec 10, Spec 01, Spec 03

## 1. Objectif
Concentrer sur un seul écran tout ce que le prof fait après le cours : pointer les absents, écrire le retour, noter les compétences travaillées — en moins de deux minutes, souvent sur mobile.

## 2. Valeur utilisateur
- C'est l'écran le plus utilisé du produit : chaque frictions économisée est multipliée par le nombre de séances hebdo.
- Tout est persisté au fil de l'eau : pas de formulaire unique à valider, pas de perte en cas d'interruption.

## 3. Périmètre
- **Inclus** :
  - Prise de présence par élève du groupe, **un tap** : boutons P / A / J (présent, absent, absent justifié).
  - Retour de séance : textarea simple, sauvegardée dans le champ lexical `retour`.
  - Ajout de progression : élève + compétence + niveau + commentaire, sans quitter la page.
- **Exclu** : création/suppression de séances, modification de la composition du groupe (admin), édition des progressions passées (correction via l'admin).

## 4. Spécification fonctionnelle
- Les présences sont pré-créées « présent » à la création de la séance (Spec 01) : le prof ne fait que décocher les absents.
- Toggle : trois boutons segmentés ; l'état actif est coloré (vert P, orange J, rouge A). Tap sur un autre statut → sauvegarde immédiate (server action) + rechargement léger de l'état.
- Retour : texte libre multiligne ; à l'enregistrement, conversion texte → lexical et `update` de la séance ; le retour devient visible dans le portail parents (Spec 06) et le dashboard (disparition du badge).
- Progression : formulaire replié (« + Ajouter une progression ») ; champs élève (groupe de la séance), compétence (catalogue complet), niveau, commentaire facultatif (micro-copy : visible par la famille). À l'enregistrement : `create` sur `progressions` avec lien `seance` — le hook Spec 03 dénormalise `profReferent` et `matiere`.
- Accès : la requête séance passe par les access rules (`overrideAccess: false`) — la séance d'un autre prof retourne 404.

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
- Depuis le dashboard, tap sur une séance. Usage dominant : les 60 minutes suivant la séance.

### 5.2 Disposition (wireframe)
```
┌──────────────────────────────────────┐
│ ← Tableau de bord                    │
│ Mardi 23/09 · Maths                  │
│ ── Présences ──────────────────────  │
│ Léa Martin        [ P ][ A ][ J ]    │
│ Karim B.          [ P ][•A ][ J ]    │
│ (nom élève → lien vers fiche 10c)    │
│ ── Retour de séance ───────────────  │
│ [ textarea ..................... ]   │
│ [Enregistrer le retour]   Enregistré │
│ ── Progressions ───────────────────  │
│ [+ Ajouter une progression]          │
│   Élève ▾  Compétence ▾  Niveau ▾    │
│   Commentaire ___________  [OK]      │
└──────────────────────────────────────┘
```

### 5.3 États & interactions
- Tap sur un statut déjà actif : no-op (pas d'appel réseau).
- Pendant la sauvegarde : boutons désactivés (opacity 0.6) ; échec → alerte « Échec de l'enregistrement. »
- Retour : bouton « Enregistrer le retour » → « Enregistré » inline.

### 5.4 Responsive
Mobile-first : chaque ligne élève occupe toute la largeur ; cibles ≥ 44 px.

### 5.5 Thème & accessibilité
- `aria-pressed` sur chaque bouton du toggle ; `aria-label` par élève ; focus visible.

### 5.6 Micro-copy (FR)
- « Présence de {élève} » (aria), « Présence non initialisée » (cas dégénéré).
- « Enregistré », « Échec de l'enregistrement. »
- « Observation courte (visible par la famille) ».

## 6. Spécification technique
### 6.1 Fichiers
- `src/app/(frontend)/profs/seances/[id]/page.tsx` (server component)
- `actions.ts` (changerPresence, enregistrerRetour, ajouterProgression)
- `TogglePresence.tsx`, `Formulaires.tsx` (client)

### 6.2 Données
- Lecture : `presences` (where seance = id), `eleves` (groupe de la séance, overrideAccess true car déjà vérifié par la séance), `competences` (sort label).
- Écritures : `update presences` (statut), `update seances` (retour), `create progressions` (date = now).
- Texte → lexical : `texteVersLexical()` (un paragraphe, segments de texte).

### 6.3 API / contraintes
- Toutes les écritures : Local API `overrideAccess: false` + `user` → les access rules Spec 02 décident.
- `revalidatePath` sur la page séance après mutation.

## 7. Critères d'acceptation
- [x] Un tap change le statut et survit à un rechargement.
- [x] Le retour enregistré apparaît dans l'admin Payload et le portail parents.
- [x] Une progression créée depuis la séance porte `seance` + `matiere` dénormalisée.
- [x] La séance d'un autre prof → 404.

## 8. Risques & questions ouvertes
- Le `window.location.reload()` après toggle est volontairement simple ; une optimisation (state local) est possible si la latence gêne.
- Le champ retour en textarea écrase le lexical existant au format simple — acceptable car seul ce portail l'édite en v1.