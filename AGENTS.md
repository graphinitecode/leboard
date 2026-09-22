# LPV Board

Gestion d'une association de cours de soutien : élèves, séances, présences, progression, bibliothèque (prêts), plannings, alertes. Stack : Next.js + Payload CMS.

## Gitflow

Le projet suit strictement le gitflow :

- `main` — branche de production uniquement. Rien n'est commité ou poussé directement dessus.
- `develop` — branche d'intégration. Toutes les nouveautés y convergent.
- Chaque travail part d'une branche `feature/<nom>` créée depuis `develop`, puis est fusionné dans `develop` via Pull Request.
- Correctifs de production : branche `hotfix/<nom>` depuis `main`, fusionnée dans `main` ET `develop`.
- Releases : branche `release/<version>` depuis `develop`, fusionnée dans `main` et `develop` (tag sur `main`).
- Jamais de commit direct sur `main` ou `develop` (hors fusions de branches gitflow).

## Version (SemVer)

Le projet suit le versionnage sémantique `MAJOR.MINOR.PATCH` (0.x pendant le développement initial) :

- **MAJOR** : changement cassant (API, schéma de données sans migration compatible, suppression de fonctionnalité) → commit avec `!` ou footer `BREAKING CHANGE:`
- **MINOR** : nouvelle fonctionnalité rétrocompatible (ex. une spec implémentée)
- **PATCH** : correctif sans changement fonctionnel

Règles :

- Le numéro de version courant vit dans `package.json` (`"version"`).
- Une release passe par une branche `release/<version>` (ex. `release/0.2.0`) : bump de version + tag annoté `v<version>` sur `main` lors de la fusion.
- Conventional Commits alimentent la version : `fix` → PATCH, `feat` → MINOR, `feat`/`fix` avec `BREAKING CHANGE` (ou `!`) → MAJOR.
- Pendant 0.x (pré-1.0) : les breaking changes sont tolérés en MINOR ; à partir de 1.0.0, les breaking changes montent le MAJOR.
- Les tags : `git tag -a vX.Y.Z -m "Release vX.Y.Z"`, uniquement sur `main`.
- Chaque release est documentée par ses notes (GitHub Release ou `CHANGELOG.md`).

## Format des commits (obligatoire)

