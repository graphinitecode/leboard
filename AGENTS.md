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

## Commits (Conventional Commits)

Format obligatoire : `<type>(<scope>): titre`

- Types : `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `ci`, `build`
- Le scope est court et en anglais (ex. `collections`, `access`, `alerts`, `biblio`, `planning`, `reports`)
- Titre : impératif, court, sans point final, en anglais (ex. `feat(collections): add presences collection`)
- Un corps facultatif peut détailler le pourquoi (séparé du titre par une ligne vide)
- Optionnel : footer `Refs: <issue>` ; pour les changements cassants, `BREAKING CHANGE:` dans le corps

Exemples :

```
feat(collections): add seances and presences collections
fix(alerts): dedupe open alerts in cron job
docs: describe gitflow and commit conventions
```

## Workflow

- Après toute modification de code : lancer lint et typecheck.
- Ne jamais lire les fichiers `.env` — ils contiennent les secrets. Demander à l'utilisateur toute variable nécessaire.

## Payload CMS

La doc du projet est dans `.claude/skills/payload/` — commencer par `SKILL.md`, détails dans `reference/`.