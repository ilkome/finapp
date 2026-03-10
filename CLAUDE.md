# Finapp

Personal finance app. Nuxt 4, Vue 3, Pinia, @nuxt/ui v4 (Tailwind CSS v4), Convex backend, Better Auth.

- Node.js >= v24.12.0
- Package manager: pnpm
- SPA mode (`ssr: false`)
- PWA with `generateSW` strategy from `@vite-pwa/nuxt` (no custom service worker)

## Commands

- `pnpm dev` — Nuxt dev server on port 3050
- `pnpm dev:convex` — Convex backend (watches and auto-deploys changes)
- Both must run simultaneously in separate terminals
- `pnpm build` — SPA build (`nuxt build`)
- `pnpm generate` — static generation (`nuxt generate`)
- `pnpm lint` / `pnpm lint:fix` — ESLint
- `pnpm test` — Vitest
- `pnpm docs:dev` — docs dev server
- `pnpm docs:build` — build docs site

## Project Structure

See [Architecture](../docs/content/en/3.technical/1.architecture.md) for detailed project structure and file descriptions.

## Conventions

- Components: PascalCase, grouped by feature in `components/[feature]/`
- UI primitives in `components/ui/`
- Imports use `~/` alias (resolves to `/app/`)
- ESLint flat config with `@antfu/eslint-config`, Perfectionist for sorting
- Prettier with Tailwind plugin, single quotes, no semicolons, trailing commas
- i18n: `no_prefix` strategy, two locales (en-US, ru-RU)
- Always run `pnpm lint:fix` before committing

## CSS / Theme Rules

- @nuxt/ui defines CSS vars in `@layer theme`
- Dynamic theme (radius, colors) is applied via `useHead()` in `app.vue` with `tagPriority: -2`
- **Do NOT** set `--ui-radius` or `--ui-primary` in `theme.css` — non-layered CSS loads after `useHead()` and overrides it
- Radius uses `??` (not `||`) to allow `0`: `${appConfig.theme.radius ?? 0.375}`

## Store Pattern

All Pinia stores (`useTrnsStore`, `useWalletsStore`, `useCategoriesStore`) follow the same pattern:

- `items: shallowRef` — reactive state (shallow for performance)
- `init()` — fetch from Convex → `mergeOfflineOps` → `set`
- `set(data)` — `items.value = data` + `debouncedPersist` (300ms)
- `save({ id, values })` — optimistic UI → `pushSaveOp` → fire mutation (no await)
- `delete(id)` — optimistic UI → `pushDeleteOp` → fire mutation (no await)

Mutation result: `.then()` removes offline op + remaps frontend ID → `.catch()` shows error toast.

### Frontend ID System

New entities get temporary IDs with `local_` prefix (e.g., `local_a1b2c3`). `isLocalId(id)` checks `id.startsWith('local_')` to distinguish from Convex IDs. After successful create mutation, `handleMutationResult()` remaps `items[localId]` → `items[convexId]`.

## Convex Backend

- Schema in `convex/schema.ts`: categories, wallets, trns, userSettings, rates
- `TrnType` enum in `convex/shared.ts`: Expense (0), Income (1), Transfer (2)
- Adjustment is determined by `categoryId === 'adjustment'`, NOT by `TrnType`. It uses Expense or Income type, excluded from income/expense statistics
- Auth: `@convex-dev/better-auth` with `cors: true` in `http.ts`
- Generated types in `convex/_generated/` — do not edit
- `convex/tsconfig.json` is separate from the app tsconfig

### Convex Client Access

| Composable | Returns | Purpose |
|------------|---------|---------|
| `useConvexClient()` | `ConvexClient` | WebSocket client |
| `useConvexClientWithApi()` | `{ api, client }` | Client + typed `api` object for queries/mutations |

- Stores use imperative `client.query()` and `client.mutation()` because they manage their own caching and offline merge

### Auth Flow

Auth uses Better Auth with `convexClient()` and `crossDomainClient()` plugins (`composables/useAuth.ts`).

