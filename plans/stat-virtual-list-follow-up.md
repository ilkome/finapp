# Statistics virtual feed follow-up plan

## Status

The measured window virtualizer is working in the current beta and should remain the baseline while this plan is implemented. The current two-frame active-period settling guard is intentionally retained until a deterministic replacement passes the complete regression matrix.

## Goals

- Remove the feedback loop between active-period selection and sticky-summary geometry.
- Replace timing-based suppression with deterministic transition rules.
- Preserve the current document-scrolling UX, `md:pr-90`, measured row sizes, and bounded DOM.
- Keep period loading sparse and independent from passive active-period changes.
- Improve CPU efficiency only where profiling shows meaningful work.

## Non-goals

- Do not replace document scrolling with a nested feed scroller.
- Do not return to unbounded native rendering or manual prefix-sum virtualization.
- Do not change editor history, transaction mutation semantics, or PowerSync behavior.
- Do not remove the current guard before the replacement is proven at the affected widths.

## Current baseline

- `useWindowVirtualizer` owns row visibility and dynamic measurement.
- Every rendered wrapper uses a stable semantic key and `measureElement`.
- History loads only during forward scrolling near the terminal virtual row.
- Period lookup uses the next matching transaction plus exponential and binary offset search.
- Loaded offsets, searched frontier, exhaustion, and stale-result protection are generation-scoped.
- The active period changes only after a page scroll event.
- A two-frame settling guard currently prevents layout anchoring caused by summary changes from reversing the transition.

## Remaining risks

### Active-period feedback

The active period controls the displayed sums. At some responsive widths, a new sum changes the sticky summary height. If the visible-period boundary uses that changing height, the boundary can move back across the same period transition.

The current two-frame guard prevents the observed oscillation, but it is a timing heuristic. A fast reverse gesture could occur while the guard is active.

### Repeated period filtering

Each recomputation maps all loaded offsets and asks the transaction store for IDs in every range. This is acceptable for the current demo history, but CPU work grows with the number of materialized periods.

### Historical lookup scan

Finding the next historical transaction scans the filtered ID list from the beginning. The date-to-offset search is logarithmic, but locating the next candidate is linear.

## Stage 1. Reproduce and instrument the boundary

Use a current beta build, never an older cached PWA build.

Record the following on every active-period transition:

- viewport width and height;
- scroll position and direction;
- current and candidate offsets;
- period-anchor positions;
- sticky-summary top, bottom, and height;
- virtualizer scroll offset and total size;
- whether the scroll event was user-driven or caused by layout anchoring.

Reproduce at the exact one-column widths where transactions follow categories. Cover `7d`, `14d`, month, and sparse-history ranges.

Exit criterion: one trace demonstrates the complete transition and identifies which geometry value crosses the boundary twice.

## Stage 2. Choose a stable activation model

Evaluate these options in order.

### Option A. Stable summary geometry

Keep the sticky summary height invariant while only its amounts change. Prefer a responsive grid with stable row allocation over fixed pixel heights. Verify long amounts, base-rate rows, averages, forecast rows, focused summaries, and localization.

Choose this option if it preserves the intended layout at all affected widths. It removes the feedback source and keeps visible-period selection simple.

### Option B. Stable activation plane

If summary height must remain content-driven, derive period transitions from a stable activation plane that does not move when the active period changes. The plane may be based on the sticky header top plus a breakpoint-specific reserved summary region, but it must not read the newly rendered active-period height during the same transition.

### Option C. Directional state machine

If neither layout option is viable, introduce an explicit state machine:

- `idle`;
- `scrollingForward`;
- `scrollingBackward`;
- `settlingTransition`.

Use separate forward and backward activation bands. A transition is committed only when the relevant period anchor crosses its band. Summary resize and virtualizer measurement events may update geometry but cannot initiate or reverse a transition. A genuine reverse scroll moves the machine into the opposite scrolling state immediately.

Do not use a fixed number of animation frames as a transition condition.

Exit criterion: the selected model has no dependency cycle from active offset through summary height back to active offset.

## Stage 3. Implement the deterministic transition

- Extract the transition decision into a pure function with explicit state and geometry inputs.
- Keep DOM measurement and state mutation outside the pure function.
- Update the active offset at most once per animation frame.
- Do not trigger history loading from summary resize, measurement correction, backward scrolling, or programmatic landing.
- Preserve clearing of `scrollRangeOffset` when the base period becomes active.
- Remove `isSettlingActivePeriod` and the nested animation-frame guard only after the replacement tests pass.

Exit criterion: repeated identical geometry inputs are idempotent and cannot alternate offsets.

## Stage 4. Add regression coverage

### Unit tests

- Forward crossing commits exactly once.
- Backward crossing commits exactly once.
- Alternating summary heights cannot alternate the active offset.
- A real direction reversal is accepted immediately.
- Measurement-only and resize-only updates do not change the offset.
- Base-period activation clears the passive offset.

### Component integration test

Mount the feed with two adjacent periods whose sums produce different summary heights. Alternate the reported summary height after the first transition and assert:

- one active-offset change;
- stable total virtual size after measurement settles;
- no repeated reactive update loop;
- no history load caused by the geometry change.

### Current-build browser matrix

- affected one-column widths around the responsive boundary;
- `390x844`, `768x800`, `1024x800`, and wide desktop;
- slow boundary scrolling, fast momentum, and immediate reversal;
- categories before transactions;
- `7d`, `14d`, month, and sparse ranges;
- desktop editor open and close with `md:pr-90`;
- installed PWA after unregistering any older localhost service worker.

Exit criterion: no amount flicker, scrollbar-height oscillation, blank feed, backward load, or missed reverse transition.

## Stage 5. Profile before optimizing data work

Measure append and active-period update costs with the full demo history. Record:

- time spent in `getStoreTrnsIds`;
- number of period-range recomputations per append;
- time spent rebuilding flat virtual rows;
- next-historical-transaction scan length;
- longest main-thread task.

Only if profiling exceeds the budgets below:

1. Cache period IDs by report generation and offset.
2. Invalidate only the affected cache generation when report scope changes.
3. Replace the repeated historical scan with a cursor into date-sorted filtered IDs.
4. Update the flattened row list incrementally while preserving stable keys.

Do not add caching without explicit invalidation tests.

## Performance and correctness budgets

- At most 120 rendered row wrappers after the full demo history is loaded.
- No append or active-period task longer than 50 ms in the browser trace.
- No blank gap during fast forward or backward scrolling.
- Zero history loads from backward, programmatic, resize, or measurement-driven movement.
- Zero repeated active-offset transitions without a genuine direction change.
- No observer or listener growth across KeepAlive activation cycles.
- No `virtualizer.measure()` call in normal append, resize, filter, or editor paths.

## Verification

Run:

```sh
pnpm lint:fix
pnpm typecheck
NODE_OPTIONS=--localstorage-file=/tmp/finapp-vitest-localstorage-serial pnpm --filter @finapp/app exec vitest run --no-file-parallelism
pnpm --filter @finapp/app build
```

Run browser checks only against a current build. If the localhost origin is controlled by an older PWA service worker, use a fresh port or unregister only the service worker and Cache Storage without clearing IndexedDB.

## Rollout

1. Keep the current working guard in the first commit.
2. Implement the deterministic replacement behind focused tests.
3. Validate the affected widths on the current beta.
4. Remove the guard in the same commit that introduces the proven replacement.
5. Keep the existing stash until the replacement has survived manual testing.
