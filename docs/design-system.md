# Design system LPV Board

Contrat de conception pour les portails LPV Board. La référence d'inspiration est le
[GOV.UK Design System](https://design-system.service.gov.uk/) pour sa **philosophie de
conception** : structure des pages, construction des formulaires, patterns de parcours,
microcopy, accessibilité. L'habillage visuel (couleurs, arrondis, cards) est une adaptation
de marque LPV assumée et ne cherche pas la fidélité pixel.

## 1. Principes adoptés

### 1.1 Une chose par page

Chaque page a **un seul objectif**. Un `h1` unique qui décrit ce que fait la page
(« Mes disponibilités », pas « Bienvenue sur votre espace »). Si une page en fait deux,
c'est deux pages.

- Une seule **action primaire** par page, alignée au bord gauche du formulaire (GOV.UK)
  — *exception LPV assumée : les actions de stepper sont alignées à droite, le « Modifier »
  reste à gauche via `lpv-stepper__actions`*.
- Les actions secondaires sont des boutons secondaires, pas des liens déguisés.

### 1.2 Questions, pas champs

Un formulaire demande **une question à la fois** quand le volume le justifie
(assistant d'ajout de disponibilité : jour → début → fin → récap). Pour les formulaires
courts (connexion), un formulaire classique sur une page est préférable.

- Label **au-dessus** du champ, gras.
- Hint **sous le label**, texte muted (pas dans un placeholder).
- Erreur **au-dessus du champ**, en rouge, précédée de « Erreur : » si le libellé s'y prête.
- Champs en ligne uniquement quand les éléments forment **une seule donnée**
  (jour + heure de début + heure de fin d'un même créneau).

### 1.3 Error summary avec liens

Le résumé d'erreurs en haut du formulaire :
- `role="alert"`, prend le focus quand il apparaît,
- chaque item est un **lien cliquable** qui déplace le focus sur le champ en erreur
  (convention GOV.UK `govuk-error-summary`),
- les liens pointent vers les `id` des champs.

### 1.4 Summary list (pattern GOV.UK)

Structure par row : `dt.__key` / `dd.__value` / `dd.__actions` (optionnel).

- Les actions de row sont des **liens stylés sans gras** (couleur portail, soulignés),
  jamais des boutons pleins ; le rouge (`lpv-action--danger`) est **réservé à l'action
  destructive** de la row (ex. « Supprimer »).
- Plusieurs actions par row : `ul.__actions-list > li.__actions-list-item`, séparées par
  un **trait vertical**.
- Les rows sans action portent le modifier `__row--no-actions` (bordures correctes).
- Un lien « Modifier » doit **pré-remplir** les valeurs déjà saisies.
- Le summary-list présente des infos clé/valeur — les données tabulaires vont dans un
  `<table>`, les listes simples dans `ul/ol` (règle GOV.UK « when not to use »).
- L'info manquante se présente comme un lien dans la colonne *value*
  (« Renseigner… »), pas comme une action « Modifier » sur une valeur vide.

### 1.5 Pages de questions (pattern GOV.UK « Question pages »)

**Implémenté par le template `QuestionPage`** (`src/components/templates/t-question-page.tsx`,
classe `lpv-t-question-page`) — toute page (ou étape d'assistant) qui pose une question suit le
pattern [Question pages](https://design-system.service.gov.uk/patterns/question-pages/) :

1. **Back link** en haut — toujours (« ← Retour ») ; rassure les utilisateurs méfiants
   envers le bouton retour du navigateur, sans le remplacer
2. **Heading = la question** : le h1 de l'écran est la question elle-même
   (« Quel jour vous convient ? »), jamais un titre de section générique
3. **Bouton « Continuer »** — libellé « Continuer », jamais « Suivant » ; aligné à gauche
4. Une question par écran
5. **Progress indicator** discret si besoin : caption « Étape 2 sur 3 » au-dessus du
   heading (jamais un stepper qui montre tout + navigue)
6. Hint court, une phrase, sans point final ; jamais de lien dans un hint
7. **« Vos réponses »** : les réponses déjà données s'affichent sous les questions suivantes,
   avec un lien « Modifier » par ligne (`QuestionPageAnswers`)

### 1.6 Parcours de confirmation

Pour toute action à conséquence :

1. **Start** — bouton d'appel (« + Ajouter »)
2. **Étapes** — une question par écran, bouton « Suivant »
3. **Check answers** — récapitulatif avant validation, avec un moyen de **modifier**
   (bouton orange `lpv-bouton--avertissement`)
4. **Confirmation** — feedback immédiat (toast `lpv-toast`, `role="status"`)

### 1.7 Actions destructives

- Jamais de suppression immédiate : **étape de confirmation obligatoire**
  (modale `lpv-modale`, `role="dialog"`, focus piégé de fait sur le bouton principal,
  Escape / clic extérieur = annuler).
- Le bouton de confirmation est **rouge** (`lpv-bouton--danger`) ; le contexte et le
  libellé portent la gravité, pas la couleur seule (règle GOV.UK).
- Feedback : toast succès (vert) ou échec (rouge), disparition à 5 s.

### 1.8 Microcopy

- Sentence case partout (« Mes disponibilités », pas « MES DISPONIBILITÉS »).
- Boutons = verbes d'action : « Enregistrer », « Suivant », « Valider ».
- Jamais « Valider le formulaire » ni « Cliquer ici ».
- Erreurs en français naturel, orientées solution :
  « L'heure de fin doit être après l'heure de début », pas « Champ invalide ».

### 1.9 Accessibilité non négociable

- **Focus states conformes GOV.UK** ([focus-states](https://design-system.service.gov.uk/get-started/focus-states/)) :
  - **Texte focusable** (liens, summary, contrôles texte) : mixin `lpv-focused-text` — fond jaune `#fd0` + bordure noire 3px en bas + outline transparent (équivalent `govuk-focused-text`).
  - **Éléments avec fond/bordure** (inputs, checkboxes, cards interactives) : mixin `lpv-focus` — contour jaune 3px + bordure noire 1px interne (équivalent jaune + `focus-text` + `focus-width`).
  - **Sur fond coloré du portail** : `lpv-focus-on-portal` — anneau blanc du portail entre l'élément et le contour jaune.
  - La combinaison jaune + noir garantit WCAG 2.2 1.4.11 sur tout fond : le jaune contraste sur fond sombre, le noir sur fond clair.
- Cibles ≥ 44 px, contrastes AA, `sr-only` pour les libellés d'action implicites,
  skip link, libellé texte toujours accompagnant une couleur (tags, statuts).

### 1.10 Type scale responsive

Échelle typographique inspirée du [type scale GOV.UK](https://design-system.service.gov.uk/styles/type-scale/)
(spec 14) : les titres s'adaptent à l'écran selon trois paliers. Breakpoints alignés sur
Tailwind : mobile < 48rem, tablet ≥ 48rem (`md`), desktop ≥ 64rem (`lg`).

| Point | Classe | Mobile < 48rem | Tablet ≥ 48rem | Desktop ≥ 64rem |
|---|---|---|---|---|
| 48 | `.lpv-h1` | 32px / lh 35px | 40px / lh 45px | 48px / lh 50px |
| 24 | `.lpv-h2` | 21px / lh 25px | 24px / lh 30px | 24px / lh 30px |
| 19 | `.lpv-h3` | 19px / lh 25px | 19px / lh 25px | 19px / lh 25px |
| — | `.lpv-muted` (corps) | 16px | 16px | 16px |

Règles (cf. [GDS 2022](https://designnotes.blog.gov.uk/2022/12/12/making-the-gov-uk-frontend-typography-scale-more-accessible/)) :

- **Jamais de texte sous 19px** : les petites tailles ne rétrécissent pas en mobile.
- Les **line-heights sont des multiples de 5px** (rythme vertical régulier).
- Tailles en **`rem`** : le texte suit le zoom navigateur (WCAG 2.1 1.4.4).
- Seules les grandes tailles rétrécissent en mobile ; le corps de texte reste fixe.

Implémentation : map Sass `$lpv-type-scale` + mixin `lpv-font-size($point)` dans
`src/app/(frontend)/styles/_mixins.scss`, consommés par `.lpv-h1/2/3` dans `_base.scss`.
Vitrine : `/design-system/typography`.

## 2. Adaptations LPV assumées

| Adaptation | Raison |
|---|---|
| Couleur d'action = couleur du portail (bleu profs, violet parents, orange élèves) | Identité par portail, pilotée par `data-lpv-portail` |
| Cards grises sans bordure ni ombre | Lisibilité « moderne doux » demandée par le produit |
| Tags en pills arrondies | Langage visuel LPV |
| Composants hors GOV.UK : modale, toast, stepper à boutons-choix | Aucun équivalent dans GOV.UK ; construits selon ses principes (focus, roles, libellés) |
| Footer en pills de liens | Équivalent GOV.UK footer simplifié |

## 3. Vocabulaire des classes

Préfixe `lpv-*` (BEM léger). Les composants consomment uniquement les variables
`--lpv-*` — jamais de couleur en dur.

- **Atomes** : `lpv-bouton`, `lpv-tag`, `lpv-chip`, `lpv-avatar`, `lpv-input`, `lpv-label`, `lpv-hint`, `lpv-error-message`, `lpv-back-link`, `lpv-avertissement`, `lpv-fil-ariane`, `lpv-details`, `lpv-file-upload`
- **Molécules** : `lpv-form-group`, `lpv-error-summary`, `lpv-modale`, `lpv-toast`, `lpv-recap`, `lpv-fieldset`, `lpv-cases`, `lpv-radios`, `lpv-champ-date`, `lpv-compteur`, `lpv-accordeon`, `lpv-onglets`, `lpv-liste-taches`, `lpv-tableau`, `lpv-pagination`
- **Structures** : `lpv-shell`, `lpv-entete-bleue` (site vitrine), `lpv-pied`, `lpv-container`
- **Shell d'appli** (portails, cf. spec 22) : `lpv-t-app-shell` (template), `lpv-o-app-sidebar` (sidebar ≥ 48rem, compacte jusqu'à 64rem, icônes monochromes, lien actif sur fond doux couleur portail, logo seul ; en bas : profil, bascule de thème, déconnexion), `lpv-o-app-tabbar` (barre d'onglets fixe < 48rem, 4 sections + « Plus »), `lpv-m-account-menu` (feuille « Plus » mobile), `lpv-m-app-footer` (pied de page minimaliste des portails). Les sections, leurs icônes et les rôles qui les voient sont déclarés dans `src/utilities/portalNav.ts`
- **Rail droit** (cf. spec 23) : `lpv-t-rail` (template `RailPage`, contenu + rail de 20rem sticky ≥ 64rem, rail sous le contenu en dessous). `DashboardPage` et `DetailPage` y passent dès qu'une `sidebar` est fournie ; les cartes du rail gardent les classes `lpv-t-dashboard-page__aside-card*`
- **Templates** : `lpv-t-app-shell`, `lpv-t-rail`, `lpv-t-detail-page`, `lpv-t-dashboard-page`, `lpv-t-form-page`, `lpv-t-question-page` — squelettes de pages assemblant les couches inférieures en slots, sans micro-copy ni fetch (cf. spec 11)
- Composants React correspondants : `src/components/atoms`, `molecules`, `organisms`, `templates`.
- **Utilitaires** : `lpv-visually-hidden` (sr-only accessibilité)

## 4. Checklist avant nouvelle page / écran

- [ ] Un objectif, un `h1`, une action primaire
- [ ] Labels au-dessus, hints sous les labels, erreurs au-dessus des champs
- [ ] Error summary avec liens vers les champs (si le formulaire peut avoir plusieurs erreurs)
- [ ] Action destructive → confirmation explicite + toast
- [ ] Sentence case, verbes d'action
- [ ] Focus visible, cibles 44 px, pas d'info portée par la couleur seule