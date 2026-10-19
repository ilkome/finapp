import { differenceInCalendarDays, differenceInMonths } from 'date-fns'
import { addCivilMonths, formatByLocale, lastDayOfMonthCivil, u } from '~~/utils/date/civil'

import type { CategoryId } from '~/components/categories/types'
import type { Obligation } from '~/components/wallets/analytics/forecast'
import type { ForecastRunway } from '~/components/wallets/analytics/ForecastSummaryView.vue'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useLoansStore } from '~/components/loans/useLoansStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { cardObligations, loanObligations, projectForecast } from '~/components/wallets/analytics/forecast'
import { currentMonth, detectRegular, monthlyCategorySpending, monthlyIncome, previousMonths, typicalAmount } from '~/components/wallets/analytics/regular'
import { useCountedWalletIds } from '~/components/wallets/analytics/useAnalyticsBase'
import { useForecastSettingsStore } from '~/components/wallets/analytics/useForecastSettingsStore'
import { filterWalletsByViewType } from '~/components/wallets/filters'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useCivilToday } from '~/composables/useCivilToday'

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

  /** Wallets money can be taken from; the forecast starts from these unless a pick narrows them. */
  const availableWalletIds = computed<WalletId[]>(() =>
    filterWalletsByViewType(walletsStore.sortedIds, walletsStore.itemsComputed, 'isWithdrawal'))
  const startWalletIds = computed<WalletId[]>(() => {
    const picked = new Set(settings.value.walletIds)
    const ids = availableWalletIds.value.filter(id => !picked.size || picked.has(id))
    // Every picked wallet gone (deleted, archived) falls back to all of them rather than to zero.
    return ids.length ? ids : availableWalletIds.value
  })
  const startBalance = computed(() => startWalletIds.value.reduce((sum, id) => {
    const wallet = walletsStore.itemsComputed[id]
    return wallet ? sum + currenciesStore.toBase(wallet.amount, wallet.currency) : sum
  }, 0))

  const rollUp = (categoryId: CategoryId): CategoryId => {
    if (!settings.value.groupByParent)
      return categoryId
    const parentId = categoriesStore.items[categoryId]?.parentId
    return parentId ? String(parentId) : categoryId
  }

  const sumParams = computed(() => ({
    excludedCategoryIds: categoriesStore.excludedFromStatsIds,
    rollUp,
    toBase: currenciesStore.toBase,
    trnsItems: trnsStore.items ?? {},
    walletIds: new Set(countedWalletIds.value),
    walletsItems: walletsStore.items ?? {},
  }))
  const windowMonths = computed(() => previousMonths(today.value, settings.value.windowMonths))
  const thisMonth = computed(() => [currentMonth(today.value)])

  const regular = computed(() => detectRegular({
    amountMode: settings.value.amountMode,
    minMonths: settings.value.minMonths,
    monthly: monthlyCategorySpending({ ...sumParams.value, months: windowMonths.value }),
    overrides: settings.value.overrides,
    windowMonths: settings.value.windowMonths,
  }))
  const spentThisMonth = computed(() => monthlyCategorySpending({ ...sumParams.value, months: thisMonth.value }))

  const income = computed(() => typicalAmount(monthlyIncome({ ...sumParams.value, months: windowMonths.value }), settings.value.amountMode))
  const incomeThisMonth = computed(() => monthlyIncome({ ...sumParams.value, months: thisMonth.value })[0] ?? 0)

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
      if (wallet?.type !== 'credit' || wallet.isArchived || loanWalletIds.has(walletId))
        continue
      result.push(...cardObligations({
        debt: Math.max(0, -wallet.amount),
        grace: loansStore.graceByWalletId.get(walletId) ?? null,
        minPayment: loansStore.minPaymentByWalletId.get(walletId) ?? null,
        mode: settings.value.cardPayment,
        toBase: amount => currenciesStore.toBase(amount, wallet.currency),
        today: today.value,
        until: until.value,
        walletId,
      }))
    }
    return result.sort((a, b) => a.date - b.date)
  })

  const forecast = computed(() => projectForecast({
    horizonMonths: settings.value.horizonMonths,
    income: income.value,
    incomeThisMonth: incomeThisMonth.value,
    obligations: obligations.value,
    regular: regular.value
      .filter(item => item.isRegular)
      .map(item => ({ amount: item.amount, spentThisMonth: spentThisMonth.value.get(item.categoryId)?.[0] ?? 0 })),
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
        : months >= 1 ? `${months} ${t('dates.month.plural', months)}` : `${days} ${t('dates.day.plural', days)}`,
    }
  }

  return {
    availableWalletIds,
    forecast,
    income,
    obligations,
    regular,
    runwayOf,
    settings,
    startWalletIds,
    today,
    update: settingsStore.update,
  }
}
