import { differenceInCalendarDays, differenceInMonths } from 'date-fns'
import { addCivilMonths, formatByLocale, lastDayOfMonthCivil, u } from '~~/utils/date/civil'

import type { CategoryId } from '~/components/categories/types'
import type { Obligation } from '~/components/wallets/analytics/forecast'
import type { RegularOverride } from '~/components/wallets/analytics/forecastSettings'
import type { ForecastRunway } from '~/components/wallets/analytics/ForecastSummaryView.vue'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useLoansStore } from '~/components/loans/useLoansStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { cardObligations, incomeSchedule, loanObligations, projectForecast } from '~/components/wallets/analytics/forecast'
import { toRegularOverride } from '~/components/wallets/analytics/forecastSettings'
import { currentMonth, detectRegular, monthlySums, previousMonths, sliceMonthlySums, typicalAmount } from '~/components/wallets/analytics/regular'
import { useCountedWalletIds } from '~/components/wallets/analytics/useAnalyticsBase'
import { useForecastSettingsStore } from '~/components/wallets/analytics/useForecastSettingsStore'
import { isCreditProduct, isWalletInForecast } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useCivilToday } from '~/composables/useCivilToday'

/** A runway up to this long reads in days, a longer one in months. */
const RUNWAY_DAYS_LIMIT = 60

