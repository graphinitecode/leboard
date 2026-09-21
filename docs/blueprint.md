# Blueprint d'Architecture — Workspace `application/`

> Blueprint de l'architecture. Document **d'architecture**, pas de produit : il décrit la structure, les patterns et les règles tels qu'ils sont réellement implémentés ici, avec le vrai code. Il peut être repris tel quel par un autre projet Next.js en remplaçant les BCs par les siens.
>
> Complément de `ARCHITECTURE.md` (racine, vue générique) et de `AGENTS.md` (structure auto-générée + conventions). Ici : le **comment et le pourquoi**, fichier par fichier.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Les trois zones du workspace](#2-les-trois-zones-du-workspace)
3. [Zone 1 — `app/` : les routes, assemblage pur](#3-zone-1--app--les-routes-assemblage-pur)
4. [Zone 2 — `src/` : les Bounded Contexts](#4-zone-2--src--les-bounded-contexts)
5. [Zone 3 — `shared/` : le kernel transverse](#5-zone-3--shared--le-kernel-transverse)
6. [Le pattern CQRS en pratique dans ce repo](#6-le-pattern-cqrs-en-pratique-dans-ce-repo)
7. [Le pattern Presenter / ViewModel en pratique](#7-le-pattern-presenter--viewmodel-en-pratique)
8. [Bootstrap & orchestration globale](#8-bootstrap--orchestration-globale)
9. [Les 4 BCs existants — état des lieux](#9-les-4-bcs-existants--état-des-lieux)
10. [Flux de données complet — login](#10-flux-de-données-complet--login)
11. [Règles de dépendance du workspace](#11-règles-de-dépendance-du-workspace)
12. [Recette : ajouter un BC et sa route](#12-recette--ajouter-un-bc-et-sa-route)
13. [Recette : ajouter un cas d'usage dans un BC existant](#13-recette--ajouter-un-cas-dusage-dans-un-bc-existant)
14. [Anti-patterns détectables dans ce repo](#14-anti-patterns-détectables-dans-ce-repo)

---

## 1. Vue d'ensemble

### 1.1 Le principe en une phrase

> `app/` assemble, `src/` contient le métier en Bounded Contexts, `shared/` fournit le transverse. Les pages ne contiennent **jamais** de logique : elles composent des composants exportés par les barrels des BCs.

### 1.2 Schéma global

```
┌───────────────────────────────────────────────────────────────────┐
│  app/  (Next.js App Router)                                       │
│  layout.tsx → providers.tsx → [locale]/layout.tsx → pages        │
│  Assemblage seul : metadata, guards, composants des BCs          │
└──────────────────────────────┬────────────────────────────────────┘
                               │ import depuis les barrels (@/auth, @/shipment…)
┌──────────────────────────────▼────────────────────────────────────┐
│  src/  (Bounded Contexts)                                          │
│                                                                    │
│  auth/            sender_profile/   shipment/      pricing_rule/   │
│  ┌─────────┐      ┌──────────────┐  ┌─────────┐    ┌────────────┐ │
│  │domain   │      │domain        │  │domain   │    │domain      │ │
│  │application│    │application   │  │application│  │application│ │
│  │infrastructure│ │infrastructure│  │infrastructure││infrastructure│
│  │presentation│   │presentation  │  │presentation│ │presentation│ │
│  └─────────┘      └──────────────┘  └─────────┘    └────────────┘ │
│                                                                    │
│  shared/  ← kernel transverse (aucun BC ne le contourne)          │
│    domain/interfaces · infrastructure · ui/components             │
└───────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                    API FastAPI /api/v1/*
               (types générés → __generated__/api.d.ts)
```

### 1.3 Stack effectivement en place

| Rôle | Choix | Où dans le code |
|---|---|---|
| Framework | Next.js 16.2.4 App Router, segment `[locale]` | `app/[locale]/` |
| i18n | next-intl ^4.9.1 (fr défaut, en) | `src/shared/infrastructure/i18n/` |
| State serveur | React Query v5 | hooks `*.hook.ts` de chaque BC |
| State client | Zustand | `*/presentation/store/*.store.ts` |
| Formulaires | react-hook-form + zodResolver | composants organisms |
| Validation | Zod **`zod/v3`** | `*/presentation/schemas/` |
| HTTP | Axios singleton, `withCredentials: true`, baseURL `http://127.0.0.1:8000` | `src/shared/infrastructure/http.client.ts` |
| Design system | shadcn/ui (11 composants) | `components/ui/` |
| Icônes | @iconify/react (`hugeicons:*`) | composants |
| Thème | next-themes | `app/providers.tsx` |
| Types API | openapi-typescript (~3720 lignes) | `src/shared/infrastructure/__generated__/api.d.ts` |
| Tests | Vitest + Testing Library | `*.test.ts` co-localisés |
| DI | **Aucun container** — singletons exportés directement | repositories |

---

## 2. Les trois zones du workspace

| Zone | Contient | Peut importer | Ne peut JAMAIS importer |
|---|---|---|---|
| `app/` | pages, layouts, providers | barrels des BCs, `shared/ui/`, `components/ui/`, `shared/infrastructure/i18n/navigation`, `shared/infrastructure/metadata` | handlers, repositories, `httpClient`, DTOs générés |
| `src/<bc>/` | toutes les couches du BC | son propre domaine, ses singletons, `shared/` | les internals d'un autre BC |
| `components/ui/` | design system shadcn | — (UI pure) | **aucun BC, aucune couche métier** |

---

## 3. Zone 1 — `app/` : les routes, assemblage pur

### 3.1 Le principe

Une page Next.js ne fait **qu'une chose** : assembler. Elle importe des composants depuis les barrels des BCs, fournit metadata et guards, et rend. **Zéro logique métier, zéro appel réseau, zéro state.**

Trois patterns de pages coexistent :

**Pattern A — page serveur mince + View client co-localisé** (le plus fréquent) :

```tsx
// app/[locale]/shipments/page.tsx — 5 lignes, assemblage pur
import ShipmentsView from './ShipmentsView';

export default function ShipmentsPage() {
  return <ShipmentsView />;
}
```

```tsx
// app/[locale]/shipments/ShipmentsView.tsx — co-localisé, 'use client'
'use client';

import { ShipmentList } from '@/shipment';                                     // barrel du BC
import { ProtectedRoute } from '@/auth/presentation/components/ProtectedRoute'; // composant du BC auth

export default function ShipmentsView() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen px-4 py-12">
        <div className="w-full max-w-3xl mx-auto">
          <ShipmentList />
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

**Pattern B — page serveur avec metadata i18n** (pages auth) :

```tsx
// app/[locale]/(auth)/login/page.tsx
import { getTranslations } from 'next-intl/server';
import { createMetadata } from '@/shared/infrastructure/metadata';
import { AuthShell } from '@/shared/ui/components/AuthShell';
import { LoginForm, GoogleLoginButton } from '@/auth';   // ← barrel

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations('auth.LoginPage');
  return createMetadata({
    locale: locale as 'fr' | 'en',
    title: t('meta_title'),
    description: t('meta_description'),
    pathname: '/login',
    robots: 'noindex, nofollow',
  });
}

export default async function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
      <GoogleLoginButton />
    </AuthShell>
  );
}
```

**Ce qu'une page a le droit de faire :**

| Autorisé | Interdit |
|---|---|
| Importer des composants/hooks via le barrel du BC (`import { LoginForm } from '@/auth'`) | Importer un handler ou repository directement |
| `generateMetadata` via `createMetadata()` | Importer `AxiosError` / `httpClient` |
| Wrapping dans `ProtectedRoute` / `AuthShell` | Manipuler l'état utilisateur |
| Compositions layout (grille, marges) | Logique métier (labels, formats, décisions) |

### 3.2 Cartographie des routes

```
app/
├── layout.tsx                 # RootLayout minimal (globals.css + children)
├── providers.tsx              # 'use client' — QueryClient, ThemeProvider, session interceptor
├── error.tsx / not-found.tsx  # erreurs globales
└── [locale]/
    ├── layout.tsx             # validation locale, fonts, NextIntlClientProvider
    ├── page.tsx               # home
    ├── (auth)/                # groupe de routes auth (layout dédié AuthShell)
    │   ├── login/page.tsx
    │   ├── signup/page.tsx
    │   ├── forgot-password/page.tsx
    │   ├── reset-password/[token]/page.tsx
    │   ├── validate-email/page.tsx
    │   ├── complete-registration/page.tsx
    │   └── auth/callback/page.tsx       # retour OAuth
    ├── sender/profile/…       # BC sender_profile
    ├── shipment/…             # BC shipment (create, [id], tracking/[code])
    ├── shipments/             # liste (BC shipment)
    └── admin/pricing/page.tsx # BC pricing_rule
```

**Conventions routes ↔ BC :**

- Chaque page est une **coquille** : elle délègue à un composant organism du BC (souvent via un `XxxView.tsx` co-localisé en client component).
- Les pages qui exigent une session sont wrappées dans `ProtectedRoute`.
- Les groupes `(auth)` partagent un layout commun sans impacter les URLs.
- Les segments dynamiques (`[token]`, `[id]`, `[code]`) transportent l'identifiant ; c'est le composant qui le passe au hook query/command.

---

## 4. Zone 2 — `src/` : les Bounded Contexts

### 4.1 Quatre BCs, un même squelette

| BC | Maturité | Commands | Queries | Tests | Store | Interfaces domaine |
|---|---|---|---|---|---|---|
| `auth/` | Complet (référence) | 9 | 2 | oui | `auth.store.ts` | `IAuthRepository`, `IUserRepository` |
| `sender_profile/` | Modéré | 1 | 1 | oui | oui | non |
| `shipment/` | Modéré | 3 | 3 | oui | oui | non |
| `pricing_rule/` | En cours | 3 | 1 | **non** | **non** | non |

Le BC `auth/` est le **template canonique** — c'est lui qu'on copie. Les écarts des autres BCs sont documentés en §9.

### 4.2 Le squelette canonique (celui de `auth/`)

```
src/<bc>/
├── index.ts                            # BARREL — toute l'API publique
├── domain/                             # TS pur
│   ├── <entity>.entity.ts              # interface + factory
│   └── interfaces/
│       └── <entity>-repository.interface.ts
├── application/
│   ├── commands/<verbe-objet>/         # 1 dossier par cas d'usage ÉCRITURE
│   │   ├── <verbe-objet>.command.ts    #   intention (interface)
│   │   ├── <verbe-objet>.handler.ts    #   exécution (délègue au repository)
│   │   ├── <verbe-objet>.handler.test.ts
│   │   └── <verbe-objet>.hook.ts       #   useMutation
│   └── queries/<get-objet>/            # idem LECTURE
│       ├── <get-objet>.query.ts
│       ├── <get-objet>.handler.ts
│       ├── <get-objet>.handler.test.ts
│       └── <get-objet>.hook.ts         #   useQuery
├── infrastructure/
│   ├── <entity>.repository.ts          # implémente le contrat (singleton)
│   └── session.interceptor.ts          # effets techniques (optionnel)
└── presentation/
    ├── <entity>.presenter.ts           # entité → ViewModel (+ test)
    ├── schemas/                        # factories Zod i18n
    ├── store/                          # Zustand (ViewModels)
    └── components/
        ├── molecules/                  # champs réutilisables + index.ts
        ├── organisms/                  # formulaires/listes métier
        │   └── signupFormSteps/        # multi-étapes + index.ts
        └── templates/                  # gabarits de page
```

---

## 5. Zone 3 — `shared/` : le kernel transverse

Le kernel est le seul code **partagé par tous les BCs**. Trois sous-zones, trois niveaux d'abstraction :

```
src/shared/
├── domain/interfaces/        # CONTRATS — TS pur
│   ├── repository.interface.ts    → IRepository<T> (5 méthodes CRUD)
│   └── event-bus.interface.ts     → IEventBus, DomainEvent
│
├── infrastructure/           # IMPLÉMENTATIONS TRANSVERSALES
│   ├── http.client.ts             → Axios singleton (withCredentials, setHttpClientLocale)
│   ├── axios-error.ts             → getAxiosErrorMessage, isAxiosUnauthorized
│   ├── event-bus.ts               → EventBus + singleton eventBus
│   ├── logger.ts                  → logger silencieux en production
│   ├── metadata.ts                → createMetadata() (SEO, OG, hreflang)
│   ├── i18n/                      → routing, navigation, request, config
│   └── __generated__/api.d.ts     → types OpenAPI — ISOLÉS ICI
│
└── ui/components/            # COMPOSANTS TRANSVERSAUX (UI pure, sans BC)
    ├── AuthShell.tsx · ProtectedRoute.tsx
    ├── ThemeToggle.tsx · LocaleSwitcher.tsx
    ├── CountryCodeSelect.tsx · HomeCTAButtons.tsx
```

### 5.1 Qui peut importer quoi dans le kernel

| Sous-zone | Importable par | Jamais par |
|---|---|---|
| `shared/domain/interfaces/` | tout le monde (c'est du TS pur) | — |
| `shared/infrastructure/` | `application/` et `infrastructure/` des BCs, `app/providers.tsx` | `domain/` des BCs |
| `shared/ui/components/` | composants des BCs et pages | — |
| `__generated__/api.d.ts` | **uniquement** les fichiers `infrastructure/` | tout autre fichier |

### 5.2 Le triptyque d'infrastructure à connaître par cœur

```typescript
// http.client.ts — le seul point de contact Axios
const httpClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  withCredentials: true,        // auth par cookie — aucun token géré côté front
});

// axios-error.ts — normalisation (utilise UNIQUEMENT dans infrastructure/)
getAxiosErrorMessage(err, fallback)  // → string lisible depuis { message } ou { detail }
isAxiosUnauthorized(err)             // → boolean (401)

// event-bus.ts — communication inter-BCs
eventBus.emit({ name: '…', occurredAt: new Date(), payload: { … } })
eventBus.on('…', handler)
```

---

## 6. Le pattern CQRS en pratique dans ce repo

### 6.1 La règle des 4 fichiers

Chaque cas d'usage = un dossier, jusqu'à 4 fichiers, dans ce BC :

```
commands/login/
├── login.command.ts        # interface de l'intention — TS pur
├── login.handler.ts        # exécution — délègue au repository
├── login.handler.test.ts   # tests — repository espionné via vi.spyOn
└── login.hook.ts           # hook React Query — la seule API des composants
```

### 6.2 Command — le triplet réel

```typescript
// application/commands/login/login.command.ts
export interface LoginCommand {
  email: string;
  password: string;
  rememberMe?: boolean;
  clientType?: 'web' | 'app';
}
```

```typescript
// application/commands/login/login.handler.ts
import type { LoginCommand } from './login.command';
import { authRepository } from '@/auth/infrastructure/auth.repository';

export const loginHandler = async (command: LoginCommand): Promise<{ message: string }> => {
  return authRepository.login(command);
};
```

```typescript
// application/commands/login/login.hook.ts — orchestration complète
export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { login: storeLogin } = useAuthStore();

  return useMutation({
    mutationFn: (command: LoginCommand) => loginHandler(command),
    onSuccess: async () => {
      const user = await queryClient.fetchQuery({           // 1. récupérer l'entité
        queryKey: ['auth', 'currentUser'],
        queryFn: () => getCurrentUserHandler({}),
      });
      if (user) {
        const userViewModel = presentUser(user);            // 2. entité → ViewModel
        storeLogin(userViewModel);                          // 3. hydrater le store
      }
      router.push('/');                                     // 4. naviguer
    },
  });
};
```

### 6.3 Query — le triplet réel

```typescript
// queries/get-current-user/get-current-user.query.ts
export type GetCurrentUserQuery = object;   // query sans paramètre
```

```typescript
// queries/get-current-user/get-current-user.handler.ts
export const getCurrentUserHandler = async (_query: GetCurrentUserQuery): Promise<User | null> => {
  return userRepository.getCurrentUser();   // le mapping DTO→entité est dans le repository
};
```

```typescript
// queries/get-current-user/get-current-user.hook.ts
export const useGetCurrentUser = (query: GetCurrentUserQuery = {}) =>
  useQuery({
    queryKey: ['auth', 'currentUser'],      // clé stable, réutilisée pour invalidation
    queryFn: () => getCurrentUserHandler(query),
  });

export const prefetchCurrentUser = (queryClient) =>
  queryClient.fetchQuery({ queryKey: ['auth', 'currentUser'], queryFn: () => getCurrentUserHandler({}) });
```

### 6.4 Les patterns de hooks observés

| Pattern | Où | Exemple |
|---|---|---|
| Mutation mince (délégation pure) | BCs simples | `useCancelOrder` |
| Mutation avec orchestration (fetch + presenter + store + redirect) | login | `useLogin` |
| Query avec clé exportée + prefetch | auth | `useGetCurrentUser`, `prefetchCurrentUser` |
| Query paramétrée (`enabled` conditionnel) | shipment | `useGetShipment` |

**Règle :** toute invalidation ou effet post-écriture se fait dans `onSuccess` du hook — jamais dans le composant.

---

## 7. Le pattern Presenter / ViewModel en pratique

### 7.1 Le presenter réel

```typescript
// auth/presentation/user.presenter.ts (extrait réel)

export interface UserViewModel {
  id: string;
  email: string;
  fullName: string;                    // nom composé
  roleLabel: string;                   // label traduit
  statusLabel: string;                 // label traduit
  createdAtFormatted: string;          // date formatée
  avatarUrl: string | null;
  hasConfirmedEmail: boolean;
  hasConfirmedPhone: boolean;
  phoneNumber: string | null;
}

export const presentUser = (user: User): UserViewModel => ({
  id: user.id,
  email: user.email,
  fullName: `${user.firstname} ${user.lastname}`,
  roleLabel: user.role === 'admin' ? 'Administrateur' : user.role === 'staff' ? 'Staff' : 'Utilisateur',
  statusLabel: user.status === 'active' ? 'Actif' : 'Inactif',
  createdAtFormatted: new Date(user.createdAt).toLocaleDateString('fr-FR'),
  …
});
```

### 7.2 Le store ne stocke que des ViewModels

```typescript
// auth/presentation/store/auth.store.ts (réel — intégral)

interface AuthState {
  user: UserViewModel | null;
  isAuthenticated: boolean;
  login: (user: ReturnType<typeof presentUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

### 7.3 Le composant final — LoginForm (extrait réel)

```tsx
export function LoginForm() {
  const t = useTranslations('auth.loginForm');
  const schema = useMemo(() => createLoginSchema(t), [t]);   // schema mémoïsé
  const [error, setError] = useState<string | null>(null);

  const { mutate: login, isPending } = useLogin();           // hook du barrel

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', rememberMe: false, clientType: 'web' },
  });

  const onSubmit = (data: LoginFormData) => {
    setError(null);
    login(data, { onError: (err) => setError(err.message) }); // Error native uniquement
  };

  return (
    <AuthPageTemplate …>
      <form onSubmit={handleSubmit(onSubmit)}>
        {formError && <Alert variant="destructive">…{formError}</Alert>}
        <EmailField control={control} name="email" />          {/* molecules */}
        <PasswordField control={control} name="password" />
        <RememberMeField control={control} name="rememberMe" />
        <Button type="submit" disabled={isPending}>
          {isPending ? t('submitting') : t('submit')}
        </Button>
      </form>
    </AuthPageTemplate>
  );
}
```

Le composant ne connaît que : le schema (factory), le hook (barrel), les molécules, `err.message`. Rien d'autre.

### 7.4 Le triptyque formulaire

```
react-hook-form (control)
    + zodResolver(createXxxSchema(t))     ← validation i18n
    + molécules (<EmailField control name>)
```

Contrôles shadcn non natifs (`Select`, `Checkbox`) passent par `Controller` :

```tsx
<Controller
  name="field"
  control={control}
  render={({ field }) => (
    <Select onValueChange={field.onChange} value={field.value}>…</Select>
  )}
/>
```

---

## 8. Bootstrap & orchestration globale

Un point souvent flou : **où câbler les effets globaux** (session expirée, hydratation auth, locale HTTP) ? Réponse : `app/providers.tsx`, le seul endroit légitime où la présentation orche l'infrastructure transverse.

```tsx
// app/providers.tsx (réel, simplifié)
'use client';

export function Providers({ children, locale = 'fr' }) {
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();
  const { logout } = useAuthStore();

  useEffect(() => {
    setHttpClientLocale(locale);                          // 1. locale → header Accept-Language
  }, [locale]);

  useEffect(() => {
    installSessionInterceptor(() => {                     // 2. 401 global (DIP)
      logout();                                           //    le store est réagi ICI
      router.push('/login');                              //    pas dans l'intercepteur
    });
  }, [logout, router]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthHydrator />                                  {/* 3. rehydrate l'état auth au mount */}
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
```

Chaîne de layouts :

```
app/layout.tsx            → RootLayout (globals.css, passthrough)
  └─ app/[locale]/layout.tsx
       • valide la locale (hasLocale + routing) → notFound()
       • charge les messages (getMessages)
       • injecte les fonts (variables CSS)
       • NextIntlClientProvider > Providers
           └─ children (pages)
```

`providers.tsx` est `'use client'` car il utilise hooks et contexte ; les layouts restent serveur.

---

## 9. Les 4 BCs existants — état des lieux

### 9.1 `auth/` — le BC de référence

- 9 commands (login, signup, logout, forgot-password, reset-password, validate-email, resend-email-confirmation, complete-registration, google-auth), 2 queries (get-current-user, get-user)
- **Le seul BC avec `domain/interfaces/`** complet (`IAuthRepository`, `IUserRepository`)
- `session.interceptor.ts` — seul intercepteur HTTP du repo
- Composants les plus structurés : molecules (5), organisms (8 + signupFormSteps), template (`AuthPageTemplate`)
- Presenter + store + 6 schemas Zod, tests partout

À copier pour tout nouveau BC.

### 9.2 `sender_profile/` — modéré

- 1 command (create), 1 query (get-my), presenter, store, 1 schema
- **Sans `domain/interfaces/`** : le handler importe le repository singleton directement
- Repository mappe `SenderProfileResponse` (types générés) → entité

### 9.3 `shipment/` — modéré

- 3 commands (create, confirm, cancel), 3 queries (get, list-my, track), presenter, store, 2 schemas
- Le presenter expose des décisions métier résolues (ex. `canCancel`) — pattern à généraliser

### 9.4 `pricing_rule/` — en cours

- 3 commands + 1 query **sans tests**, presenter sans store
- Repository avec DTOs **à la main** (pas `__generated__`) — à migrer vers les types générés
- Pas de `domain/interfaces/`

### 9.5 Écarts au canon (et comment les traiter)

| Écart observé | Statut | Action recommandée |
|---|---|---|
| BCs sans `domain/interfaces/` (repository importé direct par les handlers) | Réalité du repo | Acceptable en pragmatique ; extraire l'interface **si** le couplage devient gênant (tests, swap d'implémentation) |
| `pricing_rule/` sans tests ni store | Dettes | Ajouter tests au fil de l'eau, comme les autres BCs |
| Repository `pricing_rule` avec DTOs manuels | Dettes | Migrer vers `components['schemas'][…]` de `__generated__/api.d.ts` |

---

## 10. Flux de données complet — login

```
LoginForm.tsx                              (presentation, BC auth)
  │  valide via createLoginSchema(t) → zodResolver
  │  handleSubmit(onSubmit) → login(data)
  ▼
useLogin()                                 (application, BC auth)
  │  useMutation({ mutationFn: loginHandler })
  ▼
loginHandler(command)                      (application, BC auth)
  │  return authRepository.login(command)  ← délégation mince
  ▼
authRepository.login()                     (infrastructure, BC auth)
  │  httpClient.post('/api/v1/auth/login', command)   [withCredentials]
  │  catch → throw new Error(getAxiosErrorMessage(err))
  │  → backend pose le cookie access_token
  ▼
onSuccess (login.hook.ts)
  │  queryClient.fetchQuery({ queryKey: ['auth','currentUser'], … })
  ▼
getCurrentUserHandler({})                  (application)
  │  → userRepository.getCurrentUser()
  ▼
userRepository.getCurrentUser()            (infrastructure)
  │  httpClient.get('/api/v1/users/me')
  │  mapDtoToUser(UserAccountQueryModel) → User    ← DTO généré, traduit ICI
  ▼
presentUser(user) → UserViewModel          (presentation)
  │  authStore.login(viewModel)                    ← Zustand
  │  router.push('/')
  ▼
UI : Header lit useAuthStore → affiche fullName, avatarUrl… sans calcul
```

**Chaque flèche traverse une frontière typée.** Si un maillon casse, le compilateur le signale : c'est la fonction de la structure.

---

## 11. Règles de dépendance du workspace

### 11.1 Le graphe des imports autorisés

```
app/[locale]/pages ──────▶ barrels des BCs (@/auth, @/shipment…)
        │                        │
        │                        ▼
        │              BC presentation ──▶ barrel du même BC
        │                        │              (hooks, VM, store)
        │                        ▼
        │              components/ui (shadcn) ◀── aussi importé
        │                        ▼              directement par les composants
        │              shared/ui/components
        ▼
app/providers.tsx ──▶ shared/infrastructure (http.client, i18n)
                  ──▶ barrels auth (installSessionInterceptor, useAuthStore)

BC application/handler ──▶ infrastructure singleton du même BC
                       ──▶ shared/infrastructure (httpClient, axios-error)
                       ──▶ domain/interfaces du même BC

BC infrastructure ──▶ domain/interfaces (contrat)
                  ──▶ shared/infrastructure (httpClient, axios-error)
                  ──▶ __generated__/api.d.ts (mapping DTO)

BC domain ──▶ RIEN (TS pur)
```

### 11.2 Liste noire — vérifiée par relecture (pas de lint d'architecture)

| Interdit | Remplacer par |
|---|---|
| Composant → `import { AxiosError }` | `onError: (err: Error) => setError(err.message)` |
| Composant → `httpClient` ou un handler | Le hook du barrel |
| N'importe où sauf `infrastructure/` → `__generated__/api` | Types entité domaine |
| BC A → `@/auth/application/commands/…` (internes) | Barrel `@/auth`, ou event bus |
| `components/ui/*` → n'importe quel BC | Rien — le design system est en bas de pile |
| `domain/` → React / Axios / React Query / Zustand | TS pur |
| Message de validation hardcodé | `t('key')` via factory Zod |

### 11.3 Les exceptions assumées du repo

Le blueprint est **honnête** : certaines pratiques du repo dévient du canon strict, de façon documentée et délibérée :

1. **Les handlers importent les singletons infrastructure directement** (pas d'injection). Les tests compensent via `vi.spyOn(repository, 'méthode')`.
2. **Trois BCs sur quatre n'ont pas de `domain/interfaces/`** — l'interface existe quand le BC en a besoin, pas avant.
3. **Le barrel de `auth/` exporte aussi les repositories** (`authRepository`, `userRepository`) — utile aux tests, à surveiller pour ne pas fuiter dans d'autres BCs.
4. **`app/providers.tsx` importe des internals de `auth/`** (`AuthHydrator`, `ProtectedRoute`) plutôt que le barrel — toléré pour le bootstrap, à ne pas généraliser.

---

## 12. Recette : ajouter un BC et sa route

Exemple concret : BC `notifications/` avec une query et une command.

### 12.1 Étapes

```bash
# 1. Squelette
mkdir -p src/notifications/{domain/interfaces,application/{commands,queries},infrastructure,presentation/{components/organisms,schemas,store}}

# 2. Domaine
touch src/notifications/domain/notification.entity.ts
touch src/notifications/domain/interfaces/notification-repository.interface.ts

# 3. Premier cas d'usage (query)
mkdir -p src/notifications/application/queries/list-notifications

# 4. Infrastructure
touch src/notifications/infrastructure/notification.repository.ts

# 5. Présentation
touch src/notifications/presentation/notification.presenter.ts
touch src/notifications/presentation/schemas/mark-as-read.schema.ts

# 6. Barrel
touch src/notifications/index.ts

# 7. Route
mkdir -p "app/[locale]/notifications"
```

### 12.2 La page (assemblage)

```tsx
// app/[locale]/notifications/page.tsx
import NotificationsView from './NotificationsView';
export default function NotificationsPage() {
  return <NotificationsView />;
}
```

```tsx
// app/[locale]/notifications/NotificationsView.tsx
'use client';
import { NotificationList } from '@/notifications';    // barrel
import { ProtectedRoute } from '@/auth/presentation/components/ProtectedRoute';

export default function NotificationsView() {
  return (
    <ProtectedRoute>
      <NotificationList />
    </ProtectedRoute>
  );
}
```

### 12.3 L'ordre d'écriture interne (du plus pur au plus framework)

1. `notification.entity.ts` (TS pur)
2. `notification-repository.interface.ts` (contrat)
3. `notification.repository.ts` (HTTP + mapping DTO + erreurs)
4. `list-notifications/{query,handler}.ts` → test → hook
5. `notification.presenter.ts` → test
6. `schemas/`, `store/` (si besoin)
7. `components/` (molecules → organisms)
8. `index.ts` (barrel)
9. Page + View

---

## 13. Recette : ajouter un cas d'usage dans un BC existant

Prenons « marquer une notification comme lue » dans le BC `notifications/` :

```bash
mkdir -p src/notifications/application/commands/mark-as-read
```

```typescript
// 1. mark-as-read.command.ts
export interface MarkAsReadCommand {
  notificationId: string;
}
```

```typescript
// 2. mark-as-read.handler.ts
import type { MarkAsReadCommand } from './mark-as-read.command';
import { notificationRepository } from '@/notifications/infrastructure/notification.repository';

export const markAsReadHandler = async (command: MarkAsReadCommand): Promise<void> => {
  return notificationRepository.markAsRead(command);
};
```

```typescript
// 3. mark-as-read.handler.test.ts
vi.spyOn(notificationRepository, 'markAsRead').mockResolvedValue(undefined);
await expect(markAsReadHandler({ notificationId: 'not_1' })).resolves.toBeUndefined();
expect(notificationRepository.markAsRead).toHaveBeenCalledWith({ notificationId: 'not_1' });
```

```typescript
// 4. mark-as-read.hook.ts
export const useMarkAsRead = () =>
  useMutation({
    mutationFn: (command: MarkAsReadCommand) => markAsReadHandler(command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
```

```typescript
// 5. index.ts — ajouter au barrel
export type { MarkAsReadCommand } from './application/commands/mark-as-read/mark-as-read.command';
export { useMarkAsRead } from './application/commands/mark-as-read/mark-as-read.hook';
```

---

## 14. Anti-patterns détectables dans ce repo

Recensement des dérives à ne **pas** réintroduire dans du nouveau code :

| Anti-pattern | Où il a été vu | Correct |
|---|---|---|
| Import d'un BC via un chemin interne | à éviter partout | `import { x } from '@/auth'` |
| Types générés hors `infrastructure/` | `pricing_rule.repository` (DTOs manuels, à migrer) | DTO local dans le repository |
| Handler qui orchestre 2 métiers | à éviter | 1 handler = 1 intention ; orchestration dans le hook |
| Label de statut hardcodé dans un composant | à éviter | `statusLabel` du presenter |
| Entité domaine stockée dans un store | à éviter | ViewModel |
| `t('...')` hardcodé hors namespace du formulaire | à éviter | namespace par formulaire, clés via schema |
| Composant qui invalide les queries React Query | à éviter | `onSuccess` du hook |

---

## Résumé en une phrase par couche

| Couche | Phrase |
|---|---|
| `app/` | Assemble : metadata, guards, composants. Rien d'autre. |
| `presentation/` | Affiche des ViewModels. Zéro logique, zéro Axios. |
| `application/` | Une intention = un dossier = un handler = un hook. |
| `domain/` | TS pur : entités + contrats. |
| `infrastructure/` | HTTP, mapping DTO→entité, normalisation d'erreurs. Types générés confinés ici. |
| `shared/` | Le transverse : contrats, httpClient, event bus, i18n, ui. Ne connaît aucun BC. |
| `components/ui/` | Design system. Ne connaît personne au-dessus. |

*Ce blueprint reflète l'état réel du workspace au 21/09/2026. La structure des dossiers fait foi : `AGENTS.md` (auto-généré via `scripts/update-structure.sh`) la maintient à jour.*
