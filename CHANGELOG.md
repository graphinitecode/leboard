# Changelog

Tous les changements notables de LPV Board sont documentés ici.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le versionnage suit [SemVer](https://semver.org/lang/fr/) (0.x pendant le développement initial).

## [0.2.0] — 2026-09-19

Implémentation des 9 specs métier (voir `specs/`).

### Added
- **Collections cœur (Spec 01)** : `eleves`, `seances`, `presences` (collection séparée, unicité séance/élève, pré-création des présences à la création d'une séance) ; `users` avec rôles (admin/prof/bénévole-bibliothèque/parent).
- **Access control (Spec 02)** : règles par rôle sur toutes les collections métier, champs sensibles (parents, consentement) réservés à l'admin, parents bloqués du panel admin.
- **RGPD (Spec 09)** : consentement obligatoire (parent pour mineur, élève pour majeur), global `politique-rgpd` + page publique `/rgpd`, alerte de fin de rétention (3 ans après fin d'adhésion), export JSON d'un élève, anonymisation.
- **Progressions (Spec 03)** : catalogue de `competences`, suivi par élève (niveau acquis/en-cours/à revoir), dénormalisation profReferent/matiere, join fields sur la fiche élève.
- **Bibliothèque (Spec 04)** : `livres`, `exemplaires` (code auto LPV-000x), `prets` (dispo vérifiée, plafond 3 prêts/élève, dates par défaut +21 j).
- **Alertes (Spec 05)** : cron nocturne (`/api/cron/alertes`, Bearer `CRON_SECRET`, 3 h UTC) — décrochage (3 absences / 4 séances), retards bibliothèque, rappels J-2, résolutions automatiques.
- **Portail parents (Spec 06)** : `/parents` (login + résumé par enfant) et `/parents/enfants/[id]` (présences, retours, progressions, prêts) — lecture seule, périmètre vérifié côté serveur.
- **Planning (Spec 07)** : `creneaux` hebdomadaires, disponibilités des profs, génération idempotente des séances sur une période (`POST /api/planning/generer-seances`).
- **Rapports (Spec 08)** : `/rapports/[eleveId]` généré à la volée sur une période (trimestre par défaut), CSS print A4.

## [0.1.0] — 2026-09-19

### Added
- Initialisation du projet (template Payload website) avec gitflow, Conventional Commits, SemVer documentés dans `AGENTS.md`.
- 9 specs fonctionnelles dans `specs/` suivant `_TEMPLATE.md`.