**Convex auth lifecycle** (`plugins/convex.ts`):
1. Eagerly call `client.setAuth(fetchToken)` if `hasAuthCookie()` && online — starts token fetch in parallel with session resolution
2. `fetchToken` calls `authClient.convex.token()` — the `crossDomainClient` plugin handles cookie forwarding automatically
3. `authReadyPromise` resolves when the first token fetch completes (success or failure); consumers (`loadDataFromDB`) await this before issuing queries
4. Session watch acts only on definitive results — ignores `isPending` and `error` states to prevent logout on network failures
5. `online` event re-creates `authReadyPromise` and calls `setAuth()` for fresh token
6. `ensureConvexAuth()` — called from callback page to set auth BEFORE SPA navigation

**Auth cookie** (`composables/useAuthCookie.ts`): `finapp.localAuthUid` cookie (document.cookie, 1yr max-age) — fast synchronous check for auth state. Not a security token, just a hint for middleware and plugin to skip network calls.

### Convex Deploy Notes

- Convex rejects hyphens in directory names (use underscores: `test_utils/`)
- Files with multiple dots (e.g., `setup.helper.ts`) are auto-skipped by Convex bundler — useful for test helpers
- Deploy with `--typecheck=disable` if there are pre-existing TS errors in Convex functions

## Local Development Setup

1. Install dependencies: `pnpm install`
2. Start Convex backend: `pnpm dev:convex` — connects to dev deployment, watches and auto-deploys changes
3. Start Nuxt frontend: `pnpm dev` — runs on http://localhost:3050
4. Both servers must run simultaneously (in separate terminals)

### First-time setup

Convex dev deployment env vars must be configured (one-time):

```sh
npx convex env set BETTER_AUTH_SECRET <value>
npx convex env set SITE_URL https://<dev-deployment>.eu-west-1.convex.site
npx convex env set FRONTEND_URL http://localhost:3050
npx convex env set GOOGLE_CLIENT_ID <value>
npx convex env set GOOGLE_CLIENT_SECRET <value>
npx convex env set OPENEXCHANGERATES_APP_ID <value>
```

CORS: dev deployment origins (`https://<deployment>.convex.site` and `https://<deployment>.convex.cloud`) must be listed in `convex/http.ts` `allowedOrigins`.

## Environment Variables

### Env files

- `.env` — dev deployment values, read by Nuxt (default `--dotenv`)
- `.env.local` — auto-created by `convex dev`, used by Convex CLI (gitignored)
- `.env.prod` — prod deployment values, used by `pnpm dev:prod`

All `.env*` files are gitignored except `.env.example`.

### Nuxt env vars (in `.env` / `.env.prod`)

- `CONVEX_DEPLOYMENT` — deployment identifier (used by Convex CLI)
- `VITE_CONVEX_URL` — Convex deployment URL (Nuxt frontend)
- `VITE_CONVEX_SITE_URL` — Convex site URL (Nuxt auth client)

### Convex backend env vars (set via `npx convex env set`)

- `BETTER_AUTH_SECRET` — secret key for Better Auth (**required** — without it all auth endpoints including CORS preflight will fail)
- `SITE_URL` — Convex site URL (Better Auth base URL)
- `FRONTEND_URL` — frontend URL for cross-domain auth
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth
- `OPENEXCHANGERATES_APP_ID` — exchange rates API

## Key Files

| What | Where |
|------|-------|
| App entry | `app/app.vue` |
| Theme logic | `app/plugins/theme.ts`, `app/app.vue` |
| Auth setup | `app/plugins/convex.ts`, `app/composables/useAuth.ts` |
| Auth cookie | `app/composables/useAuthCookie.ts` |
| Auth guard | `app/middleware/auth.global.ts`, `app/components/user/useGuard.ts` |
| Store sync | `app/composables/useStoreSync.ts` |
| Offline queue | `app/components/offline/helpers.ts` |
| Offline replay | `app/components/offline/replay.ts` |
| Statistics calc | `app/components/amount/getTotal.ts` |
| Convex schema | `convex/schema.ts` |
| Frontend IDs | `app/utils/convexId.ts`, `utils/generateId.ts` |
| Date utils | `app/components/date/utils.ts` |
| Menu state | `app/components/layout/useMenuData.ts` |
| Bottom sheet drag | `app/components/bottomSheet/useBottomSheetDrag.ts` |

## Documentation

Built with [Docus](https://docus.dev/) in `../docs/` directory. Content in `../docs/content/en/` and `../docs/content/ru/`.

For detailed architecture, auth flows, offline queue, and sync strategy see `../docs/content/en/3.technical/`.
