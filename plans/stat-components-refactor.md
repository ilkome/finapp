# Statistics components refactor plan

## Status

Implemented on 2026-08-13. The primary stages and follow-up items are complete. Unit, type, lint, production build, and production smoke checks pass. The dev-only measured virtual-feed browser matrix remains pending because the Nuxt watcher repeatedly fails with `EMFILE`; production intentionally omits those development counters.

## Problem statement

`components/stat` now has a clear pure boundary for the virtual feed, but the rest of the statistics feature still contains several large reactive graphs and repeated projections:

- `Layout.vue` creates expense and income report contexts even when the split view is inactive.
- `useStatReport.ts` owns transaction selection, totals, forecast composition, chart series, category drill state, and user actions in one composable.
- the report builds three closely related selected-ID arrays through separate `getStoreTrnsIds` calls;
- `useCategoriesBreakdown.ts` independently builds grouped and ungrouped category data from the same transactions;
- `TrnsVirtualList.vue` still owns virtualizer setup, DOM geometry, input-direction detection, lifecycle listeners, viewport filling, and feed reconciliation;
- `config/View.vue` uses string paths and unsafe casts despite already having a panel registry.

The refactor should reduce repeated reactive work and clarify ownership without creating many single-function modules.

## Goals

- Mount report contexts only for the active layout.
- Give `useStatReport` a small orchestration role while preserving its public return shape during migration.
- Traverse and sort report transaction IDs once per logical report rebuild where possible.
- Build category projections from one shared aggregation per transaction dataset.
- Move DOM scroll lifecycle out of `TrnsVirtualList.vue` without changing virtual-feed behavior.
- Make the configuration panel registry type-safe.
- Preserve every current statistic, forecast, filter, chart, category drill, scrolling, and editor interaction.
- Add measurement before claiming a performance improvement.

## Non-goals

- Do not rewrite `useTrnsStore`, PowerSync reconciliation, optimistic writes, or persistence.
- Do not replace `filterTrnsIds` with stat-specific filtering rules.
- Do not change date semantics, stored date parameters, or interval navigation.
- Do not replace TanStack Virtual or document scrolling.
- Do not merge cohesive pure modules only to reduce the file count.
- Do not introduce a global cache, worker, event bus, or deep reactive transaction map.
- Do not change the public `StatReportContext` shape until all current consumers have migrated.

## Architecture constraints

- Vue composables must not be called conditionally from the same setup function. Conditional report graphs must be isolated behind conditionally mounted child components.
- Transaction filtering must preserve the transfer-category behavior implemented in `components/trns/getTrns.ts`.
- Date filtering must happen before category filtering. The existing category/date intersection regression must remain covered.
- Forecast IDs and items are a separate derived dataset and must never be written into the transaction store.
- Actual totals, forecast totals, merged chart data, and focused-category pie data have different inclusion rules. The refactor must not silently merge those domains.
- Category values must preserve current currency conversion and excluded-category behavior.
- KeepAlive activation and deactivation must leave exactly one balanced set of viewport observers and window listeners.
- The existing feed counters, semantic row keys, sparse loaded offsets, and active-period state remain authoritative.

## Target structure

Keep the number of production modules small and organized by responsibility:

```text
components/stat/
  Layout.vue
  Report.vue
  TrnsVirtualList.vue
  useStatReport.ts                 facade and report interaction state
  useStatInfinitePeriods.ts       reactive feed state
  useStatFeedViewport.ts          DOM geometry and scroll lifecycle
  report/
    Split.vue                     split-only report contexts and layout
    useStatReportData.ts          transaction selection, intervals, totals, forecast dataset
    useStatReportChart.ts         chart series and focused category projection
  categories/
    categoryViews.ts              one aggregation into grouped, ungrouped, and focused views
```

Do not create separate modules for every computed property. Feature-local types that have one consumer should stay beside their implementation. Shared public contracts remain in `components/stat/types.ts`.

## Stage 0. Record the current behavior and cost

Before moving code, add development-only instrumentation or test spies for:

