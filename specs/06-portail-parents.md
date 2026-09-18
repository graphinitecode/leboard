# Spec 06 — Portail parents

> **Statut** : Proposé · **Priorité** : Moyenne · **Effort** : L · **Dépendances** : Spec 01, Spec 02, Spec 03, Spec 04

## 1. Objectif
Offrir aux parents un espace web simple, en lecture seule, où ils suivent les présences, retours de séance et progressions de leur(s) enfant(s) — sans accès à l'admin Payload ni aux données des autres élèves.

## 2. Valeur utilisateur
- Parents : visibilité rassurante et régulière sur le suivi de leur enfant, sans attendre un mail ou un coup de fil ; engagement renforcé.
- Association : réduction des échanges manuels (bilans demandés par les familles), image de sérieux pour les financeurs.
- Enfants : leurs parents voient le positif aussi (compétences acquises), pas seulement les absences.

## 3. Périmètre
- **Inclus** :
  - Front dédié (pages Next.js sous `/parents/*`), authentifié par le compte Payload du parent (rôle `parent`).
  - Vues : accueil (résumé par enfant), présence (historique + taux sur la période), retours de séance (richText rendu), progressions (timeline avec badges), prêts en cours.
  - Sécurité : l'API ne renvoie que les données des enfants liés au compte.
- **Exclu** (pour cette itération) :
  - Messagerie interne parent↔prof.
  - Édition par le parent de quelconque donnée (lecture seule totale).
  - Paiements/adhésion en ligne.
  - Application mobile (le web responsive suffit).

## 4. Spécification fonctionnelle

### 4.1 Authentification
- Le parent se connecte avec email + mot de passe (compte Payload `users` rôle `parent`, créé par l'admin — cf. Spec 01 ; réinitialisation de mot de passe via le flux `forgot-password` de Payload).
- Le rôle `parent` n'a pas accès à l'admin Payload (Spec 02) : le portail est la seule interface.
- Session via le cookie Payload (`payload-token`) — les routes serveur vérifient le rôle.

### 4.2 Contenu exposé (par enfant du parent)
1. **Résumé** : taux de présence sur la période en cours (trimestre), dernière progression, prêts en cours avec dates de retour.
2. **Présences** : liste des séances passées (date, matière, présent/absent) — absences justifiées signalées comme telles.
3. **Retours de séance** : le champ `retour` des séances du groupe de l'enfant, rendu (lexical → HTML), les plus récents d'abord.
4. **Progressions** : timeline (date, matière, compétence, niveau) — lecture seule.
5. **Prêts** : ouverts d'abord (avec date de retour prévue), puis historique récent.

### 4.3 Règles d'accès et de confidentialité
- Un parent ne voit **que** ses enfants : vérification serveur systématique (parent ∈ `eleve.parents`) sur chaque requête — jamais côté client.
- Les retours de séance sont partagés au niveau du groupe : tous les parents des élèves du groupe lisent les retours de ces séances. Si un prof veut un retour confidentiel, il utilise le `commentaire` d'une progression (non exposée au parent... sauf que les progressions SONT exposées — décision : les progressions avec commentaire sont exposées telles quelles, le prof est informé que tout ce qu'il saisit est visible par la famille ; micro-copy dans le formulaire de saisie).
- Données masquées : coordonnées des autres élèves, plannings internes, alertes, catalogues.
- RGPD : lien vers la politique de données (Spec 09).

### 4.4 Événements notifiables (futur)
- Nouveau retour de séance, nouvelle absence → email hebdomadaire récapitulatif (hors v1, voir Spec 05 pour l'infrastructure d'envoi).

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
- URL : `/parents` (redirige vers `/parents/login` si non connecté).
- Déclencheurs d'usage : après une séance (voir le retour), avant un bilan (revoir les progressions).

