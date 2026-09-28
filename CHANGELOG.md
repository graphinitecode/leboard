# Changelog

Tous les changements notables de LPV Board sont documentés ici.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le versionnage suit [SemVer](https://semver.org/lang/fr/) (0.x pendant le développement initial).

## [Unreleased]

### Ajouté
- Fiche élève repensée : compteurs en tête (taux de présence, alerte active, dernière séance), encadré latéral « Informations » (niveau, groupe, prof référent, ancienneté) avec rappel de confidentialité RGPD, et progressions en cartes colorées (vert = acquis, jaune = en cours, rouge = à revoir) à la place du tableau
- Bibliothèque : filtre du catalogue par niveau (Primaire, Collège, Lycée) à côté de la recherche, et confirmation visuelle après l'enregistrement d'un prêt

## [0.6.0] — 2026-09-28

### Ajouté
- Page « Bibliothèque » dans le portail profs : compteurs (catalogue, prêts en cours, retards), recherche dans le catalogue, liste des retards avec marquage « retourné », rappels de retour à venir, enregistrement d'un prêt « une question par écran » (élève puis exemplaire) et référencement d'un nouveau livre en 2 questions ; accès aussi ouvert aux bénévoles bibliothèque via la connexion du portail
- Page « Mes élèves » pour les profs : liste des élèves dont vous êtes référent, avec niveau et groupe, et accès direct à chaque fiche (le lien du tableau de bord fonctionnait mais la page n'existait pas)
- Page « Mon profil » pour les profs et les parents : modification de vos nom, prénom et numéro de téléphone depuis le portail, avec confirmation visuelle après enregistrement ; le lien se trouve dans le menu du portail
- Profils utilisateurs avec prénom et nom séparés : saisie claire à la création des comptes (profs, parents, bénévoles) dans le panneau d'administration, affichage « Prénom Nom » partout
- Création des élèves facilitée dans le panneau d'administration : instructions intégrées expliquant de créer d'abord le compte parent (rôle « Parent ») avant de relier l'élève, et rappel de la règle de consentement RGPD

### Modifié
- Tableau de bord des profs : salutation avec le prénom du compte
- Créneaux de disponibilité : l'ajout et la modification se font maintenant sur une page dédiée « une question par écran », à la place du formulaire incrusté dans la liste ; retour à la liste avec confirmation après enregistrement
- Parcours d'ajout (nouvelle séance et disponibilités) : espacement harmonisé entre le lien de retour, la question et les boutons, aligné sur le modèle des pages-question ; avertissement de conflit d'horaire plus visible à l'étape de vérification
- Titres : taille adaptée à l'écran (plus lisibles en mobile), alignés sur l'échelle typographique GOV.UK — nouvelle page Typographie dans le design system
- Bascule de thème : nouveau mode « suivre la machine » (icône d'écran) qui applique automatiquement le thème du système et suit ses changements en temps réel ; le cycle machine → clair → sombre remplace l'ancienne bascule à deux états
- Liens de contenu (liens inline, fil d'Ariane, lien de retour, actions des résumés) : affichage en violet lorsqu'ils ont déjà été visités, dans les thèmes clair et sombre
- Tableau de bord des profs : le calendrier de la semaine remplace les listes « Aujourd'hui » et « Cette semaine »
- Assistant de disponibilités : parcours « une question par écran » à pleine page avec récapitulatif « Vos réponses », dans la continuité du design system
- Tableau de bord des profs entièrement repensé : salutation personnelle, compteurs clés (séances de la semaine, retours en attente, alertes actives), listes « À traiter » et « Séances à venir » avec accès direct aux séances, historique des séances passées en dépliant, mini-calendrier du mois avec détail des séances au clic, alertes de décrochage sur les élèves et accès rapides dans une colonne latérale
- Page « Calendrier » dédiée pour les profs : le calendrier hebdomadaire interactif (déplacement et création de séances) quitte le tableau de bord pour sa propre page, accessible depuis le menu du portail
- Carte calendrier mensuel : vue compacte d'un mois avec marqueurs colorés par catégorie (pastille ou carré, palette des tags), légende intégrée, jour courant en surbrillance et détail du jour au clic ; démonstration dans le design system
- Calendrier hebdomadaire pour les profs : vue agenda de la semaine avec pastilles de séances positionnées sur une grille jour × heure, navigation entre semaines, déplacement d'une séance par glisser-déposer et création par clic sur une case libre
- Assistant de création de séance « une question par écran » (jour, heure de début, heure de fin, matière, élèves) avec sélection de la plage au clic-tirer sur le calendrier et bouton « + Nouvelle séance »
- Vues du calendrier : Semaine, Jour (automatique en mobile) et Liste condensée, avec mini-calendrier mensuel pour sauter à une date éloignée
- Calendrier de la semaine sur la fiche enfant côté parents (lecture seule)
- Couche Templates du design system : pages portail, fiche détail, tableau de bord, formulaire centré et pages-question assemblées par slots, avec section vitrine sur la page design system
- Bouton « Succès » : nouvelle variante verte pour valider une action (dans le design system)
- SummaryList : nouvelle variante sans séparateurs (prop `dividers={false}`) pour empiler les rows sans bordures, dans le design system
- Page « Couleurs » dans le design system : palette complète (couleurs fonctionnelles, groupes de marque, tags, neutres) avec swatches qui suivent le thème actif et note de contraste WCAG
- Boutons pleine largeur en mobile et focus textuel harmonisé sur les liens (entête, navigation, listes) ; lien de retour et accordéons affinés (chevrons)

### Corrigé
- Présences pré-remplies à la création d'une séance : les feuilles de présence de chaque élève du groupe sont maintenant générées automatiquement (elles devaient être créées une à une)

## [Unreleased]

## [0.5.0] — 2026-09-21

### Ajouté
- Architecture de l'application réorganisée en modules métier (authentification, élèves, séances, progressions, planning, bibliothèque, rapports) : les écrans des portails gagnent en fiabilité (chargements explicites, messages d'erreur clairs)

### Modifié
- Résumé d'erreurs : fond rosé dédié (mode clair et sombre) qui détache le bloc du reste de la page, et fond « retour à faire » des avertissements plus lisible
- Actions des listes : liens « Modifier / Ajouter » en bleu avec soulignement renforcé au survol (le rouge reste réservé à « Supprimer »)
- Texte d'avertissement : rendu plus léger et plus lisible (graisse intermédiaire au lieu du gras marqué)
- Fil d'Ariane : séparateur chevron régulièrement espacé dans tous les thèmes
- Mode sombre : bouton secondaire avec ombre mieux détachée du fond

## [0.4.0] — 2026-09-21

### Ajouté
- Navigation du site : liens déroulants (menus avec sous-liens en liste verticale) et bouton de recherche, le tout pilotable depuis le panneau d'administration (global header)

### Modifié
- Design system affiné : espacements et soulignements harmonisés sur tout le site, onglets redessinés (fond clair, soulignement, ligne de séparation), chevron de l'accordéon réduit et cerclé, fil d'Ariane avec séparateur chevron, libellés de formulaire plus grands, page courante de la pagination et messages d'erreur plus lisibles en mode sombre
- Boutons du site (hero, encadrés d'appel à l'action, formulaire de contact, page 404) aux couleurs et styles du design system, y compris en mode sombre
- Mode sombre : liens de navigation et entête du site toujours en blanc sur la couleur du portail (lisibles et cliquables dans les deux thèmes)
- Navigation du site : liens en gras, page courante en graisse plus forte sans soulignement permanent
- Navigation du site : liens avec corps et cibles tactiles du design system, focus au clavier visible
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
- Assistant disponibilités : champs horaires via Input (label, hint, min/max), liens retour via BackLink
- Tableau : ajout de la prop `contenu` (ReactNode) dans les cellules pour afficher des composants (Tag)
- Input : ajout des props `min` et `max`
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
