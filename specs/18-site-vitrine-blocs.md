# Spec 18 — Site vitrine : blocs CMS au style GOV.UK

> **Statut** : Proposé · **Priorité** : Haute · **Effort** : L · **Dépendances** : Spec 17

## 1. Objectif
Remplacer les blocs et heros du gabarit Payload (Tailwind, shadcn) par des blocs construits avec le design system LPV, qui suit les principes GOV.UK, et ajouter les blocs propres à une association (activités, chiffres clés, équipe, coordonnées, FAQ). Les rédacteurs composent ensuite chaque page dans l'administration.

## 2. Valeur utilisateur
- Pages publiques visuellement cohérentes avec les espaces profs et parents.
- Lisibilité et accessibilité GOV.UK : typographie, colonnes, contrastes, focus.
- Les bénévoles éditent les pages sans développeur, avec des blocs adaptés à l'association.

## 3. Périmètre
- **Inclus** :
  - un hero unique `o-site-hero` à 3 variantes ;
  - blocs Content, CallToAction, MediaBlock, Archive et Form refaits ;
  - 5 nouveaux blocs : `features`, `stats`, `team`, `contactInfo`, `faq` ;
  - styles du rich text ;
  - démonstration sur `/design-system`.
- **Exclu** : contenu réel des pages (spec 19), mise en page des articles (spec 20), blocs `Banner` et `Code` du rich text des articles (restylés en spec 20), suppression de Tailwind du projet (d'autres écrans l'utilisent encore).

## 4. Spécification fonctionnelle
Chaque bloc a une config Payload (`src/blocks/<Name>/config.ts`), un composant de rendu (`Component.tsx`) qui délègue à un organism `src/components/organisms/o-*.tsx`, et des classes `lpv-o-<block>__*`.

