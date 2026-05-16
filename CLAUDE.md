# Finapp

Personal finance app. Nuxt 4, Vue 3, Pinia, @nuxt/ui v4 (Tailwind CSS v4), Convex backend, Better Auth. Repo is a pnpm monorepo: `app/` (`@finapp/app`, Nuxt source under `app/app/`, Convex backend under `app/convex/`) and `docs/` (`@finapp/docs`).

- Node.js >= v24.12.0
- Package manager: pnpm
- SPA mode (`ssr: false`)
- PWA with `generateSW` strategy from `@vite-pwa/nuxt`

## Commands

- `pnpm dev` - Nuxt dev server on port 3050
- `pnpm dev:convex` - Convex backend (watches and auto-deploys changes)
- Both must run simultaneously in separate terminals
- `pnpm build` - SPA build
- `pnpm generate` - static generation
- `pnpm lint` / `pnpm lint:fix` - ESLint
- `pnpm test` - Vitest
- `pnpm docs:dev` / `pnpm docs:build` - docs site

## Conventions

- Components: PascalCase, grouped by feature in `components/[feature]/`
- UI primitives in `components/ui/`
- Imports use `~/` alias (resolves to `app/app/`)
- ESLint flat config with `@antfu/eslint-config`, Perfectionist for sorting
- Prettier with Tailwind plugin, single quotes, no semicolons, trailing commas
- i18n: `no_prefix` strategy, two locales (en-US, ru-RU)
- Always run `pnpm lint:fix` before committing

## Convex Backend

- Schema in `app/convex/schema.ts`: `categories`, `wallets`, `trns`, `userSettings`, `rates`, `syncMeta`, `tombstones`
- `TrnType` enum in `convex/validators.ts` (re-exported from `convex/shared.ts`): Expense (0), Income (1), Transfer (2)
- Adjustment is determined by `categoryId === 'adjustment'`, NOT by `TrnType`. It uses Expense or Income type, excluded from income/expense statistics
- Auth: `@convex-dev/better-auth` with `cors: true` in `http.ts`
- Generated types in `convex/_generated/` - do not edit
- `convex/tsconfig.json` is separate from the app tsconfig

### Convex Client Access

Both composables live in `app/app/composables/useConvex.ts`:

| Composable | Returns | Purpose |
|------------|---------|---------|
| `useConvexClient()` | `ConvexClient` | WebSocket client |
| `useConvexClientWithApi()` | `{ api, client }` | Client + typed `api` object for queries/mutations |

Stores use imperative `client.query()` and `client.mutation()` because they manage their own caching and offline merge.

## Documentation

- Setup, env vars, scripts: `README.md`
- Architecture, store pattern, sync, offline queue, auth flow: `docs/content/en/3.reference/`
- Convex CLI gotchas, Better Auth incident fixes: `docs/content/en/2.development/08.troubleshooting.md`
