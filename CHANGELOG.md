# Changelog

Tous les changements notables de LPV Board sont documentés ici.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le versionnage suit [SemVer](https://semver.org/lang/fr/) (0.x pendant le développement initial).

## [Unreleased]

### Modifié
- Header du site : logo large légèrement réduit
- Panneau d'administration : icône de recherche remplacée par la loupe du design system
- Header du site : logo large avec la mention « Association Les Pierres Vivantes »
- Menu dépliant des portails : vraies icônes chevron au lieu des caractères triangles
- Mode sombre : fond du portail bleu plus profond, contraste amélioré pour l'entête et le panneau de menu
- Header et pied de page du site aux couleurs de l'association : logo LPV, navigation et liens éditables depuis le panneau d'administration (globaux header et footer)
- Déconnexion des portails : navigation via le routeur Next.js (sans rechargement forcé)

## [0.3.0] — 2026-09-20

### Ajouté
- Composants de design system inspirés de GOV.UK : Accordéon, Fil d'Ariane, Cases à cocher (avec révélation conditionnelle), Champ date, Compteur de caractères, Détails (disclosure), Ensemble de champs (fieldset), Onglets, Liste de tâches, Pagination, Boutons radio (avec révélation conditionnelle), Tableau, Téléversement (file upload), Texte d'avertissement
- Label et légende avec tailles (l/m/s) et option `isPageHeading` (guide GOV.UK « Making labels and legends headings »)
- Message d'erreur avec préfixe lecteur d'écran « Erreur : »
- Utilitaire `lpv-visually-hidden` pour l'accessibilité
- Page design system (/design-system) : démonstration visuelle de tous les composants
- Modale : composant réutilisable accessible (Escape, clic extérieur, focus, aria-modal)
- Toast : composant réutilisable auto-dismiss (5s, role=status)
- Mode sombre : bouton de bascule dans l'entête des portails, choix mémorisé, couleurs adaptées au contraste sur fond sombre
- Icônes vectorielles dans toute l'interface (avertissement, chevrons, flèches, œil du mot de passe) avec la bibliothèque rivet-icons et boxicons pour le thème
- Champ mot de passe : bouton œil pour afficher/masquer la saisie
- Cases à cocher et boutons radio avec style dédié (surbrillance au survol, coche/point blanc à la sélection)
- Nouvelles couleurs de marque : tags (vert #00A14C, orange #FF6B00, rouge #FF0004, bleu #0080FF), panel info (fond bleu nuit, texte bleu clair), bannière de succès (fond vert foncé)
- Page design system : démonstration du summary list avec actions par ligne (Modifier ; Ajouter | Modifier | Supprimer séparées par un trait vertical ; valeur manquante en lien « Renseigner… »)

### Modifié
- Icône d'avertissement agrandie (32px, version circulaire pleine) plus visible dans les encadrés d'alerte
- Tags en style doux : texte coloré sur fond subtil avec bordure gauche assortie (fond éclairci et texte assombri en mode clair, fond assombri et texte éclairci en mode sombre)
- Tags sans arrondi (rectangulaires) et trois nouvelles couleurs : violet, magenta et sarcelle
- Pagination repensée (motif GOV.UK) : la page courante est un bloc plein inversé non cliquable marqué « (page actuelle) » pour les lecteurs d'écran, « Précédent », les numéros et « Suivant » sont alignés sur une même ligne, « Précédent » disparaît en première page et « Suivant » en dernière page
- En mode sombre, les boutons reprennent les couleurs des tags : primaire bleu #0080FF, « Modifier » orange #FF6B00, danger rouge #FF0004 (texte blanc). En mode clair, les boutons, tags, panel et bannière de succès conservent leurs couleurs d'origine ; ils prennent les couleurs de marque en mode sombre
- Fiche élève (profs) : alertes en TexteAvertissement, présences et progressions en Tableau accessible
- Fiche enfant (parents) : présences, progressions et prêts en Tableau accessible ; ajout d'un lien retour
- Assistant disponibilités : champs horaires via ChampFormulaire (label, hint, min/max), liens retour via BackLink
- Tableau : ajout de la prop `contenu` (ReactNode) dans les cellules pour afficher des composants (Tag)
- ChampFormulaire : ajout des props `min` et `max`
- BackLink : ajout de la prop `onClick`, styles en classe CSS `lpv-back-link`
- FormulairesDispo : modale et toast extraits en composants réutilisables (Modale, Toast)

### Corrigé
- Résumé d'erreurs des formulaires : marges resserrées, titre moins gras, liens plus lisibles (rouges en mode sombre, survol en couleur du texte en mode clair)
- Cases à cocher et boutons radio restaurés à leur apparence native (44px)
- Texte des tags et bannières blanc en mode sombre (sauf « En attente » : texte foncé)
- Chevrons agrandis (24px) et flèches (20px), centrés avec leurs libellés
- Page design system : démonstration du champ mot de passe avec bouton œil

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