- mounted `useStatReport` context count;
- `getStoreTrnsIds` calls per active report after create, edit, delete, date change, category filter, and type filter;
- report data rebuild duration and visited transaction count;
- category aggregation count, duration, and visited transaction count;
- active viewport listener and `ResizeObserver` count across KeepAlive cycles.

Record the baseline for:

- summary, expense, income, and split tabs;
- forecast modes `off`, `separate`, and `merged`;
- no category filter, parent category filter, and child category filter;
- selected interval and whole range;
- full demo history.

Instrumentation must be development-only and must not expose user data.

Exit criterion: the baseline identifies which projections actually run for each visible layout and gives exact rebuild counts for one transaction mutation.

## Stage 1. Mount split report contexts only in split mode

Add `components/stat/report/Split.vue` and move into it:

- date-bounded transaction IDs;
- expense and income ID selection;
- the two `useStatReportContext` calls;
- the split chart, date, sums, and details template.

`Layout.vue` should only select between:

- `StatReportSplit` for `effectiveTab === 'split'`;
- `StatReport` for all other tabs.

This child-component boundary satisfies Vue's composable rules without keeping inactive split contexts alive.

Required tests:

- summary, expense, and income mount exactly one report context;
- split mounts exactly two report contexts;
- switching into and out of split disposes the previous contexts;
- filter, date, forecast, and storage state remain correct after tab changes;
- mobile continues forcing the combined summary view.

Exit criterion: no split-only context, storage binding, or forecast graph exists while split is inactive.

## Stage 2. Separate the report data pipeline from chart projection

Keep `useStatReport.ts` as the compatibility facade. Move cohesive internal work into two composables.

### `report/useStatReportData.ts`

Own:

- date-range transaction membership;
- category and type selection state;
- excluded-category rules;
- interval bucketing;
- actual totals and average totals;
- forecast data composition;
- selected, category-filtered, and quick-filtered transaction IDs.

### `report/useStatReportChart.ts`

Own:

- category breakdown type;
- category chart filter and grouping;
- regular, category, separate-forecast, and merged chart series;
- chart X-axis labels;
- focused-category pie data;
- selected-interval mark area.

`useStatReport.ts` should retain:

- persisted filtered type;
- category and child-category interaction state;
- click handlers;
- composition of the data and chart results;
- the existing return shape.

Do not duplicate transaction-filter semantics. If one traversal needs reusable predicates, extract a shared filter matcher or compiled filter from `components/trns/getTrns.ts` and make both `filterTrnsIds` and the report builder use it.

Required characterization tests before moving logic:

- date range is applied before a category filter;
- transfer-category rows keep their current type behavior;
- excluded categories affect totals and charts but not transaction-list membership;
- selected interval and whole range produce the same IDs as the current implementation;
- forecast off, separate, and merged preserve their current totals and series;
- parent and child category drills preserve chart and list membership;
- split expense and income outputs remain isolated.

Exit criterion: the facade is substantially smaller, consumers require no simultaneous migration, and all data/chart decisions have focused tests.

## Stage 3. Build related report ID views in one traversal

The current report requests three sorted variants of the same base transaction set. Replace independent filtering and sorting with one report-selection builder.

The builder should accept:

- date-bounded source IDs;
- transaction items;
- selected transaction types;
- effective category IDs;
- quick category IDs;
- already expanded transactible category sets.

It should return:

```ts
type StatReportSelection = {
  selectedIds: TrnId[]
  filteredIds: TrnId[]
  quickFilteredIds: TrnId[]
}
```

Required behavior:

1. Preserve the current date-descending order and equal-date stability.
2. Visit each source ID once.
3. Apply type membership once.
4. Append matching IDs to the effective and quick category outputs without sorting them again.
5. Preserve array references only when a proven memoization boundary makes that safe. Do not add identity caching without invalidation tests.

Prefer reusing an extracted matcher from `filterTrnsIds` over copying wallet, category, recurrence, transfer, and type rules.

Exit criterion: one active report performs one sorted traversal for the three list projections, with output equality against the previous implementation.

## Stage 4. Build category views from one shared aggregation

Replace repeated calls to `computeCategoriesWithData` in `useCategoriesBreakdown.ts` with a pure category-view builder.

The builder should:

