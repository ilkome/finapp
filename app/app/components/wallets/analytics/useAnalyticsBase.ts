import type { Period, Range } from '~~/utils/date/types'

import { useStorage } from '@vueuse/core'
import { addCivilMonths, startOfMonthCivil, u } from '~~/utils/date/civil'
import { getEndOf, getStartOf } from '~~/utils/date/period'

import type { Rates } from '~/components/currencies/types'
import type { ToBase } from '~/components/wallets/analytics/balanceHistory'

import { getAmountInRate } from '~/components/amount/getTotal'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { availableGranularities } from '~/components/stat/chart/granularity'
import { getIntervalsInRange } from '~/components/stat/date/params'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { walletBalancesAt } from '~/components/wallets/analytics/balanceHistory'
import { isLastIntervalPartial } from '~/components/wallets/analytics/stats'
import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { isCountedInTotals } from '~/components/wallets/counts'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useCivilToday } from '~/composables/useCivilToday'

type TryToBase = (amount: number, currency: string) => number | undefined

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
  const rawRange = computed<Range>(() => ({
    end: getEndOf(u(today.value), 'day').getTime(),
    start: months.value
      ? addCivilMonths(startOfMonthCivil(today.value), 1 - months.value)
      : startOfMonthCivil(firstTrnDate.value),
  }))

  // A stored period the range no longer allows falls back to the coarsest one it does.
  const effectivePeriod = computed<Period>(() => {
    const allowed = availableGranularities(period.value, rawRange.value)
    return allowed.includes(period.value) ? period.value : allowed.at(-1) ?? 'day'
  })

  // The start moves back to the start of its interval, so the first interval is a full one.
  const range = computed<Range>(() => ({
    end: rawRange.value.end,
    start: getStartOf(u(rawRange.value.start), effectivePeriod.value).getTime(),
  }))

  const intervals = computed(() => getIntervalsInRange({ granularityBy: effectivePeriod.value, granularityDuration: 1, range: range.value }))
  /** Intervals before the current one, unless today closes the last interval. Statistics over intervals use only these. */
  const fullCount = computed(() => intervals.value.length - (isLastIntervalPartial(intervals.value, effectivePeriod.value) ? 1 : 0))

  /** The same span right before the range, to date: as many days as have passed in this one. Null for `all`. */
  const previousRange = computed<Range | null>(() => months.value
    ? { end: addCivilMonths(range.value.end, -months.value), start: addCivilMonths(range.value.start, -months.value) }
    : null)

  const ends = computed(() => intervals.value.map(interval => Math.min(interval.end, range.value.end)))
  const xAxisLabels = computed(() => intervals.value.map(interval => interval.start))
  /** The day before the range, then every interval end: the opening point is the base of every period change. */
  const pointDates = computed(() => [range.value.start - 1, ...ends.value])
  const allBalances = computed(() => walletBalancesAt(trnsStore.items ?? {}, walletsStore.items ?? {}, pointDates.value))
  const balances = computed(() => allBalances.value.slice(1))

  const historicalRates = shallowRef<(Rates | null)[]>([])
  let request = 0
  watch([pointDates, ratesMode], async () => {
    const current = ++request
    const rates = ratesMode.value === 'historical' ? await currenciesStore.getRatesOnDates(pointDates.value) : []
    if (current === request)
      historicalRates.value = rates
  }, { immediate: true })

  /** Converter for the interval at `index` (-1 is the opening point): its historical rates when on and known, today's otherwise; undefined without a rate. */
  function tryToBaseAt(index: number): TryToBase {
    const rates = ratesMode.value === 'historical' ? historicalRates.value[index + 1] : null
    const base = currenciesStore.base
    if (!rates || !rates[base])
      return currenciesStore.tryToBase
    return (amount, currency) => currency === base
      ? amount
      : rates[currency] ? getAmountInRate(amount, currency, base, rates) : currenciesStore.tryToBase(amount, currency)
  }

  /** `tryToBaseAt` with a missing rate as 0; the page warns about those currencies. */
  function toBaseAt(index: number): ToBase {
    const tryToBase = tryToBaseAt(index)
    return (amount, currency) => tryToBase(amount, currency) ?? 0
  }

  /** Currencies of the counted wallets without a rate today: every section drops them, the page says so. */
  const missingCurrencies = computed(() => [...new Set(walletIds.value
    .map(id => walletsStore.items?.[id]?.currencyCode)
    .filter((code): code is string => !!code && currenciesStore.tryToBase(1, code) === undefined))])

  /** `toBaseAt` over `pointBalances`: index 0 is the opening point. */
  const toBaseAtPoint = (index: number) => toBaseAt(index - 1)

  return {
    balances,
    effectivePeriod,
    ends,
    flags,
    fullCount,
    intervals,
    missingCurrencies,
    period,
    pointBalances: allBalances,
    previousRange,
    range,
    rangeId,
    ratesMode,
    toBaseAt,
    toBaseAtPoint,
    tryToBaseAt,
    walletIds,
    xAxisLabels,
  }
}

export type AnalyticsBase = ReturnType<typeof useAnalyticsBase>