| Bloc | Champs | Rendu GOV.UK de référence |
|---|---|---|
| **Hero** (champ `hero` des pages) | `type`: `none` \| `banner` \| `split` \| `simple` ; `title` ; `richText` ; `links` (≤ 2) ; `media` (pour `split`) | Bande colorée des pages d'accueil gov.uk ; titre `lpv-h1` blanc ; bouton [start](https://design-system.service.gov.uk/components/button/#start-buttons) |
| **content** | `columns[]` `{ size: full \| twoThirds \| oneThird \| half, richText, enableLink, link }` | [Layout / grille](https://design-system.service.gov.uk/styles/layout/) deux tiers / un tiers |
| **cta** | `richText`, `links` (≤ 2) | [Inset text](https://design-system.service.gov.uk/components/inset-text/) plus bouton |
| **mediaBlock** | `media`, `caption` | Image pleine colonne, légende `lpv-muted` |
| **archive** | `introContent`, `populateBy` (collection / sélection), `categories`, `limit` | [Document list](https://design-system.service.gov.uk/patterns/) : titre, date, extrait |
| **formBlock** | `form`, `enableIntro`, `introContent` | [Question pages](https://design-system.service.gov.uk/patterns/question-pages/), [Error summary](https://design-system.service.gov.uk/components/error-summary/), [Confirmation](https://design-system.service.gov.uk/patterns/confirmation-pages/) |
| **features** (nouveau) | `title`, `items[]` `{ icon (select d'icônes rivet-icons), title, text, link? }` (2 à 6) | Cartes `a-icon-card`, 3 colonnes |
| **stats** (nouveau) | `title`, `items[]` `{ value, label }` (2 à 4) | Grille `lpv-cards-grid` / `lpv-stat` |
| **team** (nouveau) | `title`, `intro`, `members[]` `{ photo?, name, role, bio? }` | Liste de cartes ; initiales via `m-avatar` si pas de photo |
| **contactInfo** (nouveau) | `title`, `showHours`, `showSocial` ; données lues dans `SiteSettings` | Pattern [Contact a department](https://design-system.service.gov.uk/patterns/contact-a-department-or-service-team/) : adresse, email, téléphone, horaires |
| **faq** (nouveau) | `title`, `items[]` `{ question, answer (richText) }` | [Accordion](https://design-system.service.gov.uk/components/accordion/) via `m-accordion` |

Règles :
- **Formulaire** :
  - les champs du form-builder (text, email, textarea, select, checkbox, number, message) sont rendus avec `m-input-field`, `m-input`, `m-radios` / select natif, `a-checkbox` et `a-label` (Label, Hint, ErrorMessage) ;
  - à l'envoi invalide, `ErrorSummary` s'affiche en haut et le focus s'y place ;
  - après envoi : message de confirmation (`confirmationMessage` du form) en [panel](https://design-system.service.gov.uk/components/panel/) vert, ou redirection si configurée ;
  - les champs `country` et `state` du gabarit sont supprimés (inutiles ici).
- **Rich text** : `src/components/RichText` produit des éléments sémantiques stylés par une classe `lpv-prose` (h2/h3 en type scale spec 14, listes à puces GOV.UK, liens soulignés, citation en inset text).
- **Une seule action primaire** par bloc (règle GOV.UK, `docs/design-system.md`).
- Le champ `layout` de Pages accepte : `content`, `cta`, `mediaBlock`, `archive`, `formBlock`, `features`, `stats`, `team`, `contactInfo`, `faq`.

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
Pages CMS `/` et `/[slug]` ; admin Payload (onglet « Contenu » des pages) ; vitrine `/design-system/blocs`.

### 5.2 Disposition (wireframe)
```
Hero banner                         Features (3 col.)
┌──────────────────────────────┐   ┌────────┐┌────────┐┌────────┐
│ Les Pierres Vivantes          │   │ ◎ Cours ││ ◎ Biblio││ ◎ Suivi │
│ Du soutien scolaire gratuit…  │   │ texte   ││ texte   ││ texte   │
│ [ Nous contacter  ▸ ]         │   └────────┘└────────┘└────────┘
└──────────────────────────────┘
Content 2/3 + 1/3                   Stats
┌───────────────────┐┌────────┐    ┌──────┐┌──────┐┌──────┐
│ texte riche       ││ encart  │    │ 120  ││ 25   ││ 3    │
│                   ││         │    │élèves││bénév.││lieux │
└───────────────────┘└────────┘    └──────┘└──────┘└──────┘
```

### 5.3 États & interactions
- Archive vide : « Aucun article pour le moment. »
- Formulaire : états vide, erreur (summary et message au champ), envoi en cours (bouton désactivé « Envoi… »), succès.
- Accordion : « Tout afficher / Tout masquer ».

### 5.4 Responsive
Mobile-first : une colonne sous 48rem ; features et stats passent de 1 à 2 puis 3 ou 4 colonnes ; hero `split` empile le média sous le texte.

### 5.5 Thème clair/sombre & accessibilité
- Un seul `h1` par page (celui du hero, ou du titre si `type: none`) ; les blocs titrent en `h2`.
- Icônes décoratives en `aria-hidden` ; images avec `alt` obligatoire (champ `alt` de Media rendu requis à la saisie dans ces blocs).
- Contrastes AA en clair et en sombre, via les tokens.

### 5.6 Micro-copy (FR)
« Envoyer », « Envoi… », « Il y a un problème » (titre de l'error summary), « Aucun article pour le moment. », « Lire la suite », « Tout afficher », « Tout masquer ». Libellés admin des blocs en français : « Activités », « Chiffres clés », « Équipe », « Coordonnées », « Questions fréquentes ».

## 6. Spécification technique
### 6.1 Fichiers (nouveaux / modifiés)
- **Nouveaux** :
  - `src/blocks/{Features,Stats,Team,ContactInfo,Faq}/{config.ts,Component.tsx}` ;
  - organisms `o-site-hero.tsx`, `o-features.tsx`, `o-stats.tsx`, `o-team.tsx`, `o-contact-info.tsx`, `o-faq.tsx`, `o-site-form.tsx`, `o-post-list.tsx` ;
  - `src/app/(frontend)/styles/_site.scss` (déclaré dans `themes.scss`) ;
  - `src/app/(frontend)/design-system/blocs/page.tsx` ;
  - tests `tests/int/site-hero.int.spec.tsx`, `features.int.spec.tsx`, `stats.int.spec.tsx`, `team.int.spec.tsx`, `contact-info.int.spec.tsx`, `faq.int.spec.tsx`, `site-form.int.spec.tsx` ;
  - migration `src/migrations/<date>_blocs_site.ts`.
- **Modifiés** :
  - `src/heros/config.ts` et `RenderHero.tsx` (`HighImpact`, `MediumImpact` et `LowImpact` supprimés au profit de `o-site-hero`) ;
  - `src/blocks/{Content,CallToAction,MediaBlock,ArchiveBlock,Form}/*` ;
  - `src/blocks/RenderBlocks.tsx` ;
  - `src/collections/Pages/index.ts` ;
  - `src/components/RichText/index.tsx` ;
  - `src/components/Link` (`CMSLink` rendu avec `a-button` ou un lien LPV) ;
  - `docs/design-system.md` (section « Blocs du site »).
- **Supprimés** : `src/blocks/Form/{Country,State}`, `src/heros/{HighImpact,MediumImpact,LowImpact}`.

### 6.2 Données & persistance
- Nouvelles tables pour les blocs (`pages_blocks_features`, `pages_blocks_stats`, etc., ainsi que leurs versions `_pages_v_*`) ; changement des valeurs de l'enum `hero.type`.
- **Attention** : renommer les valeurs `highImpact`, `mediumImpact`, `lowImpact` impose une migration de données.
  - La migration doit convertir `highImpact` en `banner`, `mediumImpact` en `split` et `lowImpact` en `simple` avant de changer l'enum.
  - Relire le SQL généré et compléter la migration à la main si besoin.
- `pnpm payload migrate:create blocs_site`, relecture, `pnpm payload migrate`.

### 6.3 API / contraintes
- Les organisms sont des server components ; seuls `o-site-form` et `o-faq` sont client (`'use client'`).
- Aucune classe Tailwind dans les nouveaux composants.
- Les icônes de `features` sont limitées à une liste fermée (select), pour éviter de dépendre d'un pack non enregistré dans `a-icon`.

## 7. Critères d'acceptation
- [ ] Chaque bloc listé est disponible dans l'admin, avec libellés FR, et se rend sur `/design-system/blocs`.
- [ ] Les pages existantes dont le hero est en ancien format s'affichent toujours après migration.
- [ ] Le formulaire affiche l'error summary et les erreurs au champ, puis la confirmation ; l'envoi crée une `form-submission`.
- [ ] Aucun composant de `src/blocks` ou `src/heros` n'importe `@/components/ui/*` ni n'utilise de classe Tailwind.
- [ ] Un seul `h1` par page, navigation au clavier complète dans l'accordion et le formulaire.
- [ ] Rendu correct en clair et en sombre, de 320px à 1440px.
- [ ] Migration commitée, lint, typecheck et tests int passent.

## 8. Risques & questions ouvertes
- L'équipe : une liste dans un bloc suffit-elle, ou faut-il une collection `Members` réutilisable sur plusieurs pages ? Proposition : un bloc pour cette itération (règle de trois).
- Faut-il garder `components/ui/*` (shadcn) une fois le formulaire migré ? Les supprimer s'ils ne sont plus importés (vérifier la pagination et le select du blog en spec 20).
- Live preview : vérifier que l'autosave à 100 ms ne gêne pas l'édition des blocs riches ; le passer à 375 ms si besoin.
