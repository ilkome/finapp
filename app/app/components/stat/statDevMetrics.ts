import { shallowRef } from 'vue'

export const statDevMetrics = {
  categoryAggregationCount: shallowRef(0),
  categoryAggregationDuration: shallowRef(0),
  categoryVisitedIds: shallowRef(0),
  getStoreTrnsIdsCount: shallowRef(0),
  reportContextCount: shallowRef(0),
  reportSelectionCount: shallowRef(0),
  reportSelectionDuration: shallowRef(0),
  reportSelectionVisitedIds: shallowRef(0),
}

export function deferStatDevMetricsUpdate(update: () => void) {
  // Metric writes can run while a computed value is being evaluated. Deferring
  // them prevents the measured computation from subscribing to its own counters.
  queueMicrotask(update)
}

export function getStatMetricNow() {
  return typeof performance === 'undefined' ? Date.now() : performance.now()
}
