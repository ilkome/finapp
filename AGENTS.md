# Finapp

Finapp is a pnpm monorepo with a Nuxt SPA in `app/` and the documentation site in `docs/`. The application uses Pinia, Nuxt UI, Supabase, and PowerSync for offline-first synchronization.

## Sources of truth

- Commands and workspace scripts: root and package-level `package.json` files.
- Local setup and environment variables: `README.md`.
- Application architecture and store patterns: `docs/content/en/3.reference/`.
- Testing strategy: `docs/content/en/3.reference/06.validation-strategy.md`.
- Deployment: `docs/content/en/2.development/05.deployment.md` and the matching Russian page.
- Dependency and framework versions: package manifests and `pnpm-lock.yaml`.

Do not duplicate those details here. Inspect their source when the task depends on current values.

## Code boundaries

- Application source lives under `app/app/`.
- Feature components, stores, forms, and types are grouped under `app/app/components/<feature>/`.
- Shared UI primitives live under `app/app/components/ui/`.
- `~/` resolves to `app/app/`.
- Framework-free utilities live under `app/utils/` and are imported explicitly through `~~/utils/...`.
- Supabase migrations and functions live under `app/supabase/`.
- PowerSync service configuration lives under `app/powersync/`; the client data layer lives under `app/services/powersync/`.

## Non-obvious constraints

- `nuxi typecheck` does not reliably catch deleted or renamed auto-imported components used in Vue templates. Search for the component name and verify the affected page at runtime.
- Keep non-trivial business rules in plain TypeScript when practical and unit-test them. Do not extract or add a full E2E test for a trivial template condition.
- Persisted typed state must backfill defaults on every load. When renaming a persisted field, cover a pre-rename payload in a migration test.
- PowerSync tables are SQLite views. Use the existing mutation helpers instead of `ON CONFLICT` writes.
- Entity IDs are client-generated text values. Do not add foreign-key assumptions that require upload ordering.
- Demo mode bypasses PowerSync and uses its own in-memory and localforage persistence path.
- The in-app review browser cannot start a module `SharedWorker`, so PowerSync's multi-tab worker dies there. Run `pnpm dev:review` (sets `VITE_POWERSYNC_SINGLE_TAB=1`) for that browser only; every other run must keep the shared-worker path.

## Pure UI views

- Components named `*View.vue` under `app/app/components/{stat,wallets,categories,trns,filter}/` are pure: props in, emits out. They never import a store, call `inject()`, `useRoute()`, or read app state; labels arrive as props and `t()` is only for static UI strings.
- A `View` prop type must be JSON-serializable (no refs, functions, class instances, or `Date`; dates are ms-epoch numbers). `stat/blocks/payload.ts` holds the zod schema for every block a producer can hand to `StatBlocksRenderer`; extend it when a view's props change.
- Sections and containers (`*Section.vue`, `stat/report/*`, `filter/Selected.vue`, ...) own every store and provider call and pass plain values down.
- Every `View` has a `*.view.test.ts` that mounts it from a fixture under `stat/fixtures/` (vitest project `view`).

## Domain invariants

- `TrnType` values are Expense `0`, Income `1`, and Transfer `2`.
- Adjustment is not a transaction type. It is an Expense or Income with `categoryId === 'adjustment'`.
- Transfers use `categoryId === 'transfer'`.
- Adjustments affect wallet balances but are excluded from regular income and expense statistics.

## Pushes to dev

- Before every push to `dev`, increment the beta version in `app/package.json` to the next sequential value.
- Commit the version change separately using `chore(app): bump version to <version>`.
- Push the implementation commits and the version commit together.

## Knowledge graph

When `graphify-out/graph.json` exists, use `graphify query`, `graphify path`, or `graphify explain` for broad codebase discovery. Use the source code for final verification. Update the graph after material code changes when the graph tooling is available.
