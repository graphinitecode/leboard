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