# Spec 17 — Site vitrine : fondations

> **Statut** : Proposé · **Priorité** : Haute · **Effort** : M · **Dépendances** : —

## 1. Objectif
Sortir le site public du gabarit « Payload Website Template » : sécuriser la base de production contre le seed destructif, poser un global de paramètres du site, franciser le chrome (langue, SEO, 404, libellés admin) et aligner l'en-tête public sur le style GOV.UK déjà suivi par les portails.

## 2. Valeur utilisateur
- Les visiteurs voient un site en français, au nom de l'association, et non un gabarit anglais.
- Les coordonnées de l'association se modifient à un seul endroit dans l'administration.
- Aucun risque d'effacer les données réelles (élèves, séances, prêts) en lançant un seed.
- Base commune nécessaire aux specs 18 à 21.

## 3. Périmètre
- **Inclus** :
  - suppression du seed destructif du gabarit et de sa route `next/seed` ;
  - script de seed **idempotent** `pnpm site:seed` (structure seulement ; contenu des pages en spec 19) ;
  - global `SiteSettings` (« Paramètres du site ») ;
  - `lang="fr"`, metadata, titre SEO, image OG par défaut ;
  - page 404 en français ;
  - en-tête public restylé GOV.UK (`src/Header/*`) ;
  - libellés admin FR des champs de lien ;
  - nettoyage `BeforeDashboard`, `BeforeLogin`, README ;
  - mise à jour de la spec 01 (Pages, Posts, Header et Footer conservés).
- **Exclu** : blocs de page (spec 18), contenu des pages (spec 19), blog (spec 20), refonte du footer (déjà fait en 0.14.0).

## 4. Spécification fonctionnelle
- **Seed** :
  - `src/endpoints/seed/index.ts` exécute `deleteMany({ where: {} })` sur les collections : il est supprimé, ainsi que `src/app/(frontend)/next/seed/` et le bouton « Seed » de `BeforeDashboard` ;
  - les fichiers de données réutilisables (`contact-form.ts`, `home-static.ts`) sont déplacés vers `scripts/site-seed/` ; les autres (`post-*`, `image-*`, `home.ts`) sont supprimés ;
  - `scripts/seed-site.ts`, lancé par `payload run`, crée uniquement ce qui n'existe pas (recherche par `slug` ou par titre) ; il ne supprime ni ne met à jour aucun document existant ; il journalise « créé » / « déjà présent » pour chaque élément ;
  - deux exécutions successives : la seconde ne crée rien.
- **SiteSettings** (global, lecture publique, écriture admin) :
  - `name` (texte, défaut « Les Pierres Vivantes ») ;
  - `address` (textarea) ;
  - `email` (email) ;
  - `phone` (texte) ;
  - `openingHours` (tableau `{ label, hours }`, ex. « Mercredi », « 14 h – 17 h ») ;
  - `socialLinks` (tableau `{ network: select facebook|instagram|linkedin|youtube, url }`) ;
  - `defaultOgImage` (upload Media).
- **SEO** :
  - `generateTitle` du plugin SEO et `generateMeta` produisent « `<titre>` | Les Pierres Vivantes » (le nom vient de `SiteSettings.name`) ;
  - l'image OG par défaut vient de `SiteSettings.defaultOgImage`, sinon `/lpv-logo.png` ;
  - `twitter.creator: '@payloadcms'` est retiré.