Chaque commit suit le format [Conventional Commits](https://www.conventionalcommits.org/) :

```
<type>(<portée>): <sujet>

<description>

<footer>
```

### Type (obligatoire)

| Type | Usage |
|------|-------|
| `feat` | Ajout d'une fonctionnalité |
| `fix` | Correction de bogue |
| `perf` | Amélioration des performances |
| `refactor` | Changement de code sans changement de comportement |
| `style` | Changement de style du code (sans changer la logique) |
| `test` | Modification des tests |
| `docs` | Documentation |
| `build` | Système de build (gulp, webpack, npm, etc.) |
| `ci` | Intégration continue (Travis, Circle, BrowserStack, SauceLabs, etc.) |
| `chore` | Tâches diverses ne rentrant pas dans les catégories ci-dessus (outillage, dépendances, processus) |

### Portée (optionnelle)

Partie de l'application/librairie affectée — `feat(reader): …`, `fix(strong): …`,
`docs(agent): …`. Sans portée : `docs: …`. Suivie d'un `:` puis d'une espace.

### Sujet

- Description **succincte** des changements.
- **Impératif présent** : « change », pas « changed » ni « changes ».
- **Pas de majuscule** au début.
- **Pas de point** à la fin.
- ≤ ~50 caractères idéalement.

### Description (corps)

- Détaille les **motivations** derrière le changement (le « pourquoi »), pas seulement le « quoi ».
- Mêmes règles que le sujet : impératif présent, pas de majuscule, pas de point à la fin de chaque
  ligne/paragraphe.
- Laisser une **ligne vide** entre le sujet et la description.

### Footer

- **Breaking Changes** : préfixer `BREAKING CHANGE:` puis l'explication. Le type peut aussi porter
  un `!` : `feat(api)!: …`.
- **Références** : `Closes #123`, `Refs #42`, `Fixes #7` (issues GitHub/GitLab).
- Laisser une **ligne vide** entre la description et le footer.

### Exemples

```
feat(reader): ajouter le mode focus

le mode focus masque la topbar et le dock tant que la touche Escape
n'est pas pressée, pour réduire les distractions pendant la lecture

Closes #14
```

```
fix(strong): gérer l'absence de code strong sur la version lsg

la concordance repliait vers un état vide quand le code strong etait
invalide ; on affiche maintenant un message explicite
```

```
docs(agent): formaliser le format des commits conventionnels

ajoute la section 10 a AGENT.md decrivant le format type(portee): sujet
plus description et footer, ainsi que les regles de typographie
```

> Les **commits de merge** Git Flow suivent un format libre :
> `Merge feature/<slug> into develop` (cf. §4 étape 4).

## Rédaction du CHANGELOG (obligatoire)

Le `CHANGELOG.md` est rendu **tel quel** sur la page publique `/nouveautes`. Il ne doit donc
contenir **que des changements perceptibles par l'utilisateur** — jamais d'information interne
ou de sécurité. La conformité est vérifiée par `pnpm changelog:check`
(skill `changelog-check`, cf. `.claude/skills/changelog-check/SKILL.md`).

### Ton : utilisateur uniquement

- Décrire **ce que voit l'utilisateur** (feature, UX, correctif visible), pas le « comment ».
- Un item se lit en une phrase, sans jargon d'implémentation.

### Contenu interdit (fuite d'information)

❌ Aucun de ces éléments ne doit apparaître dans une entrée changelog :

- **Crypto** : `PBKDF2`, `AES-GCM`, `SHA-256`, `256-bit`, `non-extractable`, `DEK`, `KEK`,
  `enveloppe`, `master key`, `nonce`, `ciphertext`.
- **DB / schéma** : `BYTEA`, `neon_auth`, `user_data`, `schéma public`, `ON CONFLICT`,
  `updated_at`, `FK`, `pg.Pool`, `pooler`.
- **API** : routes internes (`/api/sync`, `/api/account`, `GET/PUT/POST/DELETE /api…`).
- **Identifiants internes** : noms de fonctions (`upgradeLegacyToEnvelope`, `pushKind`…),
  clés `localStorage` (`bym:nav-history`, `bibleReaderPrefs`), mécanique sync (`LWW`,
  `meta[kind]`, `dated 0`).
- **Récit de bug interne** (postmortem) : « ne pousse plus », « était ignoré »… → reformuler
  en correctif utilisateur (« certaines données n'apparaissaient pas sur un second appareil ;
  corrigé »).
- **Provider / env** : `send.shemaproject.org`, `BETTER_AUTH_SECRET`, `DATABASE_URL`,
  `RESEND_API_KEY`, `baseURL dérivé`…
- **Références spec** : `spec 22`, `(spec 28)`… — un numéro de spec est un repère interne,
  jamais visible côté utilisateur.

✅ Sont **user-facing** et donc autorisés : « clé de récupération », « mot de passe »,
« synchronisation chiffrée », « compte facultatif », « concordance Strong »…

### Sections autorisées

`### Ajouté` · `### Modifié` · `### Corrigé` · `### Retiré` · `### Sécurisé` (+ alias EN
`Added`/`Changed`/`Fixed`/`Removed`/`Security`). Tout autre titre (`Processus`, `Architecture`,
`Fonctionnalités`, `… (spec NN)`, `Changements`, `Ajouts`, `Correctifs`) est **interdit**.

### SemVer vs contenu

Le bump doit refléter le contenu de la section (vérifié par `changelog:check`, règle S2) :

| Contenu de la section | Bump attendu |
|---|---|
| `Ajouté` (nouvelle feature) | `MINEUR` (ou `MAJEUR` si breaking) |
| seulement `Corrigé` | `CORRECTIF` |
| `Retiré` / `Sécurisé` / item breaking | `MAJEUR` |
| seulement `Modifié` (cosmétique) | `CORRECTIF` ou `MINEUR` |

### Boucle de travail

- À chaque merge de feature : ajouter l'item sous `## [Unreleased]` dans la bonne section.
- Lancer `pnpm changelog:check` avant de pousser sur `develop`.
- À la release (§5) : renommer `## [Unreleased]` en `## [X.Y.Z] : YYYY-MM-DD`, recréer un
  `## [Unreleased]` vide, puis `pnpm changelog:check` avant le tag.
- Exception historique figée (version déjà publiée non retaggable) : documentée dans
  `.changelog-allowlist.json` avec un `reason`.


## Workflow

- Après toute modification de code : lancer lint et typecheck.
- Ne jamais lire les fichiers `.env` — ils contiennent les secrets. Demander à l'utilisateur toute variable nécessaire.

## Atomic design (obligatoire)

Le design system suit l'[atomic design](https://atomicdesign.bradfrost.com/chapter-2/) — le nommage
est inspiré de [BEM + Atomic Design](https://www.lullabot.com/articles/bem-atomic-design-a-css-architecture-worth-loving).

### Nommage des fichiers et du code

- **Fichiers, classes, variables, props et types : TOUJOURS en anglais.** Pas de français dans
  l'identifiant (`a-button.tsx`, pas `Bouton.tsx` ; prop `label`, pas `libelle`).
- Les textes affichés à l'utilisateur restent en français (contenu UI), seuls les identifiants
  de code sont en anglais.

### Arborescence des composants

- `src/components/atoms/` — fichiers préfixés `a-` (ex. `a-button`, `a-label`, `a-tag`)
- `src/components/molecules/` — fichiers préfixés `m-` (ex. `m-modal`, `m-summary-list`)
- `src/components/organisms/` — fichiers préfixés `o-` (ex. `o-login-form`, `o-availability-list`)
- `templates` (`t-`) : non utilisés à ce jour ; si besoin, fichiers préfixés `t-`.
- Les organisms métier restent exportés par le barrel du module métier (`@/seances`, `@/planning`…)
  mais vivent physiquement dans `src/components/organisms/`.

### Classes CSS (convention BEM atomic)

- Préfixe de namespace `lpv-` conservé + couche atomique :
  `lpv-{a|m|o}-{block}__{element}--{modifier}` (ex. `lpv-a-button--danger`,
  `lpv-m-summary-list__row--no-actions`, `lpv-o-header__hero-title`).
- Les utilitaires (couleurs `lpv-blue`, typography `lpv-h1`, spacing `lpv-spacing-*`,
  layout `lpv-container`…) ne sont pas des composants : anglais simple, sans préfixe de couche.

### Tests

- `tests/int/*.int.spec.tsx` — nommage anglais aligné sur le composant (ex. `checkboxes.int.spec.tsx`).

## Payload CMS

La doc du projet est dans `.claude/skills/payload/` — commencer par `SKILL.md`, détails dans `reference/`.
