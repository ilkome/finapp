import type { TotalReturns } from '~/components/amount/getTotal'
import type { CurrencyCode } from '~/components/currencies/types'
import type { TrnId } from '~/components/trns/types'

import { getAmountInRate, getTotal } from '~/components/amount/getTotal'
import { formatAmount } from '~/components/amount/utils'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export function useAmount() {
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()
  const trnsStore = useTrnsStore()

  function getAmountInBaseRate({ amount, currencyCode, noFormat }: {
    amount: number
    currencyCode: CurrencyCode
    noFormat?: boolean
  }, { precision }: { precision?: number } = {}) {
    const rates = currenciesStore.rates
    const baseCurrencyCode = currenciesStore.base

    const amountInBaseRate = getAmountInRate({
      amount,
      baseCurrencyCode,
      currencyCode,
      rates,
    })

    if (noFormat)
      return `${amountInBaseRate}`

    return formatAmount(+amountInBaseRate, baseCurrencyCode, { precision })
  }

  const baseCurrencyCode = computed(() => currenciesStore.base)

  function computeTotalForTrnsIds(trnsIds?: TrnId[]): TotalReturns {
    return getTotal({
      baseCurrencyCode: currenciesStore.base,
      rates: currenciesStore.rates,
      trnsIds,
      trnsItems: trnsStore.items ?? {},
      walletsItems: walletsStore.items ?? {},
    })
  }

  return {
    baseCurrencyCode,
    computeTotalForTrnsIds,
    getAmountInBaseRate,
  }
}
