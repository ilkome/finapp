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
- PowerSync tables are SQLite views. Use the existing mutation helpers instead of `ON CONFLICT` writes. Synced columns are declared once in `app/services/powersync/columns.ts`; a typecheck guard keeps it equal to the generated Postgres types (`pnpm db:types`).
- Entity ids are client-generated UUIDv7 (`generateId`); a record that is one per (user, thing) has a deterministic id. Synced tables have no foreign keys and no cross-row unique constraints: readers skip orphans.
- Demo mode bypasses PowerSync and uses its own in-memory and localforage persistence path.
- A comment never carries a count, size, duration or default that is defined in code; it names the setting instead.
- `reka-ui` is pinned to the version `@nuxt/ui` pins (`pnpm --filter @finapp/app check:deps`) and carries `patches/reka-ui@2.10.5.patch` for the Drawer (unovue/reka-ui#2982: swipes start on buttons, `data-reka-swipe-ignore`) plus our fixes listed next to it in `pnpm-workspace.yaml` (kept-mounted drawers, nested swipe progress, `modal` switch, touch `contextmenu` left unprevented). Keep them when upgrading unless the release fixes the same behavior. Never pass `present` to `DrawerContent` yourself: it falls through to reka's `Presence` and unmounts kept-mounted drawers. Once a release includes #2982, keep only our parts of the patch.
- The in-app review browser cannot start a module `SharedWorker`, so PowerSync's multi-tab worker dies there. Run `pnpm dev:review` (sets `VITE_POWERSYNC_SINGLE_TAB=1`) for that browser only; every other run must keep the shared-worker path.

## Pure UI views

- Components named `*View.vue` under `app/app/components/{stat,wallets,categories,trns,filter,loans}/` are pure: props in, emits out. They never import a store, call `inject()`, `useRoute()`, or read app state; labels arrive as props and `t()` is only for static UI strings.
- A `View` prop type must be JSON-serializable (no refs, functions, class instances, or `Date`; dates are ms-epoch numbers).
- Sections and containers (`*Section.vue`, `stat/report/*`, `filter/Selected.vue`, ...) own every store and provider call and pass plain values down.
- Every `View` has a `*.view.test.ts` that mounts it from a JSON fixture: `stat/fixtures/` for stat, wallets, categories, trns and filter views, `demo/loans/` for loans views (vitest project `view`).

## Feature flags

- An in-development feature hides behind `useFeature(id)` from `app/app/composables/useFeatures.ts`: per device, off by default, toggled in Settings → Beta.
- A flag gates UI entry points only (menu items, routes, blocks, form fields). Data, sync, stores, and calculations stay on.
- When the feature ships, delete its id and every `useFeature('<id>')` check.

## Domain invariants

- `TrnType` values are the strings `expense`, `income`, `transfer`, `adjustment`.
- A transaction moves money out of a wallet (`from_wallet_id` / `from_amount`), into one (`to_wallet_id` / `to_amount`), or both. Expense: from side and a category; income: to side and a category; adjustment: exactly one side, no category; transfer: at least one side (a missing side is outside the app), two different wallets, no category.
- A wallet balance is the sum of what flows in minus what flows out, for every type.
- Transfers and adjustments are told apart by `type`, never by a category. Adjustments affect balances but stay out of income and expense statistics.
- `loan_interest` and `loan_fine` are reserved category ids without a row: ordinary expenses that count in statistics. The look of built-ins and of the transfer / adjustment types lives in `display_overrides`.
- Money is an integer in the currency's minor units; the scale per currency is pinned in `app/utils/money/scale.ts`. Convert between currencies unrounded and round once at the end of a sum.
- Days are civil days (UTC-midnight ms); instants are ms and end in `_at`.
- Wallet type `credit_card` is a credit card, `loan` is a loan contract; `isCreditProduct` covers both.
- A loan payment is a transfer into the credit wallet; its interest is a separate expense in `loan_interest`.
- The bank's figures for a wallet live in `bank_reports` (id = wallet id), every field optional: a feature reading one falls back to its own calculation.
- The full data-model rules (storage, ids, conflicts, naming, migrations): `docs/content/en/3.reference/` "Data model".

## Pushes to dev

- Before every push to `dev`, increment the beta version in `app/package.json` to the next sequential value.
- Commit the version change separately using `chore(app): bump version to <version>`.
- Push the implementation commits and the version commit together.

## Knowledge graph

When `graphify-out/graph.json` exists, use `graphify query`, `graphify path`, or `graphify explain` for broad codebase discovery. Use the source code for final verification. Update the graph after material code changes when the graph tooling is available.