1. Collect eligible leaf-category transaction IDs once.
2. Compute each leaf category value once.
3. Derive the ungrouped ordered view from leaf values.
4. Derive the grouped view by aggregating the same leaf values into parents.
5. Derive focused children by filtering the ungrouped view.
6. Add empty preconfigured categories only for the view that requests them.

Keep category chart aggregation separate initially. It operates per interval and has different highlighted-category rules. Unify it with UI category aggregation only if a later profile proves the duplicated work meaningful and the shared model stays simpler.

Required tests:

- grouped and ungrouped outputs match current fixtures;
- positive, negative, and zero-value ordering is unchanged;
- excluded, system, missing, empty, parent, and child categories are preserved correctly;
- a focused parent shows only its children;
- favorite, recent, preconfigured, and selected empty categories keep their current ordering;
- transaction visits and leaf-value computations are linear in the selected ID count.

Exit criterion: grouped and ungrouped consumers share one collection and one leaf-value computation per rebuild.

## Stage 5. Extract the virtual-feed viewport coordinator

Add one `useStatFeedViewport.ts` composable. Do not recreate the deleted collection of small scroll helper files.

The composable should own:

- sticky-summary and viewport geometry measurement;
- `ResizeObserver` setup and teardown;
- wheel, touch, keyboard, scrollbar, scroll, and scrollend listeners;
- animation-frame scheduling for geometry and active-period updates;
- input-direction state;
- viewport filling and measurement settling;
- feed reset, queued reset, and landing-scroll restoration;
- report-scope and KeepAlive lifecycle coordination.

`TrnsVirtualList.vue` should retain:

- candidate and local transaction filters;
- `useStatInfinitePeriods` creation;
- TanStack virtualizer configuration;
- row estimation, keys, measurement binding, and rendering;
- development attributes displayed by the template.

Do not change the pure decisions in `statFeed.ts` during this stage.

Required tests:

- observer and listener registration is balanced after repeated mount, activate, deactivate, and unmount cycles;
- identical geometry cannot commit repeated active-period changes;
- programmatic landing, resize, and measurement do not load history;
- forward wheel, touch, keyboard, and scrollbar input still load and change periods;
- current browser matrix remains green at `390x844`, `768x800`, `1024x800`, and `1440x900`;
- editor open/close and mobile browser Back preserve the current scroll behavior.

Exit criterion: `TrnsVirtualList.vue` is primarily virtualizer configuration and rendering, while one cohesive composable owns browser lifecycle.

## Stage 6. Make the configuration registry type-safe

Replace untyped `showPath` and `countPath` access with typed panel operations. Each registry entry should expose only the operations it supports, for example:

```ts
type PanelDefinition = {
  getCount?: (config: MiniItemConfig) => number
  getIsShow: (config: MiniItemConfig) => boolean
  setIsShow: (config: MiniItemConfig, value: boolean) => Partial<MiniItemConfig>
  titleKey: string
}
```

Remove `as boolean` and `as never` from `config/View.vue`.

Adding the panel component to the registry is optional. Use a dynamic component only if Nuxt auto-import behavior, bundle output, and component state remain correct. Type safety is the objective, not eliminating every `v-if`.

Required tests:

- every panel reads and updates its own `isShow` field;
- counts and subtitles use the correct config field;
- unavailable active panels return to root;
- panel toggles preserve unrelated nested config values;
- forecast and transaction rows remain special root actions.

Exit criterion: adding or renaming a panel field fails at TypeScript or schema tests instead of relying on a runtime string path.

## Performance and correctness budgets

- Exactly one report context is mounted for summary, expense, or income.
- Exactly two report contexts are mounted for split.
- At most one sorted report-selection traversal per active context and logical transaction-map replacement.
- Category UI aggregation visits selected transaction IDs once per rebuild.
- Each leaf category total is computed at most once per category-view rebuild.
- No report or category computation creates a browser main-thread task longer than 50 ms on the full demo history.
- Existing virtual-feed index and row rebuilds remain below 50 ms.
- At most 120 virtual row wrappers remain mounted after full history loading.
- No listener or observer growth across ten KeepAlive cycles.
- No new hydration warning, reactive recursion warning, browser console error, scroll jump, blank frame, chart mismatch, or forecast double count.