/** Regular spending, obligations and the month-by-month forecast built from the synced settings. */
export function useForecast() {
  const walletsStore = useWalletsStore()
  const trnsStore = useTrnsStore()
  const categoriesStore = useCategoriesStore()
  const currenciesStore = useCurrenciesStore()
  const loansStore = useLoansStore()
  const settingsStore = useForecastSettingsStore()
  const today = useCivilToday()
  const { walletIds: countedWalletIds } = useCountedWalletIds()
  const { t } = useI18n()
  const dateLocale = useDateLocale()

  const settings = computed(() => settingsStore.settings)

  /** Wallets the forecast can start from; credit products come in through their obligations. */
  const availableWalletIds = computed<WalletId[]>(() => walletsStore.sortedIds.filter((id) => {
    const wallet = walletsStore.items?.[id]
    return !!wallet && !wallet.isArchived && !isCreditProduct(wallet.type)
  }))
  const startWalletIds = computed<WalletId[]>(() =>
    availableWalletIds.value.filter(id => isWalletInForecast(walletsStore.items![id]!)))
  const startBalance = computed(() => Math.round(startWalletIds.value.reduce((sum, id) => {
    const wallet = walletsStore.itemsComputed[id]
    return wallet ? sum + currenciesStore.toBase(wallet.amount, wallet.currencyCode) : sum
  }, 0)))

  const overrides = computed(() => {
    const result: Record<CategoryId, RegularOverride> = {}
    for (const item of Object.values(settingsStore.categories)) {
      const override = toRegularOverride(item, currenciesStore.toBase, currenciesStore.base)
      if (override)
        result[item.categoryId] = override
    }
    return result
  })

  function toggleStartWallet(walletId: WalletId) {
    const wallet = walletsStore.items?.[walletId]
    if (wallet)
      walletsStore.saveWallet({ id: walletId, values: { ...wallet, isInForecast: !isWalletInForecast(wallet), updatedAt: Date.now() } })
  }

  const rollUp = (categoryId: CategoryId): CategoryId => {
    if (!settings.value.isByParentCategory)
      return categoryId
    const parentId = categoriesStore.items[categoryId]?.parentId
    return parentId ? String(parentId) : categoryId
  }

  const sumParams = computed(() => ({
    excludedCategoryIds: categoriesStore.excludedFromStatsIds,
    // Income outside the start wallets would raise the projection without the money being in the start balance.
    incomeWalletIds: new Set(startWalletIds.value),
    rollUp,
    toBase: currenciesStore.toBase,
    trnsItems: trnsStore.items ?? {},
    walletIds: new Set(countedWalletIds.value),
    walletsItems: walletsStore.items ?? {},
  }))
  // The history window and the current month in one pass over the trns.
  const sums = computed(() => {
    const months = [...previousMonths(today.value, settings.value.historyMonths), currentMonth(today.value)]
    const all = monthlySums({ ...sumParams.value, months })
    return { thisMonth: sliceMonthlySums(all, -1), window: sliceMonthlySums(all, 0, -1) }
  })

  const regular = computed(() => detectRegular({
    amountMode: settings.value.regularAmountMode,
    minMonths: settings.value.regularMinMonths,
    monthly: sums.value.window.spending,
    overrides: overrides.value,
    windowMonths: settings.value.historyMonths,
  }))
  const spentThisMonth = computed(() => sums.value.thisMonth.spending)

  const income = computed(() => typicalAmount(sums.value.window.income, settings.value.regularAmountMode))
  const incomeThisMonth = computed(() => sums.value.thisMonth.income[0] ?? 0)

  const until = computed(() => lastDayOfMonthCivil(addCivilMonths(today.value, settings.value.horizonMonths - 1)))

  const obligations = computed<Obligation[]>(() => {
    const result: Obligation[] = []
    const loanWalletIds = new Set(loansStore.byWalletId.keys())
    for (const [walletId, { summary }] of loansStore.byWalletId) {
      if (walletsStore.items?.[walletId]?.isArchived)
        continue
      const currency = walletsStore.currencyOf(walletId)
      result.push(...loanObligations({ rows: summary.rows, toBase: amount => currenciesStore.toBase(amount, currency), today: today.value, until: until.value, walletId }))
    }
    for (const walletId of walletsStore.sortedIds) {
      const wallet = walletsStore.itemsComputed[walletId]
      if (wallet?.type !== 'credit_card' || wallet.isArchived || loanWalletIds.has(walletId))
        continue
      result.push(...cardObligations({
        debt: Math.max(0, -wallet.amount),
        grace: loansStore.graceByWalletId.get(walletId) ?? null,
        minPayment: loansStore.minPaymentByWalletId.get(walletId) ?? null,
        mode: settings.value.cardPaymentMode,
        toBase: amount => currenciesStore.toBase(amount, wallet.currencyCode),
        today: today.value,
        until: until.value,
        walletId,
      }))
    }
    return result.sort((a, b) => a.date - b.date)
  })

  const schedule = computed(() => incomeSchedule(sums.value.window.incomeEntries))

  const forecast = computed(() => projectForecast({
    horizonMonths: settings.value.horizonMonths,
    income: income.value,
    incomeThisMonth: incomeThisMonth.value,
    obligations: obligations.value,
    regular: regular.value
      .filter(item => item.isRegular)
      .map(item => ({ amount: item.amount, spentThisMonth: spentThisMonth.value.get(item.categoryId)?.[0] ?? 0 })),
    schedule: schedule.value,
    startBalance: startBalance.value,
    today: today.value,
  }))

  /** Labels of a run-out day: the date and how long until it; no duration once it is today or past. */
  function runwayOf(date: number | null): ForecastRunway {
    if (date === null)
      return { dateLabel: null, durationLabel: null }
    const days = differenceInCalendarDays(u(date), u(today.value))
    const months = differenceInMonths(u(date), u(today.value))
    return {
      dateLabel: formatByLocale(date, 'd MMMM yyyy', dateLocale.value),
      durationLabel: days <= 0
        ? null
        : days > RUNWAY_DAYS_LIMIT && months >= 1 ? `${months} ${t('dates.month.plural', months)}` : `${days} ${t('dates.day.plural', days)}`,
    }
  }

  return {
    availableWalletIds,
    categories: computed(() => settingsStore.categories),
    forecast,
    income,
    obligations,
    regular,
    runwayOf,
    setCategory: settingsStore.setCategory,
    settings,
    startWalletIds,
    today,
    toggleStartWallet,
    update: settingsStore.update,
  }
}
