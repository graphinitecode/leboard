# Spec 04 — Bibliothèque : Livres et Prêts

> **Statut** : Proposé · **Priorité** : Haute · **Effort** : M · **Dépendances** : Spec 01, Spec 02

## 1. Objectif
Gérer le catalogue de livres de l'association et les prêts aux élèves : savoir en un coup d'œil ce qui est disponible, qui a quoi, et ce qui est en retard — pour éviter les livres perdus et les recherches physiques inutiles.

## 2. Valeur utilisateur
- Bénévoles bibliothèque : catalogue fiable en temps réel, historique par enfant, alertes de retard automatiques (détection en Spec 05).
- Parents/enfants : visibilité de ce qui a été emprunté et de la date de retour (via portail, Spec 06).
- Association : moins de pertes matérielles (coût réel), meilleure rotation du stock.

## 3. Périmètre
- **Inclus** :
  - Collection `livres` : titre, auteur, ISBN, niveau scolaire, categorie, nombre d'exemplaires.
  - Collection `exemplaires` : un enregistrement par copie physique (code exemplaire, état) — indispensable pour prêter une copie précise, pas « le titre ».
  - Collection `prets` : exemplaire, eleve, dates (emprunt, retour prévue, retour effective), statut.
  - Règles de disponibilité : un exemplaire est disponible si aucun prêt ouvert dessus.
  - Historique des prêts par livre et par élève (list view filtrée).
- **Exclu** (pour cette itération) :
  - Import/export CSV du catalogue (peut valoir un spec plus tard), codes-barres/scanner.
  - Alertes de retard et rappels (Spec 05).
  - Réservations en ligne par les familles.

## 4. Spécification fonctionnelle

### 4.1 Catalogue
- `livres` : `titre` (obligatoire), `auteur`, `isbn` (optionnel, validation format 10/13 chiffres), `niveau` (select CP→Terminale), `categorie` (select : `lecture`, `methodologie`, `anglais`, `manuel`, `autre`), `editeur`, `exemplaires` (relation one-to-many → `exemplaires` ; le nombre se déduit des copies, plus de champ number redondant).
- `exemplaires` : `livre` (relation), `code` (text unique — ex. « LPV-0001 »), `etat` (select : `neuf` / `bon` / `use` / `hs`), `commentaire`.
- Suppression d'un livre : bloquée s'il existe des prêts (ouverts ou historisés) — préserver l'historique ; proposer de marquer `hs`/retiré du catalogue à la place (`archived: true`).

