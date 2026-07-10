import type { CurrencyCode } from '~/components/currencies/types'

import { getAmountInRate } from '~/components/amount/getTotal'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { addCivilDays, todayCivilDayEpoch } from '~/components/date/utils'
import { committedNativeInRange } from '~/components/recurrences/occurrences'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { TrnType } from '~/components/trns/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

// Committed recurring cashflow over the next 365 civil days, priced per occurrence (amount-history
// aware) and converted to base currency. yearly is the true committed 12-month sum; smoothed
// per-cadence framings (monthly/weekly/daily) are derived at the view via scaleByCadence. perCurrency
// holds NATIVE (unconverted) yearly totals per wallet currency. See plans/recurrences.md §10.
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
      // Priced per occurrence (not a flat amount * count), so a mid-window price change or partial
      // coverage reports the true committed total. Shared with the drill-down + "by cost" sort.
      const nativeYearly = committedNativeInRange(rule, { end, start })
      if (!nativeYearly)
        continue

      const currency = walletsStore.items?.[rule.walletId]?.currency ?? base
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