## Verification strategy

Run focused checks after each stage:

```sh
pnpm --filter @finapp/app exec vitest run app/components/stat/useStatReport.test.ts
pnpm --filter @finapp/app exec vitest run app/components/stat/categories/collectAndGroup.test.ts
pnpm --filter @finapp/app exec vitest run app/components/stat/chart/categoryBreakdown.test.ts
pnpm --filter @finapp/app exec vitest run app/components/stat/statFeed.index.test.ts app/components/stat/statFeed.rows.test.ts app/components/stat/statFeed.scope.test.ts app/components/stat/statFeed.scroll.test.ts
pnpm --filter @finapp/app exec vitest run app/components/stat/config/schema.test.ts app/components/stat/config/useStatConfig.test.ts
```

Run project checks before completion:

```sh
pnpm lint:fix
pnpm typecheck
NODE_OPTIONS=--localstorage-file=/tmp/finapp-vitest-localstorage-stat-refactor pnpm --filter @finapp/app exec vitest run --no-file-parallelism
pnpm --filter @finapp/app build
pnpm --filter @finapp/app exec playwright test tests/e2e/stat-smoke.spec.ts tests/e2e/stat-virtual-list.spec.ts
```

Browser verification must use a current build. If the development watcher hits `EMFILE`, use the generated static artifact with an SPA-capable server instead of an older cached PWA build.

## Likely file changes

Primary scope:

- `app/app/components/stat/Layout.vue`
- `app/app/components/stat/report/Split.vue` new
- `app/app/components/stat/useStatReport.ts`
- `app/app/components/stat/useStatReport.test.ts`
- `app/app/components/stat/report/useStatReportData.ts` new
- `app/app/components/stat/report/useStatReportChart.ts` new
- `app/app/components/stat/categories/useCategoriesBreakdown.ts`
- `app/app/components/stat/categories/useStatCategories.ts`
- `app/app/components/stat/categories/collectAndGroup.ts`
- `app/app/components/stat/categories/collectAndGroup.test.ts`
- `app/app/components/stat/TrnsVirtualList.vue`
- `app/app/components/stat/useStatFeedViewport.ts` new
- `app/app/components/stat/config/View.vue`
- `app/app/components/stat/config/panels/registry.ts`
- `app/app/components/stat/config/schema.test.ts`
- `app/tests/e2e/stat-smoke.spec.ts`
- `app/tests/e2e/stat-virtual-list.spec.ts`

Conditional shared-filter scope:

- `app/app/components/trns/getTrns.ts`
- focused `getTrns` tests if a reusable matcher is extracted.

## Rollout order

Implement and verify each stage independently:

1. Baseline instrumentation.
2. Split-only component boundary.
3. Report data/chart separation with compatibility facade.
4. One-traversal report selection.
5. Shared category aggregation.
6. Viewport coordinator extraction.
7. Typed configuration registry.

Do not combine the report pipeline, viewport lifecycle, and config registry into one unreviewable change. Preserve the working tree between stages and keep each stage revertible.

## Completion criteria

The refactor is complete when:

- inactive layouts do not allocate report contexts;
- report selection, totals, forecasts, and chart projection have explicit ownership;
- related transaction and category views no longer repeat equivalent full-dataset work;
- `TrnsVirtualList.vue` no longer owns raw browser lifecycle wiring;
- configuration panel updates are type-safe;
- all unit, type, build, and browser checks pass;
- profiling confirms the budgets above on the current full demo history;
- no conditional optimization is implemented without a measured need.

## Implemented follow-up refactors

The primary refactor exposed a smaller cleanup package. The items below were implemented on 2026-08-13 without changing the selected document-scroll architecture or transaction-store mutation model.

### Follow-up 1. Remove the header transaction selection used as a boolean

`Header.vue` currently builds `categoryConfigTrnsIds` with date, type, and sorting work. `config/View.vue` only checks whether `selectedTrnsIds` is defined and does not consume the IDs.

Replace the array prop with an explicit boolean capability such as `hasTrnsConfig`.

Required behavior:

