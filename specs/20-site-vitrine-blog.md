# Spec 20 — Site vitrine : blog / actualités

> **Statut** : Proposé · **Priorité** : Moyenne · **Effort** : M · **Dépendances** : Spec 18

## 1. Objectif
Transformer le blog du gabarit (`/posts`, Tailwind, anglais) en rubrique « Actualités » de l'association sur `/blog` : liste paginée, filtre par catégorie, page article lisible au style GOV.UK et recherche en français.

## 2. Valeur utilisateur
- Les familles et partenaires suivent la vie de l'association (sorties, rentrée, appels à bénévoles).
- Les adresses lisibles et en français facilitent le partage.
- Les anciennes adresses `/posts/...` continuent de fonctionner.

## 3. Périmètre
- **Inclus** :
  - déplacement des routes `/posts` vers `/blog`, avec redirections 301 ;
  - liste, pagination, filtre par catégorie, page article, articles liés ;
  - recherche `/recherche` ;
  - sitemap et aperçu en direct ;
  - styles des blocs de rich text `Banner` et `Code`.
- **Exclu** : commentaires, abonnement newsletter, flux RSS (à proposer plus tard).

## 4. Spécification fonctionnelle
- **Routes** :
  - `/blog` : liste des articles publiés, du plus récent au plus ancien, 12 par page ;
  - `/blog/page/[pageNumber]` : pagination ;
  - `/blog/categorie/[slug]` et `/blog/categorie/[slug]/page/[pageNumber]` : filtre par catégorie (404 si la catégorie n'existe pas) ;
  - `/blog/[slug]` : article ;
  - `/recherche?q=` : recherche plein texte (plugin search existant, sur les articles).
- **Redirections 301** dans `next.config.ts` : `/posts` vers `/blog`, `/posts/:path*` vers `/blog/:path*`, `/search` vers `/recherche`.
- **Article** :
  - [titre](https://design-system.service.gov.uk/styles/headings/) `h1` ;
  - métadonnées (« Publié le 7 octobre 2026 · par Marie D. · Catégorie ») ;
  - image principale ;
  - contenu `lpv-prose` ;
  - « Sur cette page » ([contents list](https://design-system.service.gov.uk/patterns/) généré depuis les `h2`, affiché à partir de 3 `h2`) ;
  - « Articles liés » (`relatedPosts`) ;
  - lien retour « Toutes les actualités » (`a-back-link`).
- **Liste** : un élément par article en [document list](https://design-system.service.gov.uk/patterns/) : titre en lien, date, catégories en `a-tag`, extrait (`meta.description`). L'image est facultative et masquée sous 48rem.
- **Filtre catégories** : liste de liens au-dessus de la liste (« Toutes » · catégories ayant au moins un article publié), lien actif avec `aria-current`.
- **Libellés admin** : la collection Posts s'affiche « Actualités » et « Article ».

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
Lien « Actualités » du Header, bloc `archive` de l'accueil, liens de catégorie.

### 5.2 Disposition (wireframe)
```
Actualités                                         (h1)
Toutes · Vie de l'association · Bénévolat · Bibliothèque
───────────────────────────────────────────────────────
Sortie au musée des enfants du mercredi            ← lien h2
7 octobre 2026 · [Vie de l'association]
Une vingtaine d'élèves ont visité…
───────────────────────────────────────────────────────
…
            ‹ Précédent   1  2  3   Suivant ›
```

### 5.3 États & interactions
- Liste vide : « Aucune actualité pour le moment. ».
- Recherche sans résultat : « Aucun résultat pour « {q} ». Vérifiez l'orthographe ou essayez d'autres mots. ».

### 5.4 Responsive
- Une colonne.
- Sous 48rem : le sommaire « Sur cette page » passe en haut de l'article et le filtre catégories devient un menu déroulant.

### 5.5 Thème clair/sombre & accessibilité
- Pagination via `m-pagination` (`nav` avec `aria-label="Pagination"`).
- Dates en `<time dateTime>`.
- Images avec `alt`.

### 5.6 Micro-copy (FR)
« Actualités », « Toutes », « Publié le », « par », « Sur cette page », « Articles liés », « Toutes les actualités », « Rechercher », « Précédent », « Suivant ».

## 6. Spécification technique
### 6.1 Fichiers (nouveaux / modifiés)
- **Déplacés** :
  - `src/app/(frontend)/posts/*` vers `src/app/(frontend)/blog/*` ;
  - `src/app/(frontend)/search/*` vers `src/app/(frontend)/recherche/*` ;
  - `src/app/(frontend)/(sitemaps)/posts-sitemap.xml` (URLs en `/blog/`).
- **Nouveaux** :
  - `src/app/(frontend)/blog/categorie/[slug]/page.tsx` et sa pagination ;
  - organisms `o-post-list.tsx` (partagé avec le bloc `archive` de la spec 18), `o-post-header.tsx`, `o-contents-list.tsx` ;
  - tests `tests/int/post-list.int.spec.tsx`, `contents-list.int.spec.tsx`.
- **Modifiés** :
  - `next.config.ts` (`redirects`) ;
  - `src/components/RichText/index.tsx` (liens internes vers `/blog/`) ;
  - `src/utilities/generatePreviewPath.ts` ;
  - `src/collections/Posts/hooks/revalidatePost.ts` ;
  - `src/collections/Posts/index.ts` (libellés) ;
  - `src/blocks/{Banner,Code}/Component.tsx` ;
  - `src/heros/PostHero` (remplacé par `o-post-header`) ;
  - `src/components/{Card,CollectionArchive,PageRange,Pagination}` (supprimés s'ils ne sont plus utilisés) ;
  - `src/Header` (lien de recherche).

### 6.2 Données & persistance
Aucun changement de schéma. Les documents `redirects` existants qui pointent vers des articles restent valides (référence par relation).

### 6.3 API / contraintes
- `generateStaticParams` conservé pour les articles et les catégories.
- `revalidatePath('/blog')` et `revalidatePath('/blog/[slug]')` dans les hooks.
- Les liens internes générés (rich text, CMSLink, plugin redirects) sont centralisés dans une fonction `getDocumentPath(relationTo, slug)` (`src/utilities/getDocumentPath.ts`) pour qu'aucun `/posts/` codé en dur ne subsiste.

## 7. Critères d'acceptation
- [ ] `/blog`, sa pagination, les catégories et les articles s'affichent au style LPV/GOV.UK, sans classe Tailwind.
- [ ] `/posts`, `/posts/<slug>` et `/search` redirigent en 301 vers leur nouvelle adresse.
- [ ] `grep -rn "'/posts" src` ne renvoie plus rien hors redirections.
- [ ] L'aperçu en direct d'un article brouillon fonctionne depuis l'admin.
- [ ] Le sitemap des articles liste des URLs `/blog/...`.
- [ ] e2e : `/blog` répond 200, `/posts` redirige.
- [ ] Lint, typecheck et tests passent.

## 8. Risques & questions ouvertes
- Nom de rubrique : « Actualités » dans la nav, mais `/blog` dans l'URL (choix validé). Faut-il plutôt `/actualites` ? Le changer coûte peu tant que la page n'est pas publiée.
- La recherche porte-t-elle aussi sur les pages ? Proposition : non pour cette itération.
