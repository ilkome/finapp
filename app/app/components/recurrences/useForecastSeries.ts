import type { ComputedRef, Ref } from 'vue'

import type { TotalReturns } from '~/components/amount/getTotal'
import type { Range } from '~/components/date/types'
import type { FilterProvider } from '~/components/stat/filter/types'
import type { IntervalData } from '~/components/stat/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

import { getTotal } from '~/components/amount/getTotal'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { buildOccurrenceTrn } from '~/components/recurrences/generate'
import { occurrencesInRange, occurrenceTrnId } from '~/components/recurrences/occurrences'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { bucketTrnsByIntervals } from '~/components/stat/intervals'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

type UseForecastSeriesParams = {
  filter?: FilterProvider
  intervals: Ref<Range[]> | ComputedRef<Range[]>
  range: Ref<Range> | ComputedRef<Range>
}

/**
 * Forecast dataset for the dashboard: future, not-yet-booked recurrence occurrences within the
 * selected stat period, shaped exactly like the actual stat dataset (synthetic trns + bucketed
 * IntervalData) so charts/totals can layer or merge them. See plans/recurrences.md §8-9.
 *
 * "Forecast" = an in-range occurrence whose deterministic trn id is NOT already a real trn, so
 * an occurrence that auto-create or a manual confirm has already booked is never double-counted.
 */
export function useForecastSeries({ filter, intervals, range }: UseForecastSeriesParams) {
  const recurrencesStore = useRecurrencesStore()
  const trnsStore = useTrnsStore()
  const walletsStore = useWalletsStore()
  const currenciesStore = useCurrenciesStore()
  const categoriesStore = useCategoriesStore()

  const forecast = computed<{ ids: TrnId[], items: Record<TrnId, TrnItem> }>(() => {
    const items: Record<TrnId, TrnItem> = {}
    const ids: TrnId[] = []
    const realTrns = trnsStore.items ?? {}
    const r = range.value

    // Mirror the actual-trns filters (wallet ids, and category subtree via transactible ids).
    const walletSet = filter?.walletsIds?.value?.length ? new Set(filter.walletsIds.value) : null
    const catSet = filter?.categoriesIds?.value?.length
      ? new Set(categoriesStore.getTransactibleIds(filter.categoriesIds.value))
      : null

    for (const [ruleId, rule] of Object.entries(recurrencesStore.activeItems)) {
      if (walletSet && !walletSet.has(rule.walletId))
        continue
      if (catSet && !catSet.has(rule.categoryId))
        continue

      for (const day of occurrencesInRange(rule, r)) {
        const id = occurrenceTrnId(ruleId, day)
        if (realTrns[id])
          continue
        items[id] = buildOccurrenceTrn(rule, ruleId, day, day)
        ids.push(id)
      }
    }

    return { ids, items }
  })

  function computeForecastTotal(trnsIds?: TrnId[]): TotalReturns {
    return getTotal({
      baseCurrencyCode: currenciesStore.base,
      rates: currenciesStore.rates,
      trnsIds,
      trnsItems: forecast.value.items,
      walletsItems: walletsStore.items ?? {},
    })
  }

  const forecastIntervalsData = computed<IntervalData[]>(() =>
    bucketTrnsByIntervals(forecast.value.items, forecast.value.ids, intervals.value, computeForecastTotal),
  )

  const forecastTotal = computed(() => computeForecastTotal(forecast.value.ids))
  const hasForecast = computed(() => forecast.value.ids.length > 0)

  return {
    computeForecastTotal,
    forecastIds: computed(() => forecast.value.ids),
    forecastIntervalsData,
    forecastItems: computed(() => forecast.value.items),
    forecastTotal,
    hasForecast,
  }
}
