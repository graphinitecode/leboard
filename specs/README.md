# Specs — LPV Board

Les specs suivent le template `specs/_TEMPLATE.md`. Chaque spec est implémentée sur une branche `feature/<nom>` fusionnée dans `develop` (voir gitflow dans `AGENTS.md`).

## Ordre d'implémentation suggéré

| # | Spec | Priorité | Dépendances | Statut |
|---|---|---|---|---|
| 01 | [Collections cœur (Users rôles, Eleves, Seances, Presences)](01-collections-coeur.md) | Haute | — | Implémenté |
| 02 | [Access control par rôle](02-access-control.md) | Haute | 01 | Implémenté |
| 09 | [RGPD (consentement, rétention)](09-rgpd.md) | Haute | 01, 02 | Implémenté |
| 03 | [Suivi de progression](03-progressions.md) | Haute | 01, 02 | Implémenté |
| 04 | [Bibliothèque (Livres, Prets)](04-bibliotheque.md) | Haute | 01, 02 | Implémenté |
| 05 | [Alertes + cron](05-alertes-cron.md) | Haute | 01, 02, 04 | Implémenté |
| 06 | [Portail parents](06-portail-parents.md) | Moyenne | 01–04 | Implémenté |
| 07 | [Planning bénévoles/profs](07-planning.md) | Moyenne | 01, 02 | Implémenté |
| 08 | [Rapports périodiques](08-rapports.md) | Moyenne | 01, 03, 04 | Implémenté |
| 10 | [Portail profs](10-portail-profs.md) | Haute | 01, 02, 03, 07 | Implémenté |
| 11 | [Design system : couche Templates](11-design-system-templates.md) | Moyenne | 10 | En cours |
| 12 | [Calendrier hebdomadaire avec pastilles](12-calendrier-hebdomadaire.md) | Moyenne | 01, 02, 07, 10 | Implémenté |
| 13 | [Calendrier : vues multiples et assistant de création](13-calendrier-vues-et-assistant.md) | Moyenne | 12 | Implémenté |
| 14 | [Type scale responsive des titres](14-type-scale.md) | Moyenne | 11 | Implémenté |
| 15 | [Séances récurrentes](15-seances-recurrentes.md) | Haute | 01, 10, 12, 13 | Implémenté |

## Portail profs (découpage)

| Partie | Spec | Statut |
|---|---|---|
| Connexion + tableau de bord | [10a-portail-profs-dashboard.md](10a-portail-profs-dashboard.md) | Implémenté |
| Détail séance (présences, retour, progressions) | [10b-portail-profs-seance.md](10b-portail-profs-seance.md) | Implémenté |
| Fiche élève (historiques + alertes) | [10c-portail-profs-fiche-eleve.md](10c-portail-profs-fiche-eleve.md) | Implémenté |
| Disponibilités (planning) | [10d-portail-profs-disponibilites.md](10d-portail-profs-disponibilites.md) | Implémenté |

Le RGPD (09) est placé tôt : les champs de consentement et de rétention doivent exister dès la première mise en production, pas rétrofités plus tard.