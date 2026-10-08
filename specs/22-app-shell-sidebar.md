# Spec 22 — Shell d'appli avec sidebar

> **Statut** : Proposé · **Priorité** : Haute · **Effort** : L · **Dépendances** : Specs 10, 11

## 1. Objectif
Remplacer l'en-tête coloré à onglets des portails profs et parents (`m-service-header` avec hero) par un shell d'application : sidebar verticale à gauche sur ordinateur, barre d'onglets en bas sur mobile, contenu centré. Référence visuelle : la navigation de Duolingo (liens à icône et libellé en capitales, lien actif en pastille bordée).

## 2. Valeur utilisateur
- Toutes les sections sont visibles en permanence, sans menu à ouvrir, avec plus de place verticale pour le contenu (le hero disparaît).
- Place pour les sections à venir (Alertes, Plannings, Rapports) sans saturer une rangée d'onglets.
- Sur mobile, navigation au pouce comme dans une appli native.

## 3. Périmètre
- **Inclus** :
  - template `AppShell` ;
  - organisms `AppSidebar` et `AppTabbar` ;
  - configuration de navigation centralisée et filtrée par rôle ;
  - menu « Plus » (thème, profil, nouveautés, déconnexion) ;
  - mode déconnecté ;
  - migration des layouts profs et parents et des pages publiques de compte ;
  - suppression de l'esquisse `design-system/sidebar`.
- **Exclu** : colonne de droite et réorganisation des écrans (spec 23) ; nouvelles sections Alertes et Plannings (des entrées pourront être ajoutées à la config sans toucher au shell).

## 4. Spécification fonctionnelle
- **Configuration** `src/utilities/portalNav.ts` : une liste par portail d'éléments `{ href, label, icon, match?, roles? }`. `getPortalNav(portail, role)` renvoie les éléments visibles.

  | Portail | Éléments (ordre) | Rôles |
  |---|---|---|
  | profs | Tableau de bord (`/profs`, match `/profs/seances`) · Calendrier · Élèves · Bibliothèque · Disponibilités | tous les rôles du portail |
  | profs | Rapports (`/rapports`, cf. spec 23) | admin, prof |
  | parents | Mes enfants (`/parents`, match `/parents/enfants`) | parent |

  - « Profil » (`/profs/mon-profil` ou `/parents/mon-profil`) et « Plus » sont ajoutés en bas par le shell, pas par la config.
  - L'état actif réutilise `isNavLinkActive` (`src/components/molecules/m-portal-nav.tsx`) : préfixe d'URL, `match[]`, accueil du portail en correspondance exacte.
