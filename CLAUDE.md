# Finapp

Personal finance app. Nuxt 4, Vue 3, Pinia, @nuxt/ui v4 (Tailwind CSS v4), Supabase (Postgres) backend, PowerSync offline-first sync, Supabase Auth (email/password + Google OAuth). Repo is a pnpm monorepo: `app/` (`@finapp/app`, Nuxt source under `app/app/`, Supabase config under `app/supabase/`, self-hosted PowerSync under `app/powersync/`) and `docs/` (`@finapp/docs`).

- Node.js >= v24.12.0
- Package manager: pnpm
- SPA mode (`ssr: false`)
- PWA with `generateSW` strategy from `@vite-pwa/nuxt`

## Commands

- `pnpm dev` - Nuxt dev server on port 3050
- Local backend (run once, in `app/`): `supabase start` (Postgres + Auth on :54321), then `docker exec -i supabase_db_app psql -U postgres -d postgres < supabase/powersync_setup.sql` (replication role + publication), then `docker compose -f powersync/docker-compose.yaml up -d` (PowerSync service on :8080)
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

## Backend: Supabase + PowerSync

- Postgres schema migration: `app/supabase/migrations/` - tables `categories`, `wallets`, `trns`, `user_settings`, `rates`. All id columns are `text` (client-generated UUIDs, no FK constraints - PowerSync upload order is not guaranteed). Columns are camelCase (quoted) to match the client item shapes. RLS scoped to `auth.uid()`. A trigger auto-creates `user_settings` on signup.
- PowerSync replication setup: `app/supabase/powersync_setup.sql` (a `powersync_role` with REPLICATION + BYPASSRLS, and a `powersync` publication).
- Self-hosted PowerSync service: `app/powersync/` (`docker-compose.yaml`, `config/service.yaml`, `config/sync-config.yaml`). It replicates the Supabase Postgres and validates Supabase JWTs via the JWKS endpoint. Sync rules are per-user (`WHERE "userId" = auth.user_id()`).
- Exchange rates: the `rates` table is populated server-side by the `fetch-rates` edge function (`app/supabase/functions/fetch-rates/`) - Coinbase (base, fiat + crypto) + OER (fiat overlay, needs `OPEN_EXCHANGE_RATES_KEY` secret) merged into one daily `source='merged'` row. Scheduled via `pg_cron` (migration `*_schedule_fetch_rates.sql`, 06:00 UTC), which reads the function URL + anon key from Vault secrets `project_url` / `anon_key`. Clients never write rates.
- `TrnType` in `app/app/components/trns/types.ts`: Expense (0), Income (1), Transfer (2).
- Adjustment is determined by `categoryId === 'adjustment'`, NOT by `TrnType`. It uses Expense or Income type, excluded from income/expense statistics. `categoryId` also holds the literal `'transfer'` for transfers.

### Client data layer

- `app/services/powersync/` - `AppSchema.ts` (client SQLite schema), `db.ts` (lazy `getPowerSyncDb()` singleton - dynamically imports `@powersync/web` to keep it out of the entry chunk - plus `connectPowerSync` / `watchTable` / `waitForFirstSync`), `connector.ts` (`SupabaseConnector`: `fetchCredentials` + `uploadData`; reachable only via the dynamic import in db.ts), `uploadReconcile.ts` + `uploadErrorHandler.ts` (auto-reconcile of fatally rejected uploads), `transforms.ts` (row↔item: booleans 0/1, `parentId` null↔0, `rates` JSON), `mutations.ts` (`upsertRow` / `deleteRow` / `deleteTrnsReferencing` - INSERT/UPDATE, never `ON CONFLICT`, since PowerSync tables are views).
- `app/app/composables/useSupabase.ts` - the supabase-js client + `useSupabaseAuth()` (reactive session, `signInWithPassword` / `signUp` / `signInWithGoogle` / `signOut`). `detectSessionInUrl: true` so the Google OAuth PKCE `?code=` is exchanged on return to `/login` (handled in `login.vue`).
- `app/app/plugins/powersync.client.ts` - eagerly opens local SQLite for an already-logged-in user, then connects/disconnects PowerSync as the auth session (`uid`) resolves. The synchronous route-guard gate is `hasPersistedSession()` (`app/app/composables/useAuthSession.ts`), which reads the persisted Supabase session from localStorage directly - no cookie.
- Stores hydrate via `db.watch('SELECT * FROM ...')` (one subscription handles both initial load and realtime, local + synced) and write via `upsertRow`/`deleteRow`. Demo mode bypasses PowerSync and uses in-memory + localforage.

## Documentation

- Setup, env vars, scripts: `README.md`
- Architecture, store pattern: `docs/content/en/3.reference/`

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
