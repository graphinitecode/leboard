# Spec 19 — Site vitrine : pages institutionnelles

> **Statut** : Proposé · **Priorité** : Haute · **Effort** : M · **Dépendances** : Specs 17, 18

## 1. Objectif
Publier les pages qui présentent l'association : accueil, qui sommes-nous, contact et mentions légales. Elles sont composées avec les blocs de la spec 18, créées une première fois par `pnpm site:seed`, puis éditables par les bénévoles dans l'administration.

## 2. Valeur utilisateur
- Les familles et les futurs bénévoles comprennent l'association et savent comment la joindre.
- Une demande de contact arrive par e-mail à l'équipe et reste archivée dans l'admin.
- Mentions légales conformes, avec un lien vers la politique RGPD déjà en place (`/rgpd`).

## 3. Périmètre
- **Inclus** :
  - 4 pages CMS (`home`, `qui-sommes-nous`, `contact`, `mentions-legales`) ;
  - formulaire « Contact » du form-builder, avec notification e-mail ;
  - contenu initial (textes provisoires à valider) ;
  - navigation Header et Footer alimentée par le seed ;
  - réécriture en français du repli `home-static`.
- **Exclu** : blog (spec 20), page nouveautés (spec 21), inscription en ligne des élèves, don en ligne.

