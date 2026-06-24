import type { CurrencyCode } from '~/components/currencies/types'

import { getAmountInRate } from '~/components/amount/getTotal'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { addCivilDays, todayCivilDayEpoch } from '~/components/date/utils'
import { occurrencesInRange } from '~/components/recurrences/occurrences'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { TrnType } from '~/components/trns/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

// Normalized committed recurring totals over the next 365 civil days, converted to base
// currency (monthly = yearly / 12, clamp-aware via the occurrence count). See plans/recurrences.md §10.
export function useRecurrenceTotals() {
  const recurrencesStore = useRecurrencesStore()
  const walletsStore = useWalletsStore()
  const currenciesStore = useCurrenciesStore()

  const totals = computed(() => {
    const start = todayCivilDayEpoch()
    const end = addCivilDays(start, 365)
    const base = currenciesStore.base
    const rates = currenciesStore.rates

    let yearlyExpense = 0
    let yearlyIncome = 0
    const perCurrency: Record<CurrencyCode, { expense: number, income: number }> = {}

    for (const rule of Object.values(recurrencesStore.activeItems)) {
      const count = occurrencesInRange(rule, { end, start }).length
      if (!count)
        continue

      const currency = walletsStore.items?.[rule.walletId]?.currency ?? base
      const nativeYearly = rule.amount * count
      const baseYearly = getAmountInRate({ amount: nativeYearly, baseCurrencyCode: base, currencyCode: currency, rates })

      const bucket = (perCurrency[currency] ??= { expense: 0, income: 0 })
      if (rule.type === TrnType.Income) {
        yearlyIncome += baseYearly
        bucket.income += nativeYearly
      }
      else {
        yearlyExpense += baseYearly
        bucket.expense += nativeYearly
      }
    }

    return {
      monthly: {
        expense: yearlyExpense / 12,
        income: yearlyIncome / 12,
        net: (yearlyIncome - yearlyExpense) / 12,
      },
      perCurrency,
      yearly: {
        expense: yearlyExpense,
        income: yearlyIncome,
        net: yearlyIncome - yearlyExpense,
      },
    }
  })

  return { totals }
}
