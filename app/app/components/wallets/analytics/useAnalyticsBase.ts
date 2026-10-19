import type { Period, Range } from '~~/utils/date/types'

import { useStorage } from '@vueuse/core'
import { addCivilMonths, startOfMonthCivil, u } from '~~/utils/date/civil'
import { getEndOf } from '~~/utils/date/period'

import type { Rates } from '~/components/currencies/types'
import type { ToBase } from '~/components/wallets/analytics/balanceHistory'

import { getAmountInRate } from '~/components/amount/getTotal'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { availableGranularities } from '~/components/stat/chart/granularity'
import { getIntervalsInRange } from '~/components/stat/date/params'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { walletBalancesAt } from '~/components/wallets/analytics/balanceHistory'
import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { isCountedInTotals } from '~/components/wallets/counts'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useCivilToday } from '~/composables/useCivilToday'

export const analyticsRanges = ['6m', '1y', '3y', 'all'] as const
export type AnalyticsRange = typeof analyticsRanges[number]
export type RatesMode = 'current' | 'historical'

const rangeMonths: Record<Exclude<AnalyticsRange, 'all'>, number> = { '1y': 12, '3y': 36, '6m': 6 }

/** Wallets that count toward totals, by the same archived / not-in-total switches as the wallets page. */
export function useCountedWalletIds() {
  const walletsStore = useWalletsStore()
  const includeArchived = useStorage<boolean>(WALLET_STORAGE_KEYS.includeArchivedInStats, false)
  const includeExcluded = useStorage<boolean>(WALLET_STORAGE_KEYS.includeExcludedInStats, false)
  const flags = computed(() => ({ includeArchived: includeArchived.value, includeExcluded: includeExcluded.value }))
  const walletIds = computed(() => walletsStore.sortedIds.filter((id) => {
    const wallet = walletsStore.itemsComputed[id]
    return !!wallet && isCountedInTotals(wallet, flags.value)
  }))
  return { flags, walletIds }
}

/** Range, intervals and per-wallet balances the analytics charts share; computed once per page. */
export function useAnalyticsBase() {
  const walletsStore = useWalletsStore()
  const trnsStore = useTrnsStore()
  const currenciesStore = useCurrenciesStore()
  const today = useCivilToday()

  const { flags, walletIds } = useCountedWalletIds()

  const rangeId = useStorage<AnalyticsRange>(WALLET_STORAGE_KEYS.analyticsRange, '1y')
  const period = useStorage<Period>(WALLET_STORAGE_KEYS.analyticsPeriod, 'month')
  const ratesMode = useStorage<RatesMode>(WALLET_STORAGE_KEYS.analyticsRates, 'historical')

  const firstTrnDate = computed(() => {
    let min = Infinity
    for (const trn of Object.values(trnsStore.items ?? {}))
      min = Math.min(min, trn.date)
    return Number.isFinite(min) ? min : today.value
  })

  const months = computed(() => rangeId.value === 'all' ? undefined : rangeMonths[rangeId.value])
  const range = computed<Range>(() => ({
    end: getEndOf(u(today.value), 'day').getTime(),
    start: months.value
      ? addCivilMonths(startOfMonthCivil(today.value), 1 - months.value)
      : startOfMonthCivil(firstTrnDate.value),
  }))

  // A stored period the range no longer allows falls back to the coarsest one it does.
  const effectivePeriod = computed<Period>(() => {
    const allowed = availableGranularities(period.value, range.value)
    return allowed.includes(period.value) ? period.value : allowed.at(-1) ?? 'day'
  })

  const intervals = computed(() => getIntervalsInRange({ granularityBy: effectivePeriod.value, granularityDuration: 1, range: range.value }))
  const ends = computed(() => intervals.value.map(interval => Math.min(interval.end, range.value.end)))
  const xAxisLabels = computed(() => intervals.value.map(interval => interval.start))
  const balances = computed(() => walletBalancesAt(trnsStore.items ?? {}, walletsStore.items ?? {}, ends.value))

  const historicalRates = shallowRef<(Rates | null)[]>([])
  let request = 0
  watch([ends, ratesMode], async () => {
    const current = ++request
    const rates = ratesMode.value === 'historical' ? await currenciesStore.getRatesOnDates(ends.value) : []
    if (current === request)
      historicalRates.value = rates
  }, { immediate: true })

  /** Converter for the interval at `index`: its historical rates when on and known, today's otherwise. */
  function toBaseAt(index: number): ToBase {
    const rates = ratesMode.value === 'historical' ? historicalRates.value[index] : null
    const base = currenciesStore.base
    if (!rates || !rates[base])
      return currenciesStore.toBase
    return (amount, currency) => currency === base
      ? amount
      : rates[currency] ? getAmountInRate(amount, currency, base, rates) : currenciesStore.toBase(amount, currency)
  }

  // Sections get the base as a prop, so they switch the mode through a function, not the ref.
  const setRatesMode = (mode: RatesMode) => ratesMode.value = mode

  return {
    balances,
    effectivePeriod,
    ends,
    flags,
    intervals,
    period,
    range,
    rangeId,
    ratesMode,
    setRatesMode,
    toBaseAt,
    walletIds,
    xAxisLabels,
  }
}

export type AnalyticsBase = ReturnType<typeof useAnalyticsBase>