### 4.2 Prêt
- Création d'un prêt : bénévole choisit l'élève, le livre (→ l'UI liste les exemplaires disponibles), la date de retour prévue (défaut : +21 jours, modifiable).
- Contrôles à la création (hooks `beforeChange`) :
  1. L'exemplaire doit être disponible (aucun prêt ouvert) — sinon erreur « Cet exemplaire est déjà emprunté ».
  2. L'exemplaire ne doit pas être `hs`.
  3. Un élève peut avoir plusieurs prêts ouverts (plafond : 3 — configurable) — au-delà, erreur « Limite de prêts atteinte pour cet élève ».
- Retour : le bénévole renseigne `dateRetourEffective` (défaut : aujourd'hui) → le prêt passe à `rendu`. La disponibilité de l'exemplaire est recalculée (aucun champ `statut` stocké sur `exemplaires` : il se déduit des prêts, source unique de vérité).
- `enRetard` : **pas un champ stocké**, mais calculé à la volée (`dateRetourPrevue < now && !dateRetourEffective`) pour l'affichage, et matérialisé par les alertes (Spec 05).

### 4.3 Statuts d'un prêt
| Statut | Définition |
|---|---|
| `ouvert` | prêt en cours, retour non dépassé |
| `en-retard` | ouvert et `dateRetourPrevue` dépassée (calculé) |
| `rendu` | `dateRetourEffective` renseignée |
- Le statut `ouvert/en-retard` est toujours dérivé ; seule la présence de `dateRetourEffective` fait foi.

### 4.4 Historique
- Par élève : tous ses prêts, ouverts d'abord.
- Par exemplaire : qui l'a emprunté, quand, avec l'état constaté au retour (champ `etatRetour` optionnel sur `prets`).

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
- Sidebar → groupe `Bibliothèque` : `Livres`, `Exemplaires`, `Prets`.
- Déclencheurs : retour d'un enfant avec un livre (le bénévole crée le prêt), retour du livre (il clôt le prêt).

### 5.2 Disposition (wireframe)
```
Catalogue (liste livres)
┌───────────────────────────────────────────────────────┐
│ Titre              Niveau   Catégorie   Dispo        │
│ Le Petit Prince    5e       lecture     2/3          │
│ Sésamath 4e        4e       manuel      0/2  ⚠       │
└───────────────────────────────────────────────────────┘
Détail livre → liste exemplaires (code, état, dispo) + bouton « Prêter »
Prêt (form) : Élève ▾  Exemplaire ▾(dispos)  Retour prévu [date+21j]
```

### 5.3 États & interactions
- Filtre rapide « Disponibles seulement » sur la liste exemplaires.
- Le select d'exemplaire dans le form de prêt n'offre que les copies disponibles (filterOptions).
- Badge « en retard » rouge sur les listes.

### 5.4 Responsive
Admin natif ; le bénévole peut opérer depuis une tablette le soir.

### 5.5 Thème clair/sombre & accessibilité
Badges avec libellé (pas que la couleur) ; champs date au format FR (jj/mm/aaaa).

### 5.6 Micro-copy (FR)
- « Cet exemplaire est déjà emprunté. »
- « Limite de prêts simultanés atteinte pour cet élève. »
- « Retour enregistré le {date}. »
- « Impossible de supprimer : ce livre a un historique de prêts. »

## 6. Spécification technique

### 6.1 Fichiers (nouveaux / modifiés)
- Nouveaux : `src/collections/Livres/index.ts`, `src/collections/Exemplaires/index.ts`, `src/collections/Prets/index.ts`, hooks `src/hooks/prets/` (validation disponibilité, plafond, défauts de dates), access `src/access/biblio.ts`.
- Modifiés : `payload.config.ts`.

### 6.2 Données & persistance
- Index : `prets(exemplaire)` filtré ouvert pour la dispo ; `prets(eleve)`, `exemplaires.code` unique.
- La disponibilité d'un exemplaire = requête `prets` où `exemplaire = X && dateRetourEffective = null`. Pour la list view des livres, un champ virtuel `exemplairesDisponibles` (calculé) évite le N+1 dans l'UI (à valider côté Payload : champ `virtual` ou read hook).

### 6.3 API / contraintes
- Les accès (Spec 02) : `benevole-bibliotheque` CRUD complet sur les 3 collections ; `prof` lecture seule ; `parent` lecture des prêts de ses enfants (Spec 06).
- Le cron (Spec 05) requête les prêts ouverts — la structure avec `dateRetourEffective` le rend trivial.

## 7. Critères d'acceptation
- [ ] Créer un livre avec 3 exemplaires codés (auto-générés « LPV-000x ») fonctionne.
- [ ] Un prêt ne peut pas être créé sur un exemplaire déjà emprunté (message FR).
- [ ] Un prêt ne peut pas être créé si l'élève a déjà 3 prêts ouverts.
- [ ] Enregistrer un retour (dateRetourEffective) rend l'exemplaire disponible et change le badge du prêt.
- [ ] Un exemplaire `hs` n'apparaît pas dans le sélecteur de prêt.
- [ ] Supprimer un livre avec historique est refusé avec le message prévu.
- [ ] Le catalogue affiche la dispo exacte (n/total) cohérente avec les prêts.
- [ ] Lint, typecheck, tests (hooks de validation) passent.

## 8. Risques & questions ouvertes
- Génération du code exemplaire : auto (« LP-0001 ») ou manuel (étiquette pré-imprimée) ? Proposer auto + édition possible.
- Faut-il lier le prêt à une séance (le livre sort pendant une séance) ? En v1 : non, le prêt est indépendant — plus souple.
- Pénalité/amende de retard : hors périmètre (gestion associative, pas une médiathèque).
- L'état `hs` d'un exemplaire en cours de prêt : interdire le retour `hs` sans commentaire ? Simple : autoriser avec commentaire obligatoire.