### 5.2 Disposition (wireframe)
```
/parents (accueil)                        Mobile
┌─────────────────────────────────┐      ┌──────────────┐
│ Bonjour Marie                   │      │ ☰  LPV       │
│ ── Léa (4e) ──────────────────  │      │ Léa (4e)     │
│ Présence 86% · 12/14 séances    │      │ Présence 86% │
│ Dernier retour (12/09) : …      │      │ 2 prêts en   │
│ 2 prêts en cours (retour 25/09) │      │ cours ›      │
│ [Voir le détail]                │      └──────────────┘
└─────────────────────────────────┘
/parents/enfants/[id] : onglets Présences · Retours · Progressions · Prêts
```
- Un enfant seul → navigation directe sur sa fiche ; plusieurs enfants → onglets/switcher.

### 5.3 États & interactions
- États : chargement (skeleton), vide (« Aucun retour de séance pour le moment »), erreur (message + réessayer).
- Aucune donnée sensible exposée à la modification : pas de bouton d'édition.

### 5.4 Responsive
- Mobile-first : les parents consulteront surtout depuis leur téléphone.

### 5.5 Thème clair/sombre & accessibilité
- Suit le thème système ; contrastes AA ; tailles de texte lisibles (16px min) ; navigation clavier complète.

### 5.6 Micro-copy (FR)
- « Présence de Léa », « Absence justifiée », « Retour prévu le 25 septembre ».
- « Vous voyez ici uniquement les informations concernant votre enfant. »

## 6. Spécification technique

### 6.1 Fichiers (nouveaux / modifiés)
- Nouveaux : `src/app/(parents)/parents/layout.tsx`, `page.tsx`, `enfants/[id]/page.tsx`, routes API `src/app/api/parents/…` (ou server components lisant la Local API — préféré : server components + `payload` local, avec vérification du parent dans la requête elle-même).
- Nouveau : `src/access/parentPortal.ts` (helpers de périmètre), middleware de rôle.
- Modifié : `middleware.ts` (protection `/parents/*`).

### 6.2 Données & persistance
- Aucune nouvelle collection. Lectures via Local API avec Where clauses bornant au parent (pas d'`overrideAccess`) pour hériter des règles Spec 02 ; exception : lecture du `retour` de séance via une requête `seances` élargie — à couvrir par une access function dédiée côté API du portail.
- Caching : revalidate on-demand inutile en v1 (données consultées avec fraîcheur acceptable) ; simple `no-store`.

### 6.3 API / contraintes
- Toute route vérifie : session valide + rôle `parent` + parent de l'élève demandé. En cas d'échec : 403 sans détail.
- Performance : volumes minuscules (1 famille = 1–3 enfants), pas d'optimisation requise.

## 7. Critères d'acceptation
- [ ] Un parent se connecte via `/parents` et voit le résumé de chacun de ses enfants.
- [ ] Il voit présences, retours (HTML rendu), progressions et prêts de ses enfants uniquement.
- [ ] Accéder à l'URL d'un autre enfant (ID deviné) renvoie 403.
- [ ] Le rôle `parent` n'accède pas à l'admin Payload.
- [ ] Un prof ou un admin n'a pas de vue portail (ils ont l'admin) — ou une page d'information le disant.
- [ ] Reset de mot de passe fonctionne (flux Payload).
- [ ] Lighthouse mobile ≥ 90 (perf/accessibilité) sur `/parents`.
- [ ] Lint, typecheck, tests (accès + rendu) passent.

## 8. Risques & questions ouvertes
- Confidentialité des retours de séance partagés au groupe : valider avec l'asso (alternative : retours privés par élève → champ `retoursIndividuels` array par élève ; plus de travail de saisie pour les profs).
- Création des comptes parents : par l'admin (bulk, avec email d'invitation) — à couvrir par une spec « invitations » si le volume le justifie ; en v1, création manuelle + mot de passe transmis par l'asso.
- Mot de passe initial transmis par mail/papier = risque faible mais réel ; prévoir l'obligation de changement à la première connexion ? (à décider — Payload ne le fait pas nativement).
- Les bénévoles profs ont-ils aussi un intérêt au portail ? Non : ils ont l'admin filtré (Spec 02).