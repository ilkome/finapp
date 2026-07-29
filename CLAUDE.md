# Finapp

Personal finance app. Nuxt 4, Vue 3, Pinia, @nuxt/ui v4 (Tailwind CSS v4), Supabase (Postgres) backend, PowerSync offline-first sync, Supabase Auth (email/password + Google OAuth). Repo is a pnpm monorepo: `app/` (`@finapp/app`, Nuxt source under `app/app/`, Supabase config under `app/supabase/`, self-hosted PowerSync under `app/powersync/`) and `docs/` (`@finapp/docs`).

- Node.js >= v24.12.0
- Package manager: pnpm
- SPA mode (`ssr: false`)
- PWA with `generateSW` strategy from `@vite-pwa/nuxt`

## Commands

- `pnpm dev` - Nuxt dev server on port 3050 (local backend). `pnpm dev:dev` - same, pointed at the **dev cloud** backend (`app/.env.dev`, pulled from Vercel Preview env); `pnpm dev:prod` - prod backend.
- Local backend (run once, in `app/`): `supabase start` (Postgres + Auth on :54321), then `docker exec -i supabase_db_app psql -U postgres -d postgres < supabase/powersync_setup.sql` (replication role + publication), then `docker compose -f powersync/docker-compose.yaml up -d` (PowerSync service on :8080)
- `pnpm build` / `pnpm generate` - both run `nuxt generate` (static SPA, output `.output/public`)
- `pnpm lint` / `pnpm lint:fix` - ESLint
- `pnpm test` - Vitest (**watch mode** - use `pnpm --filter @finapp/app exec vitest run` for a one-shot)
- `pnpm verify` - the pre-push gate: `lint:fix` + `typecheck` + one-shot Vitest, in one command
- `pnpm test:e2e` - Playwright dev server, `demo` project (all specs incl. `stat-smoke`, `budgets-smoke`); `pnpm test:e2e:prod` - Playwright prod build, **only** `context-menu-smoke`
- `pnpm docs:dev` / `pnpm docs:build` - docs site

## Deploy

- Single Vercel project for the app, two environments by git branch: `main` → Production (prod Supabase backend), any other branch (use `dev`) → Preview (per-branch preview URL on the test Supabase backend). Pushing a branch auto-builds its Preview. Concrete project/backend identifiers live in Vercel env + the gitignored `.vercel/`, not here.
- Manual deploys: run `vercel deploy` from the monorepo root `apps/mono` (never from `app/`; project root directory is `app`). No flag = Preview, `--prod` = Production.

## Conventions

- Components: PascalCase, grouped by feature in `components/[feature]/`
- UI primitives in `components/ui/`
- Imports use `~/` alias (resolves to `app/app/`)
- Framework-free code (no Vue, no Nuxt) lives in `app/utils/`, imported explicitly via `~~/utils/...` - never via Nuxt's implicit `~/utils` auto-import, so a generic name like `getStartOf` stays traceable at the callsite
- ESLint flat config with `@antfu/eslint-config`, Perfectionist for sorting
- Prettier with Tailwind plugin, single quotes, no semicolons, trailing commas
- i18n: `no_prefix` strategy, two locales (en-US, ru-RU)
- Always run `pnpm lint:fix` before committing. It **rewrites files** (Perfectionist re-sorts object keys and imports), so re-read a file after running it if you plan to edit it again
- `nuxi typecheck` does not check templates: a deleted or renamed auto-imported component fails only at runtime. After removing one, grep its auto-import name across `app/app/`
- There are no visual or component tests. Green `typecheck` + `test` says nothing about the UI; anything that moves pixels needs a pass in the running app
- CI (`.github/workflows/ci.yml`) gates on: `checks` (lint + typecheck + unit tests), `deps` (single reka-ui version), `e2e-prod` (prod-build context-menu smoke). The dev-server e2e suite (`test:e2e`, demo project) is **not** in CI yet - run it locally after UI changes
- Behavioural rules hidden inside `.vue` templates escape the test suite. Prefer extracting `(input) -> output` logic into a plain `.ts` module next to the component and unit-testing it there (see `trns/getTrns.ts`, `amount/getTotal.ts`)
- A composable that persists a typed shape to `localStorage` must backfill defaults on **every** load, not just the first (`defu(stored, defaults)`), or a payload stored before a key rename comes back missing the new key. Seeding `useStorage(key, {})` defeats `mergeDefaults` - seed it with the real defaults. When renaming a persisted key, ship a test that seeds a pre-rename payload (template: `stat/date/useStatDate.test.ts`)

## Beta versioning (dev)

