# Spec 10d — Portail profs : disponibilités (planning)

> **Statut** : Accepté · **Priorité** : Moyenne · **Effort** : S · **Dépendances** : Spec 10, Spec 07

## 1. Objectif
Permettre au prof de déclarer et maintenir lui-même ses disponibilités hebdomadaires, source du planning de l'association (Spec 07) — sans passer par l'admin.

## 2. Valeur utilisateur
- Les disponibilités changent au rythme des emplois du temps (rentrée, examens) : l'auto-service évite les allers-retours avec le coordinateur.
- Le coordinateur planifie avec des données fraîches, sans double-saisie.

## 3. Périmètre
- **Inclus** :
  - Liste de ses disponibilités (jour, plage horaire), triée par jour puis heure.
  - Ajout d'une disponibilité (jour select + plage HH:mm).
  - Suppression immédiate (bouton ✕ par ligne).
- **Exclu** : exceptions ponctuelles (« absent le 12/10 »), vue calendrier graphique, édition des créneaux attribués (admin).

## 4. Spécification fonctionnelle
- Une disponibilité = { jour (lundi→samedi), heureDebut, heureFin (HH:mm) }.
- Ajout : formulaire en ligne ; à la soumission, le tableau `disponibilites` du user est re-sauvegardé avec l'entrée en plus.
- Suppression : re-sauvegarde du tableau sans la ligne d'index donnée.
- Avertissement (hors v1) : si un créneau attribué à ce prof n'est plus couvert après suppression, l'admin peut le voir dans l'admin (badge Spec 07) — pas de blocage côté portail.
- Accès : le prof n'édite que **son propre** document (`users[id = user]`, access rules Spec 02).

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
- Lien « Mes disponibilités » en haut du dashboard (Spec 10a). Usage : début de trimestre, changement d'emploi du temps.

### 5.2 Disposition (wireframe)
```
┌──────────────────────────────────────┐
│ ← Tableau de bord                    │
│ Mes disponibilités                   │
│ (créneaux hebdo utilisés pour le     │
│  planning de l'association)          │
│ ───────────────────────────────────  │
│ Mercredi · 17:30 → 19:00        [✕]  │
│ Samedi  · 10:00 → 12:00         [✕]  │
│ ── Ajouter ────────────────────────  │
│ Jour ▾   De [17:30]   À [19:00] [+]  │
└──────────────────────────────────────┘
```

### 5.3 États & interactions
- Après ajout : formulaire réinitialisé + « Disponibilité ajoutée ».
- Suppression : bouton ✕ devient « … » pendant l'opération ; la ligne disparaît.
- Erreur : message « Échec de l'enregistrement. » inline.

### 5.4 Responsive
Formulaire en ligne (flex-wrap) sur mobile.

### 5.5 Thème & accessibilité
Bouton ✕ avec `aria-label` explicite.

### 5.6 Micro-copy (FR)
- « Créneaux hebdomadaires où vous êtes disponible. »
- « Disponibilité ajoutée », « Échec de l'enregistrement. », « Aucune disponibilité déclarée. »

## 6. Spécification technique
### 6.1 Fichiers
- `src/app/(frontend)/profs/disponibilites/page.tsx` (server), `FormDispo.tsx` (client), `actions.ts` (ajouterDisponibilite, supprimerDisponibilite)

### 6.2 Données
- Lecture : `users[id = user]` (depth 0).
- Écriture : `update users` du tableau `disponibilites` complet (array simple Payload).
- Pattern lecture-modification-écriture : acceptable pour un user seul ; un verrou n'est pas nécessaire.

### 6.3 API / contraintes
- `overrideAccess: false` + user attaché (chacun peut éditer son profil, Spec 02).
- Requête findByID intermédiaire en `overrideAccess: true` pour composer le tableau — le user de l'action est déjà authentifié et n'édite que lui-même.

## 7. Critères d'acceptation
- [x] Ajouter une dispo apparaît dans la liste triée.
- [x] Supprimer la bonne ligne (index) — pas une autre.
- [x] Un prof ne peut pas modifier les disponibilités d'un autre (update borné à soi).
- [x] Les disponibilités alimentent le planning admin (Spec 07).

## 8. Risques & questions ouvertes
- Le pattern index-based delete est vulnérable aux courses concurrentes (2 onglets) — risque faible (mono-utilisateur, petites données) ; une refonte par ID de row est facile si besoin.
- Exceptions ponctuelles : à couvrir par une future spec (global `calendrier` Spec 07, question ouverte).