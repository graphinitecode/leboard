# Specs — LPV Board

Les specs suivent le template `specs/_TEMPLATE.md`. Chaque spec est implémentée sur une branche `feature/<nom>` fusionnée dans `develop` (voir gitflow dans `AGENTS.md`).

## Ordre d'implémentation suggéré

| # | Spec | Priorité | Dépendances | Statut |
|---|---|---|---|---|
| 01 | [Collections cœur (Users rôles, Eleves, Seances, Presences)](01-collections-coeur.md) | Haute | — | Proposé |
| 02 | [Access control par rôle](02-access-control.md) | Haute | 01 | Proposé |
| 09 | [RGPD (consentement, rétention)](09-rgpd.md) | Haute | 01, 02 | Proposé |
| 03 | [Suivi de progression](03-progressions.md) | Haute | 01, 02 | Proposé |
| 04 | [Bibliothèque (Livres, Prets)](04-bibliotheque.md) | Haute | 01, 02 | Proposé |
| 05 | [Alertes + cron](05-alertes-cron.md) | Haute | 01, 02, 04 | Proposé |
| 06 | [Portail parents](06-portail-parents.md) | Moyenne | 01–04 | Proposé |
| 07 | [Planning bénévoles/profs](07-planning.md) | Moyenne | 01, 02 | Proposé |
| 08 | [Rapports périodiques](08-rapports.md) | Moyenne | 01, 03, 04 | Proposé |

Le RGPD (09) est placé tôt : les champs de consentement et de rétention doivent exister dès la première mise en production, pas rétrofités plus tard.