- A **user-facing feature** commit on `dev` bumps `app/package.json` to the next `8.3.0-beta.N` and carries a `(beta N)` tag in the commit subject. `/settings` shows `pkg.version`. Refactor / move / test-only commits do **not** bump.
- Batch one beta bump at the end of a body of work unless told otherwise. Push to `origin dev` only when asked.

## Working from plans

- Feature/refactor work is specified in `plans/*.md` (gitignored - local only, so a subagent won't find them via git history; pass the path explicitly). Each plan's header should carry a `Status:` line (proposed / implemented / deferred) - keep it current, and verify status against `git log` + the code before starting, since a plan may have been shipped without its header updated.
- To implement a plan, act as an **orchestrator**: read `ORCHESTRATOR.md` (repo root) first and follow it - subagents write code, you plan, review the diff yourself before committing, and commit one step at a time.
- Spawn those subagents as `subagent_type: "coder"` (`.claude/agents/coder.md` pins sonnet + `effort: low` + the mandatory rule block). A plain `general-purpose` agent inherits the session's effort instead, which defeats the high-effort-orchestrator / low-effort-coder split.

## Backend: Supabase + PowerSync

- Postgres schema migration: `app/supabase/migrations/` - tables `categories`, `wallets`, `trns`, `user_settings`, `rates`. All id columns are `text` (client-generated UUIDs, no FK constraints - PowerSync upload order is not guaranteed). Columns are camelCase (quoted) to match the client item shapes. RLS scoped to `auth.uid()`. A trigger auto-creates `user_settings` on signup.
- PowerSync replication setup: `app/supabase/powersync_setup.sql` (a `powersync_role` with REPLICATION + BYPASSRLS, and a `powersync` publication).
- Self-hosted PowerSync service: `app/powersync/` (`docker-compose.yaml`, `config/service.yaml`, `config/sync-config.yaml`). It replicates the Supabase Postgres and validates Supabase JWTs via the JWKS endpoint. Sync rules are per-user (`WHERE "userId" = auth.user_id()`).
- Exchange rates: the `rates` table is populated server-side by the `fetch-rates` edge function (`app/supabase/functions/fetch-rates/`) - Coinbase (base, fiat + crypto) + OER (fiat overlay, needs `OPEN_EXCHANGE_RATES_KEY` secret) merged into one daily `source='merged'` row. Scheduled via `pg_cron` (migration `*_schedule_fetch_rates.sql`, 06:00 UTC), which reads the function URL + anon key from Vault secrets `project_url` / `anon_key`. Clients never write rates.
- `TrnType` in `app/app/components/trns/types.ts`: Expense (0), Income (1), Transfer (2).
- Adjustment is determined by `categoryId === 'adjustment'`, NOT by `TrnType`. It uses Expense or Income type, excluded from income/expense statistics. `categoryId` also holds the literal `'transfer'` for transfers.

### Client data layer

- `app/services/powersync/` - `AppSchema.ts` (client SQLite schema), `db.ts` (lazy `getPowerSyncDb()` singleton - dynamically imports `@powersync/web` to keep it out of the entry chunk - plus `connectPowerSync` / `pausePowerSync` / `watchTable` / `waitForFirstSync`), `connector.ts` (`SupabaseConnector`: `fetchCredentials` + `uploadData`; reachable only via the dynamic import in db.ts), `uploadReconcile.ts` + `uploadErrorHandler.ts` (auto-reconcile of fatally rejected uploads), `transforms.ts` (row↔item: booleans 0/1, `parentId` null↔0, `rates` JSON), `mutations.ts` (`upsertRow` / `deleteRow` / `deleteTrnsReferencing` - INSERT/UPDATE, never `ON CONFLICT`, since PowerSync tables are views).
- `app/app/composables/useSupabase.ts` - the supabase-js client + `useSupabaseAuth()` (reactive session, `signInWithPassword` / `signUp` / `signInWithGoogle` / `signOut`). `detectSessionInUrl: true` so the Google OAuth PKCE `?code=` is exchanged on return to `/login` (handled in `login.vue`).
- `app/app/plugins/powersync.client.ts` - eagerly opens local SQLite for an already-logged-in user, then connects PowerSync when the auth session (`uid`) resolves. On involuntary session loss (token revoked/expired) it pauses sync (`pausePowerSync`: keeps local SQLite + the unsynced queue) rather than wiping, surfacing a re-auth toast when writes are pending; only an explicit sign-out (`useUserStore.signOut`) wipes. The synchronous route-guard gate is `hasPersistedSession()` (`app/app/composables/useAuthSession.ts`), which reads the persisted Supabase session from localStorage directly - no cookie. Local row writes stamp `userId` via `resolveWriteUid` (same file), which falls back to the persisted uid so an offline cold start before the session resolves doesn't write an empty `userId` (which RLS would reject).
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