- **Sidebar** (≥ 48rem) :
  - en haut : logo LPV (lien vers l'accueil du portail) ;
  - puis les éléments : icône 28px, libellé en capitales espacées ;
  - en bas : Profil, puis Plus.
- **Menu « Plus »** : popover ancré au bouton.
  - Contenu : nom et e-mail de l'utilisateur, « Mon profil », `ThemeToggle variant="panel"`, « Nouveautés » (`/nouveautes`, spec 21), « Site de l'association » (`/`), puis « Se déconnecter » (formulaire `m-logout.ts`).
  - Ce contenu est extrait de `m-avatar.tsx` en molécule `m-account-menu`, réutilisée par la sidebar et la tabbar.
- **Tabbar** (< 48rem) :
  - barre fixée en bas, 5 emplacements au plus ;
  - si le portail a plus de 4 éléments, les 4 premiers sont affichés et le dernier emplacement est « Plus » ; les éléments restants apparaissent en tête de la feuille « Plus » ;
  - la feuille « Plus » s'ouvre depuis le bas (`m-modal` en variante `sheet`).
- **Déconnecté** (pages de connexion, `/rgpd`, mot de passe oublié ou réinitialisé) : ni sidebar ni tabbar ; en-tête fin avec le logo seul, contenu centré. Ces pages passent aussi par `AppShell` avec `user = null`.
- **Hero supprimé** : `heroTitle` et `heroText` disparaissent du layout profs ; le titre de chaque page reste son `h1`.
- **Couleur portail** : `data-lpv-portail` pilote la couleur d'accent (bleu profs, violet parents) du lien actif et du logo.

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
Toutes les pages sous `/profs/*`, `/parents/*` et `/rapports/*`, plus `/rgpd`, `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe`.

### 5.2 Disposition (wireframe)
Ordinateur (≥ 48rem) :
```
┌────────────────┬──────────────────────────────────────────┐
│ ♥ LPV          │                                          │
│                │            contenu de la page            │
│ ⌂ TABLEAU DE B.│            (h1, sections…)               │
│ ▦ CALENDRIER   │                                          │
│╭──────────────╮│                                          │
││☺ ÉLÈVES      ││  ← actif : pastille bordée couleur portail│
│╰──────────────╯│                                          │
│ ▤ BIBLIOTHÈQUE │                                          │
│ ◷ DISPONIBIL.  │                                          │
│                │                                          │
│ ● PROFIL       │                                          │
│ ⋯ PLUS         │                                          │
└────────────────┴──────────────────────────────────────────┘
   ~16rem, filet à droite, sticky pleine hauteur
```
Mobile (< 48rem) :
```
┌──────────────────────────┐
│ ♥                        │  en-tête fin (logo)
│ contenu                  │
│                          │
├──────────────────────────┤
│  ⌂    ▦    ☺    ▤    ⋯   │  tabbar fixe, libellés courts
│ Accueil Cal. Élèves Biblio Plus │
└──────────────────────────┘
```
Entre 48rem et 64rem, la sidebar passe en mode **compact** (icônes seules, ~5rem) avec le libellé en infobulle et en `aria-label`.

### 5.3 États & interactions
- Lien : repos, survol (fond `--lpv-grey-bg`), actif (bordure 2px couleur portail, fond doux, `aria-current="page"`), focus (`lpv-focus`).
- Popover « Plus » : ouverture au clic, à Entrée ou Espace ; Échap ferme et rend le focus au bouton ; un clic extérieur ferme.
- Feuille mobile : piège de focus, Échap ou fond ferme.

### 5.4 Responsive
- 48rem : bascule entre tabbar et sidebar.
- 64rem : bascule entre sidebar compacte et sidebar complète.
- Le contenu reçoit un `padding-bottom` égal à la hauteur de la tabbar et `env(safe-area-inset-bottom)` sur mobile.

### 5.5 Thème clair/sombre & accessibilité
- Sidebar en `<nav aria-label="Navigation principale">`, tabbar en `<nav aria-label="Navigation principale">` (une seule visible à la fois, l'autre en `display: none`).
- Skip link « Aller au contenu principal » conservé, cible `#contenu-principal`.
- Icônes `aria-hidden`, libellé toujours présent (visible ou `aria-label` en mode compact).
- Cibles tactiles ≥ 44px.
- Clair et sombre via les tokens ; filet de séparation `--lpv-grey-border`.

### 5.6 Micro-copy (FR)
Libellés de nav ci-dessus ; dans la tabbar : « Accueil », « Calendrier », « Élèves », « Biblio », « Plus ». Menu : « Mon profil », « Thème », « Nouveautés », « Site de l'association », « Se déconnecter ».

## 6. Spécification technique
### 6.1 Fichiers (nouveaux / modifiés)
- **Nouveaux** :
  - `src/components/templates/t-app-shell.tsx` ;
  - `src/components/organisms/o-app-sidebar.tsx`, `o-app-tabbar.tsx` ;
  - `src/components/molecules/m-account-menu.tsx` ;
  - `src/utilities/portalNav.ts` ;
  - `src/app/(frontend)/styles/_app-shell.scss` (déclaré dans `themes.scss`) ;
  - tests `tests/int/app-shell.int.spec.tsx`, `app-sidebar.int.spec.tsx`, `app-tabbar.int.spec.tsx`, `portal-nav-config.int.spec.ts`.
- **Modifiés** :
  - `src/app/(frontend)/profs/layout.tsx`, `parents/layout.tsx` ;
  - `src/app/(frontend)/rgpd/page.tsx`, `mot-de-passe-oublie/page.tsx`, `reinitialiser-mot-de-passe/page.tsx` ;
  - `src/components/molecules/m-avatar.tsx` (délègue à `m-account-menu`) ou suppression s'il n'est plus utilisé ;
  - `src/components/molecules/m-modal.tsx` (variante `sheet`) ;
  - `src/components/templates/index.ts` ;
  - `src/app/(frontend)/styles/_base.scss` (règle qui masque le chrome du site, inchangée) et `_header.scss` (styles du `ServiceHeader` portail retirés) ;
  - `docs/design-system.md` (section Shell) ;
  - tests `service-header`, `portal-page`, adaptés ou supprimés avec leurs composants.
- **Supprimés** :
  - `src/app/(frontend)/design-system/sidebar/*` et `styles/_esquisse-sidebar.scss` ;
  - `m-service-header.tsx`, `m-portal-nav.tsx` (`isNavLinkActive` déplacé dans `portalNav.ts`) et `t-portal-page.tsx`, s'ils ne sont plus utilisés.

### 6.2 Données & persistance
Aucune : pas de migration. Le rôle vient de `getMeUserServer()`.

### 6.3 API / contraintes
- `AppShell` et `AppSidebar` sont des server components ; l'état actif (pathname) et les menus sont des îlots client (`usePathname`).
- Icônes via `a-icon` (packs `rivet-icons` et `boxicons` déjà enregistrés) ; pas de `lucide-react`.
- Le filtrage par rôle est un confort d'affichage : chaque page garde son contrôle d'accès serveur (`requireProf`, `requireParent`, `peutGerer`).

## 7. Critères d'acceptation
- [ ] Sur `/profs/*` en ≥ 64rem : sidebar complète, lien actif en pastille bordée, plus de hero ni d'onglets.
- [ ] Entre 48 et 64rem : sidebar compacte, libellés accessibles.
- [ ] Sous 48rem : tabbar fixe, « Plus » ouvre la feuille avec les éléments restants, le thème et la déconnexion.
- [ ] Le portail parents utilise le même shell en violet.
- [ ] Un bénévole bibliothèque ne voit pas « Rapports » ; un parent ne voit que ses entrées.
- [ ] Pages de connexion, RGPD et mot de passe : shell déconnecté, sans navigation.
- [ ] Navigation au clavier complète (skip link, liens, popover, feuille) ; `aria-current` sur le lien actif.
- [ ] Rendu clair et sombre vérifié ; plus aucun fichier d'esquisse sidebar.
- [ ] Lint, typecheck et tests int passent.

## 8. Risques & questions ouvertes
- Tabbar à 5 emplacements pour 6 entrées profs : ordre à valider (proposition : Accueil, Calendrier, Élèves, Bibliothèque, puis Disponibilités et Rapports dans « Plus »).
- Le footer pleine largeur disparaît de l'appli ; ses liens passent dans le rail (spec 23) et dans « Plus ». À confirmer avec la spec 23.
- Les tests e2e existants ne couvrent pas la navigation ; ajouter un e2e de navigation profs serait utile mais demande un compte de test seedé (`tests/helpers/seedUser.ts`).