## 4. Spécification fonctionnelle
| Page | Slug | Hero | Blocs (dans l'ordre) |
|---|---|---|---|
| Accueil | `home` (servie sur `/`) | `banner` : « Du soutien scolaire gratuit, près de chez vous », CTA « Nous contacter » → `/contact` et « Qui sommes-nous » | `features` (Cours de soutien, Bibliothèque, Suivi personnalisé) · `stats` · `archive` (3 derniers articles) · `cta` (« Devenir bénévole ») |
| Qui sommes-nous | `qui-sommes-nous` | `simple` | `content` 2/3 + 1/3 (histoire et mission / encart chiffres) · `team` · `faq` |
| Contact | `contact` | `simple` | `content` 2/3 (`formBlock` « Contact ») + 1/3 (`contactInfo`) |
| Mentions légales | `mentions-legales` | `none` (titre `h1` seul) | `content` (éditeur, hébergeur, propriété intellectuelle, lien `/rgpd`) |

- **Formulaire « Contact »** :
  - champs : Nom (requis), E-mail (requis), Téléphone (facultatif), Objet (select : Inscription d'un enfant · Devenir bénévole · Autre), Message (requis, 1 000 caractères max avec `m-character-count`) ;
  - case de consentement RGPD obligatoire, qui renvoie vers `/rgpd` ;
  - e-mail à l'adresse `SiteSettings.email`, via Resend (déjà configuré dans `payload.config.ts`), avec `replyTo` réglé sur l'e-mail saisi ;
  - confirmation : panel « Message envoyé », texte « Nous vous répondrons sous quelques jours. ».
- **Seed** (`scripts/seed-site.ts`, idempotent, cf. spec 17) :
  - crée le formulaire puis les 4 pages en statut **publié**, uniquement si leur slug n'existe pas ;
  - si le global Header n'a aucun `navItems`, il le remplit avec Accueil · Qui sommes-nous · Actualités · Contact ;
  - si le Footer n'a pas de lien légal, il ajoute « Mentions légales » et « Données personnelles » (`/rgpd`).
- **Repli** : si la page `home` n'existe pas, `/` affiche `home-static` réécrit en français (hero et lien vers l'admin), sans contenu du gabarit.
- **Pages en brouillon** : invisibles du public, visibles en aperçu en direct.

## 5. UI / UX
### 5.1 Emplacement & déclencheurs
`/`, `/qui-sommes-nous`, `/contact`, `/mentions-legales` ; liens du Header et du Footer.

### 5.2 Disposition (wireframe)
Contact :
```
┌──────────────────────────────────────────────────────────┐
│ Nous contacter                                     (h1)  │
├───────────────────────────────────┬──────────────────────┤
│ Nom                                │ Coordonnées          │
│ [__________________]               │ 12 rue …             │
│ E-mail                             │ contact@…            │
│ [__________________]               │ 01 23 45 67 89       │
│ Objet  [Inscription d'un enfant ▾] │ Horaires d'accueil   │
│ Message                            │ Mercredi 14 h – 17 h │
│ [                  ]  0/1000       │ Samedi   9 h – 12 h  │
│ ☐ J'accepte… (données personnelles)│                      │
│ [ Envoyer ]                        │                      │
└───────────────────────────────────┴──────────────────────┘
```

### 5.3 États & interactions
Ceux du formulaire de la spec 18. Les liens de nav pointent vers la page courante avec `aria-current`.

### 5.4 Responsive
Contact : la colonne des coordonnées passe **au-dessus** du formulaire sous 48rem (info utile d'abord, pattern GOV.UK « contact a department »).

### 5.5 Thème clair/sombre & accessibilité
- `autocomplete` sur les champs : `name`, `email`, `tel`.
- Messages d'erreur GOV.UK : « Saisissez votre nom », « Saisissez une adresse e-mail valide, par exemple nom@exemple.fr », « Saisissez votre message », « Cochez la case pour accepter… ».

### 5.6 Micro-copy (FR)
Textes initiaux provisoires, marqués « [À valider] » dans l'admin pour relecture par le bureau de l'association. Titres : « Nous contacter », « Qui sommes-nous ? », « Mentions légales ».

## 6. Spécification technique
### 6.1 Fichiers (nouveaux / modifiés)
- **Nouveaux** : `scripts/site-seed/{home,about,contact,legal}.ts` (données des pages), `scripts/site-seed/contact-form.ts` (formulaire).
- **Modifiés** :
  - `scripts/seed-site.ts` (enchaînement) ;
  - `scripts/site-seed/home-static.ts` (repli FR) ;
  - `src/app/(frontend)/[slug]/page.tsx` (`#contenu-principal`, repli) ;
  - `src/plugins/index.ts` (`formBuilderPlugin` : champs `country` et `state` désactivés, `formOverrides` en libellés FR) ;
  - `tests/e2e/frontend.e2e.spec.ts`.

### 6.2 Données & persistance
- Aucune modification de schéma attendue : on utilise Pages, `forms` et `form-submissions` existants.
- Si la désactivation des champs `country` et `state` change le schéma, créer la migration `form_builder_fr`.

### 6.3 API / contraintes
- Envoi d'e-mail : `emails` du formulaire (form-builder), sans code d'envoi maison.
- Anti-spam minimal : champ « pot de miel » caché et rejet côté hook `beforeChange` de `form-submissions` s'il est rempli.

## 7. Critères d'acceptation
- [ ] Après `pnpm site:seed` sur une base sans pages, les 4 pages sont publiées et accessibles ; une seconde exécution ne change rien.
- [ ] Le seed ne modifie ni les pages, ni les navs, ni le formulaire déjà présents.
- [ ] Le formulaire de contact refuse un envoi invalide avec error summary, accepte un envoi valide, crée une soumission visible dans l'admin et envoie l'e-mail à l'adresse des paramètres.
- [ ] Une soumission avec le pot de miel rempli est rejetée silencieusement.
- [ ] La nav du Header et du Footer mène aux 4 pages et à `/rgpd`.
- [ ] e2e : `/`, `/qui-sommes-nous`, `/contact`, `/mentions-legales` répondent 200.
- [ ] Lint, typecheck et tests passent.

## 8. Risques & questions ouvertes
- Contenu réel (histoire, chiffres, équipe, mentions légales) : à fournir par l'association. Les textes du seed sont provisoires.
- Adresse e-mail destinataire des contacts : à saisir dans « Paramètres du site » avant la mise en ligne.
- Le seed passe-t-il en prod via Vercel ? Non : il se lance à la main, une fois.
