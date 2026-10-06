# Changelog

Tous les changements notables de LPV Board sont documentés ici.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le versionnage suit [SemVer](https://semver.org/lang/fr/) (0.x pendant le développement initial).

## [Unreleased]

### Ajouté
- Une séance peut se répéter chaque semaine ou chaque mois (même jour de semaine, par exemple « le 2e mardi »), sans fin ou jusqu'à une date : toutes les séances sont créées d'un coup et apparaissent dans le calendrier.
- Une icône signale les séances récurrentes dans le calendrier : colorée quand la série n'a pas de fin, atténuée quand elle s'arrête à une date.
- Déplacer, changer la durée ou supprimer une séance récurrente propose de l'appliquer à cette séance seulement, à celle-ci et aux suivantes, ou à toute la série ; les séances passées ne sont jamais modifiées.

### Modifié
- L'entête des portails est réorganisé : les rubriques (tableau de bord, calendrier, élèves, bibliothèque, disponibilités) s'affichent en onglets, et un seul menu, celui du compte, regroupe « Mon profil », le choix du thème et la déconnexion. Sur mobile, ce menu reprend aussi les rubriques.
- Le logo ramène à l'accueil du portail, la déconnexion renvoie à la page de connexion du portail, et le pied de page ne propose plus que « Protection des données » (les liens en double ou sans objet ont été retirés).
- Sur téléphone, le calendrier s'ouvre en vue jour aussi dans l'espace parents, comme côté professeurs.
- Le calendrier occupe toute la largeur de la page, et des lignes en pointillés marquent chaque heure pour viser plus facilement un créneau.
- Chaque séance du calendrier affiche son horaire et sa durée ; côté professeurs, la poignée en bas d'une séance permet de l'allonger ou de la raccourcir par pas de 30 minutes.
- Les cours se terminent au plus tard à 18h : le calendrier s'arrête à 18h, et une séance ou une disponibilité qui finirait plus tard est refusée avec un message (création, déplacement, changement de durée).

### Corrigé
- Dans la vue jour du calendrier, « Jour suivant » et « Jour précédent » partent du jour affiché (et non plus du lundi).
- Le dimanche est un jour de cours comme les autres : il apparaît dans le calendrier (une séance du dimanche n'était pas visible) et peut être choisi pour une disponibilité.
- Dans le calendrier des professeurs, les séances peuvent de nouveau être ouvertes d'un clic ou déplacées par glisser-déposer : les cases de création les recouvraient.
- Déposer une séance après un glisser-déposer n'ouvre plus la page d'ajout d'une séance.

## [0.12.0] — 2026-10-04

### Ajouté
- Fiche livre : une couverture facultative désignée par son adresse web (l'image n'est pas stockée sur le site), affichée à côté du résumé quand il existe, sinon sur la carte « Informations », et modifiable à tout moment.
- La suppression d'un livre a sa propre page d'avertissement : les conséquences sont expliquées avant le geste (l'historique des emprunts est conservé et le livre sort du catalogue ; un prêt en cours n'est pas annulé), avec un bouton rouge de confirmation et une annulation neutre.
- Le catalogue de la bibliothèque s'affiche par pages de 10 livres, avec une pagination standard (numéros, ellipses, « Précédent » / « Suivant ») qui respecte la recherche et le filtre par niveau.

### Modifié
- Les vides donnent plus d'infos : partout dans le portail (fiche d'un élève, catalogue, recherche sans résultat, séances, disponibilités, prêts), un bloc lisible avec pictogramme remplace la simple mention « Aucun… », avec parfois une action directe (réinitialiser les filtres, ajouter un premier créneau).
- L'import CSV de livres a sa page dédiée : sélection du fichier, résumé des contrôles en compteurs, aperçu paginé (15 lignes par page) filtrable par statut (toutes, prêtes, à préciser, erreurs), puis choix des lignes à importer une à une : chaque ligne importable est cochée d'avance et se décoche à volonté (« tout sélectionner » / « tout désélectionner » inclus), les lignes en erreur restent non importables (une explication dédiée s'affiche quand un fichier est déjà intégralement au catalogue) ; barre de progression pendant le versement (livre en cours affiché) et bilan final lisible : succès en panneau + table de lignes ignorées, « réimporter ensuite sans re-créer les livres déjà ajoutés ».
- L'historique de présence d'un élève se retrie en cliquant sur les entêtes du tableau : un clic sur « Date » inverse la chronologie, et le tri peut se faire par matière ou par statut (absences regroupées en tête). Idem sur la version consultée par les parents.
- Les niveaux et catégories des CSV sont compris même écrits fin (« CP », « CE1 », « 6ème », « Terminale ») : alias vers les paliers du site quand c'est sans ambiguïté ; valeur inconnue = livre importé sans cette information, à préciser sur la fiche. Le résumé du livre est pris en compte (7ᵉ colonne, facultative), visible dans l'aperçu, et un résumé contenant des « ; » non quotés est signalé au lieu de décaler silencieusement les colonnes.
- L'ajout d'un livre refuse les doublons : même ISBN ou même titre et auteur déjà au catalogue est signalé dès la saisie et la création est bloquée, avec un lien direct pour ajouter des exemplaires sur la fiche existante. Un même titre avec un ISBN différent (édition distincte) déclenche un simple avertissement.
- La modification d'un livre reprend la mise en page d'« Ajouter un livre » : un seul formulaire pré-rempli, enregistrement sans encart de confirmation, résumé des erreurs en tête, et choix du nombre d'exemplaires avec un rappel visible des exemplaires actuellement prêtés (impossible de descendre en dessous).

### Corrigé
- Sur la fiche d'un élève, l'historique de présence se lit du plus récent au plus ancien : l'ordre ne suit plus la date de saisie, qui pouvait différer de la date de la séance (pareil sur la fiche consultée par les parents).
- Le réimport d'un livre précédemment retiré du catalogue était refusé comme doublon : corrigé — retiré un livre libère sa fiche et son ISBN, un réimport suivant le recrée normalement.
- Les listes déroulantes des formulaires réaffichent la valeur enregistrée du livre (niveau conseillé, catégorie) lors de la modification.
- L'ajout d'un livre au catalogue refonctionne : le livre était créé sans ses exemplaires, ce qui faisait échouer l'enregistrement.

## [0.11.0] — 2026-10-02

### Ajouté
- Une page « Compléter la séance » rassemble le passage de l’appel (présent, absent, absent justifié — élève par élève) et la rédaction du retour de séance, avec une confirmation avant l’enregistrement ; une fois le retour écrit, elle devient « Modifier la séance ».
- La fiche de séance liste les notes de progression prises pendant la séance, avec le niveau observé (acquis, en cours, à revoir) et le commentaire pour la famille.

### Modifié
- La fiche d’une séance se présente désormais comme les autres fiches : titre, matière, date, heure et prof en entête, compteurs de présences et d’absences, retour de séance affiché en lecture simple, et un tableau des présences avec les élèves numérotés et leur statut en pastille colorée.

### Corrigé
- Un élève ajouté à une séance déjà créée reçoit sa présence dès l’enregistrement : il apparaissait « non initialisé » — impossible de comptabiliser son statut ni de le modifier.

## [0.10.0] — 2026-09-30

### Ajouté
- Page « Ajouter un livre » repensée en un seul écran : pré-remplissage à l'aide de l'ISBN, choix du nombre d'exemplaires (codes attribués automatiquement) et récapitulatif de succès.
- Import en masse de livres depuis un fichier CSV : une ligne par livre, aperçu des lignes détectées avec leurs erreurs éventuelles, puis compte des livres ajoutés.
- Niveaux conseillés enrichis (Maternelle, CP – CE2, CM1 – CM2) et nouvelles catégories d'ouvrages (Roman jeunesse, Conte et fable, Bande dessinée, Documentaire, Dictionnaire / Encyclopédie), proposées à l'ajout, sur la fiche livre et dans le panneau d'administration.

### Modifié
- Fiche livre : les boutons d'actions parlent plus clairement — « Prêter ce livre », « Signaler un retour » et « Modifier la fiche du livre ».
- La bascule du thème du portail est désormais un sélecteur à trois segments (machine, clair, sombre) reconnaissable à ses icônes.
- La bibliothèque affiche ses statistiques (catalogue, prêts en cours, retards) avec la grille standard du tableau de bord.
- Calendrier du tableau de bord : les jours des mois voisins complètent la grille avec leur numéro grisé et le panneau du jour cliqué reprend les couleurs de la pastille associée (l'inversion suit le mode clair/sombre) ; la légende ne liste plus que les catégories effectivement visibles dans le mois.
- Récapitulatif de l'assistant de prêt : chaque livre choisi est précédé d'une puce carrée et le nombre de livres est affiché.
- Assistant « nouvelle séance » : le récapitulatif devient une sixième étape et chaque question retrouve son lien de retour.
- Fiche livre : la carte « Informations » adopte la nouvelle carte à bandeau coloré.
- Nouvelle mise en page du parcours « mot de passe oublié » : écran de confirmation après l'envoi du lien, résumé des erreurs en tête de formulaire et liens de retour adaptés au portail (profs ou parents).
- Assistant « nouvelle séance » : les élèves se choisissent via une boîte de recherche (prénom ou nom, sélection multiple, retrait facile) au lieu des cases à cocher, les questions sont plus naturelles et la durée choisie s'affiche en toutes lettres (par exemple « une demi-heure »).
- L'encadré de confirmation s'affiche à nouveau sur fond bleu, avec une bordure basse en dessous.

### Corrigé
- Le panneau « Prêt enregistré » de l'assistant de prêt ne commence plus par un caractère parasite.
- Les assistants en questions (nouveau prêt, nouvelle séance…) affichent une colonne de largeur constante, quel que soit le libellé de la question.

## [0.9.0] — 2026-09-29

### Ajouté
- L'enregistrement d'un prêt se fait en 4 questions : recherche de l'élève, choix de plusieurs livres, date de retour puis récapitulatif avant validation.
- La recherche accepte prénom, nom, titre, auteur ou ISBN, sans se soucier des accents ni de la casse.
- Un avertissement signale les livres en retard d'un élève dès qu'il est choisi, sans bloquer le prêt.
- Un écran de confirmation récapitule le prêt enregistré et propose d'en enregistrer un autre.
- Page « Mes élèves » repensée : compteurs (élèves suivis, présence moyenne, élèves à surveiller), barre de recherche avec filtres par groupe et par statut, tableau des élèves (présence en %, rouge sous 75 %, statut de suivi) avec pagination par pages de 10 (liens Précédent et Suivant) et encadré latéral « À surveiller » reprenant les alertes de décrochage avec accès direct aux fiches
- Page « Mes élèves » : colonne « Actions » avec un lien « Voir » pour ouvrir la fiche de chaque élève
- Fiche livre : le nom de l'élève emprunteur est cliquable dans l'historique des emprunts et mène à sa fiche (le lien « Retour » de la fiche élève ramène ensuite au livre)

### Modifié
- Page « Mes élèves » : la première colonne du tableau s'intitule « Noms & Prénoms » et les noms ne sont plus cliquables — l'accès à la fiche passe par le lien « Voir » de la colonne « Actions »
- Fiche livre : la note « les exemplaires physiques se gèrent dans le panneau d'administration » est intégrée à l'encadré « Informations » au lieu de flotter sous la colonne latérale
- Fiche livre sans résumé : le message indique clairement que le livre n'a pas encore de résumé, et les gérants de la bibliothèque peuvent cliquer sur « Ajouter un résumé » pour le renseigner directement
- Portail : les écritures sensibles demandent une confirmation avant l'enregistrement — retour de séance (visible par les parents), création d'une séance, création et modification d'un livre, suppression d'une disponibilité (fenêtre de confirmation unifiée, bouton Annuler systématique)
- Le panneau d'information s'affiche sans fond coloré en thème clair et avec un texte plus ample ; il garde son fond bleu nuit en thème sombre

### Sécurisé
- Bibliothèque : les actions patrimoniales — marquer un prêt comme retourné et enregistrer un nouveau prêt — demandent maintenant une confirmation avec le mot de passe du compte connecté (fenêtre dédiée, mot de passe revérifié par le serveur avant l'écriture), pour éviter qu'une personne de passage ne valide à la place du gestionnaire connecté

## [0.8.0] — 2026-09-28

### Ajouté
- Fiche livre repensée dans le portail : compteurs (niveau conseillé, exemplaires disponibles, retard en cours), résumé de l'ouvrage, historique complet des emprunts en tableau et encadrés latéraux (actions, retard, informations) — les actions d'enregistrement de prêt et de retour ne s'affichent que pour ceux qui gèrent la bibliothèque
- Édition de la fiche d'un livre directement depuis le portail (titre, auteur, ISBN, niveau, catégorie, éditeur, résumé), réservée aux gestionnaires de la bibliothèque
- Référencement d'un livre : le résumé peut être saisi lors de la création, en troisième étape de l'assistant
- Le résumé des livres est éditable dans le panneau d'administration
- Bibliothèque : barre de recherche pleine largeur sous les compteurs (recherche, filtre de niveau et bouton « Enregistrer un prêt »), retards en lignes d'action à bordure rouge, encadrés latéraux à bordure haute (rappels bleus sans avertissement, « Ajouter un livre ») au lieu des panneaux bleus
- Bibliothèque : la ligne sous le titre décrit maintenant la page (gestion du catalogue, prêts et retards) au lieu de répéter le nombre d'ouvrages, déjà affiché dans les compteurs

### Corrigé
- Catalogue de la bibliothèque : le tableau s'étend maintenant sur toute la largeur de la colonne (espacement des colonnes lisible, comme le modèle) au lieu d'être compacté sur une portion d'écran ; titre du livre en gras et lien « Voir » souligné comme les autres actions de l'interface (Modifier, Supprimer) — les liens du même type dans les formulaires de connexion et de profil sont aussi corrigés

## [0.7.0] — 2026-09-28

### Ajouté
- Réinitialisation du mot de passe depuis le site : nouvelle page publique « Mot de passe oublié » (depuis le lien sous le formulaire de connexion) et page « Nouveau mot de passe » accessible depuis le lien reçu par e-mail, sans passer par le panneau d'administration
- Invitation automatique des parents : à la création d'un compte parent, un e-mail leur permet de choisir leur mot de passe via un lien sécurisé
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