- configuration rows remain available on the same pages;
- category, chart, transaction, and forecast controls keep their current visibility;
- opening or closing the configuration panel does not trigger a transaction traversal;
- no sorted transaction selection is created only to communicate component capability.

Exit criterion: the statistics header performs no transaction filtering or sorting for configuration-panel availability.

### Follow-up 2. Preserve the sorted report-selection boundary across category drills

`buildStatReportSelection` currently receives effective and quick category IDs. Changing either category drill invalidates the whole computed value and sorts the unchanged source IDs again.

Introduce a proven computed boundary that stores the sorted, type-selected records needed by the projections, for example `{ id, categoryId }`. Category projections should derive their ID arrays from that sequence without reading the transaction map or sorting again.

Required behavior:

- transaction-map, date-range, selected-interval, and type changes rebuild the sorted sequence;
- parent-category, child-category, and quick-category changes do not sort the source again;
- selected, effective-filtered, and quick-filtered arrays preserve current order and transfer-category behavior;
- equal-date ordering remains stable;
- no global or identity cache is introduced.

Required tests:

- a category drill changes only the relevant projected arrays;
- sort and transaction-item read spies remain unchanged across category-only updates;
- transaction-map replacement invalidates the sorted boundary exactly once;
- output equality remains covered for empty, parent, and child category filters.

Exit criterion: category-only interactions perform projection work but no source sorting or repeated transaction-map lookup.

### Follow-up 3. Share category views between rounds and breakdown

`RoundSection.vue` still uses `useStatCategories`, while `useCategoriesBreakdown.ts` uses `categoryViews.ts`. When both surfaces consume the same selected IDs without a quick filter, the app performs two category collections and two sets of leaf-value computations.

Lift the base category views to the nearest shared report boundary or provide them through a feature-local context. Derive round-specific favorites, recent categories, selected empty categories, and grouping from the shared leaf values.

After all consumers migrate:

- remove `useStatCategories.ts` if it has no remaining consumers;
- remove or fold `flattenCategoriesWithValues` and `groupCategoriesWithValues` into the single category-view implementation;
- keep chart category aggregation separate because it operates per interval and has different highlighted-category rules.

Required tests:

- mounting rounds and breakdown together visits selected transaction IDs once;
- each leaf total is computed once for the shared dataset;
- favorites, recent, preconfigured, selected empty, grouped, ungrouped, and focused views preserve their order;
- a quick-category dataset that genuinely differs from the round dataset receives its own aggregation.

Exit criterion: equal round and breakdown datasets share collection and leaf-value computation, while different datasets remain isolated.

### Follow-up 4. Finish configuration typing and narrow the facade

The panel registry is typed, but `config/Switch.vue` and the initial `props` application in `useStatConfig.ts` still use string paths and unsafe casts. Replace them with typed operations or explicit field bindings.

Also replace the `...data` and `...chart` spreads in `useStatReport.ts` with the explicit compatibility contract used by current consumers. Internal chart and data computed values should not become public context fields accidentally.

Required tests:

- every configuration switch updates its declared boolean and preserves sibling fields;
- invalid configuration paths fail at TypeScript instead of runtime;
- `StatReportContext` exposes only the intended consumer contract;
- existing report, chart, split, and configuration tests require no behavior changes.

Exit criterion: no `as boolean`, `as never`, or runtime dot-path mutation remains in statistics configuration, and report internals stay private.

## Follow-up non-goals

- Do not split `statFeed.ts`; its pure index, row, scope, and scroll decisions are cohesive and independently tested.
- Do not split `useStatFeedViewport.ts` back into small listener and geometry modules.
- Do not split `useStatDate.ts` only because of its line count.
- Do not merge interval chart category aggregation with UI category views without profile evidence.
- Do not add a global cache, event bus, worker, or deep reactive transaction map.

## Follow-up rollout order

1. Replace the header transaction-array sentinel with a boolean capability.
2. Preserve sorted report selection across category-only projections.
3. Share category views between round and breakdown consumers, then remove the legacy path.
4. Finish configuration typing and narrow the report facade.

Run the existing focused, full-unit, type, production-build, and browser matrix after the package. Record report-selection and category-aggregation counters before and after items 2 and 3.
