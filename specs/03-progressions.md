# Spec 03 — Suivi de progression

> **Statut** : Proposé · **Priorité** : Haute · **Effort** : M · **Dépendances** : Spec 01, Spec 02

## 1. Objectif
Permettre aux profs de consigner, séance après séance, les compétences travaillées par chaque élève et leur évolution (acquis / en cours / à revoir), pour garder le fil entre deux séances — même si le bénévole change — et disposer d'un historique longitudinal exploitable en bilan.

## 2. Valeur utilisateur
- Continuité pédagogique : un nouveau bénévole reprend le contexte en quelques minutes (historique par élève, pas juste le dernier retour).
- Vision longitudinale pour le bilan annuel avec les parents et pour les dossiers de subvention.
- Valorise le travail des profs : leurs observations deviennent traçables et réutilisables.

## 3. Périmètre
- **Inclus** :
  - Collection `progressions` : eleve, seance (optionnel), matiere, competence, niveau (acquis/en-cours/a-revoir), commentaire, date.
  - Catalogue de compétences par matière (collection `competences` simple : label, matiere, niveau scolaire) pour éviter le texte libre incohérent.
  - Vue « fiche élève » dans l'admin : timeline des progressions d'un élève (list view filtrée, groupée par date).
  - Saisie rapide depuis une séance : le prof ajoute une progression par élève pendant/après la séance.
- **Exclu** (pour cette itération) :
  - Statistiques agrégées / graphiques d'évolution (rapports, Spec 08).
  - Exposition aux parents (Spec 06).

## 4. Spécification fonctionnelle

### 4.1 Enregistrement de progression
- Champs obligatoires : `eleve`, `competence` (relation → `competences`), `niveau` (select : `acquis` / `en-cours` / `a-revoir`), `matiere` (dérivé de la compétence), `date` (défaut : aujourd'hui).
- Optionnel : `seance` (relation — si saisie dans le contexte d'une séance), `commentaire` (texte court, ex. « maîtrise la division à deux chiffres mais confond still/already »).
- Une progression peut être créée sans séance (bilan de mi-période, point hors séance).
- Le champ `niveau` est re-saisissable : la même compétence peut apparaître plusieurs fois dans le temps (c'est l'historique qui fait la valeur).

### 4.2 Catalogue de compétences
- `competences` : `label` (text), `matiere` (select, même liste que seances), `cycle` (select : cycle 2/3/4 ou CP→3e) — liste gérée par l'admin, semée avec ~40 compétences de base (lecture, écriture, calcul, anglais).
- Un prof peut suggérer une compétence hors catalogue ? Non en v1 : le label texte libre est un champ `commentaire`, la compétence reste dans le catalogue (évite le fourre-tout). L'admin peut enrichir la liste à tout moment.

### 4.3 Règles
- Un `prof` crée/édite une progression seulement pour ses élèves (référent ou élèves d'une séance à lui) — cf. Spec 02.
- La compétence doit être cohérente avec la matière de la séance si `seance` est renseignée (avertissement, pas de blocage — un prof de maths peut noter un point de français vu en séance).
- Suppression : autorisée admin seulement ; un prof peut corriger mais pas effacer l'historique (traçabilité).

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
- Sidebar admin → groupe `Association` → `Progressions`, `Competences`.
- Déclencheur principal : depuis une séance (vue détail), bouton/section « Progressions de la séance » ; ou directement depuis la fiche élève.

### 5.2 Disposition (wireframe)
```
Fiche élève (admin)                        [Séance du 12/09 — Maths]
┌───────────────────────────────────────┐  ┌─────────────────────────────┐
│ Élève : Léa Martin (4e)               │  │ Progressions séance         │
│ ── Progressions ──────────────────    │  │ ▸ Léa M.   « Division »     │
│ 12/09 · Maths · Division    [acquis]  │  │            en-cours ▾       │
│ 05/09 · Maths · Tables      [acquis]  │  │ ▸ Karim B. « Decimaux »     │
│ 28/08 · Maths · Decimaux    [à revoir]│  │            à revoir ▾       │
└───────────────────────────────────────┘  └─────────────────────────────┘
```
- Liste `progressions` filtrable par eleve, matiere, niveau, période.

### 5.3 États & interactions
- Sélection d'une compétence : dropdown filtré par matière d'abord (réduit la liste).
- Badge couleur par niveau : acquis (vert), en-cours (orange), à revoir (rouge).

### 5.4 Responsive
Admin Payload natif.

### 5.5 Thème clair/sombre & accessibilité
- Badges ne reposant pas que sur la couleur (icône ou libellé inclus).

### 5.6 Micro-copy (FR)
- « Nouvelle progression », « Niveau : Acquis / En cours / À revoir ».
- Avertissement cohérence : « Cette compétence n'appartient pas à la matière de la séance. »

## 6. Spécification technique

### 6.1 Fichiers (nouveaux / modifiés)
- Nouveaux : `src/collections/Progressions/index.ts`, `src/collections/Competences/index.ts`, access dans `src/access/progressions.ts`.
- Modifiés : `src/payload.config.ts` (ajout collections), éventuellement composant admin léger pour le champ relation filtré.

### 6.2 Données & persistance
- `progressions` : index sur (eleve, date) pour la timeline ; `seance` nullable.
- `matiere` stocké sur la progression (copié de la compétence au `beforeChange`) pour requêter sans join.

### 6.3 API / contraintes
- Requête typique : `progressions` où `eleve = X` trié `-date` (rapports Spec 08, portail Spec 06) — la collection séparée rend ça trivial (même argument que pour `presences`).
- Volume : ~1–3 progressions par élève par séance → quelques milliers par an, sans impact.

## 7. Critères d'acceptation
- [ ] Un prof crée une progression liée à une séance, avec compétence filtrée par matière et niveau.
- [ ] Un prof ne peut pas créer une progression pour un élève qui n'est pas le sien (403).
- [ ] La fiche élève affiche l'historique des progressions trié par date décroissante.
- [ ] L'admin peut gérer le catalogue de compétences (CRUD).
- [ ] Un bénévole bibliothèque n'a accès ni à `progressions` ni à `competences`.
- [ ] Lint, typecheck et tests int passent ; test d'accès couvrant les 4 rôles.

## 8. Risques & questions ouvertes
- Le catalogue de compétences initial doit être rédigé avec l'asso (qui connaît les programmes utilisés) — proposer une seed éditable.
- Voulez-vous une vision par **groupe** (ex. « 60 % des élèves du groupe Maths-3e ont acquis les décimaux ») ? Utile mais repoussé aux rapports (Spec 08).
- Format du commentaire : texte court vs richText — texte court suffisant, un richText alourdit la saisie mobile.