- **404** : titre « Page introuvable », texte et liens suivant le pattern GOV.UK [Page not found](https://design-system.service.gov.uk/patterns/page-not-found-pages/) : « Si vous avez saisi l'adresse, vérifiez qu'elle est correcte. », lien vers l'accueil.
- **Langue** : `<html lang="fr">` dans `src/app/(frontend)/layout.tsx`.

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
Toutes les pages publiques (`/`, `/[slug]`, blog, `/rgpd`) ; admin Payload (« Paramètres du site »).

### 5.2 Disposition (wireframe)
En-tête public, inspiré du [header GOV.UK](https://design-system.service.gov.uk/components/header/) et de la [service navigation](https://design-system.service.gov.uk/components/service-navigation/) :
```
┌──────────────────────────────────────────────────────────────┐
│ [skip link : Aller au contenu principal]                     │
│ ♥ Les Pierres Vivantes                    Espace profs  ▸    │  bande bleue LPV
├──────────────────────────────────────────────────────────────┤
│ Accueil  Qui sommes-nous  Actualités  Contact                │  service navigation
│ ‾‾‾‾‾‾‾                                                      │  (soulignement actif)
└──────────────────────────────────────────────────────────────┘
```
- Les liens viennent du global Header (`navItems`, liens et menus déroulants conservés).
- Lien « Espace profs » à droite (texte configurable, à prévoir dans le global Header : `portalLink { show, label, href }`).

### 5.3 États & interactions
- Lien actif : soulignement épais et `aria-current="page"`.
- Les menus déroulants existants restent accessibles au clavier (Échap ferme).

### 5.4 Responsive
Sous 48rem : bouton « Menu » (pattern service navigation mobile) qui déplie la liste verticalement.

### 5.5 Thème clair/sombre & accessibilité
- Les focus suivent `lpv-focused-text` et `lpv-focus-on-portal` (`docs/design-system.md` §1.7).
- Le skip link vise `#contenu-principal` sur les pages publiques (à ajouter sur `<main>` dans `[slug]/page.tsx` et dans le blog).
- Le dark mode passe par les tokens existants.

### 5.6 Micro-copy (FR)
- « Aller au contenu principal », « Menu », « Espace profs ».
- 404 : « Page introuvable », « Si vous avez saisi l'adresse, vérifiez qu'elle est correcte. », « Si vous avez collé l'adresse, vérifiez que vous l'avez copiée en entier. », « Retour à l'accueil ».
- Admin : « Paramètres du site », « Coordonnées », « Horaires d'accueil », « Réseaux sociaux », « Image de partage par défaut ».

## 6. Spécification technique
### 6.1 Fichiers (nouveaux / modifiés)
- **Nouveaux** :
  - `src/globals/SiteSettings/index.ts` ;
  - `src/utilities/getSiteSettings.ts` (lecture en cache via `getCachedGlobal`) ;
  - `scripts/seed-site.ts`, `scripts/site-seed/*` ;
  - `src/migrations/<date>_site_settings.ts` ;
  - `tests/int/not-found.int.spec.tsx`, `tests/int/site-header.int.spec.tsx`.
- **Modifiés** :
  - `src/payload.config.ts` (global ajouté, commentaire « à retirer plus tard » supprimé) ;
  - `src/plugins/index.ts` (`generateTitle`) ;
  - `src/utilities/generateMeta.ts`, `src/utilities/mergeOpenGraph.ts` ;
  - `src/app/(frontend)/layout.tsx` (`lang`, metadata) ;
  - `src/app/(frontend)/not-found.tsx` ;
  - `src/Header/config.ts` (`portalLink`), `src/Header/Component.client.tsx`, `src/Header/Nav/index.tsx` ;
  - `src/app/(frontend)/styles/_header.scss` (retrait de `.lpv-o-header-nav` et `.lpv-o-header-dropdown` s'ils sont remplacés) ;
  - `src/fields/link.ts`, `src/fields/linkGroup.ts` (libellés FR) ;
  - `src/components/BeforeDashboard/*`, `src/components/BeforeLogin/*` ;
  - `package.json` (script `site:seed`) ;
  - `README.md`, `specs/01-collections-coeur.md`.
- **Supprimés** : `src/endpoints/seed/index.ts` et les données inutiles, `src/app/(frontend)/next/seed/`.

### 6.2 Données & persistance
- Nouvelles tables du global `site_settings` (et ses tableaux), plus la colonne `portal_link_*` sur `header`.
- Lancer `pnpm payload migrate:create site_settings`, relire le SQL (aucun `DROP` sur une table existante), puis `pnpm payload migrate`.

### 6.3 API / contraintes
- `push: false` reste en place.
- Le script de seed passe par la Local API avec `overrideAccess: true`, sans `req` utilisateur.
- `SiteSettings` en lecture publique (`read: () => true`), écriture réservée à `admin`.
- Revalidation : hook `afterChange` du global qui appelle `revalidateTag('global_site-settings')` (même modèle que `src/Header/hooks`).

## 7. Critères d'acceptation
- [ ] La route `/next/seed` répond 404 ; aucun code du dépôt n'appelle `deleteMany` avec `where: {}`.
- [ ] `pnpm site:seed` lancé deux fois : la seconde exécution ne crée rien et ne modifie rien.
- [ ] « Paramètres du site » est éditable par un admin et lisible sans authentification ; un prof ne peut pas le modifier.
- [ ] Toutes les pages publiques ont `lang="fr"` et un titre « … | Les Pierres Vivantes » ; la chaîne « Payload » n'apparaît plus dans le HTML public.
- [ ] La 404 est en français et suit le pattern GOV.UK.
- [ ] L'en-tête public suit le wireframe, avec lien actif, menu mobile et skip link fonctionnels.
- [ ] Migration commitée, lint, typecheck et tests int passent.

## 8. Risques & questions ouvertes
- Le seed destructif a-t-il déjà été appelé en prod ? Non d'après l'historique ; la suppression est préventive.
- Le global Header a déjà `afficherRecherche` : la recherche reste-t-elle dans l'en-tête ? Proposition : oui, déplacée vers `/recherche` (spec 20).
- Nommage des champs : les globals existants mélangent français (`afficherRecherche`, `sousLiens`) et anglais. On suit AGENTS.md (anglais) pour les nouveaux champs, sans renommer les anciens pour éviter une migration de données.
