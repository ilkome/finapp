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

  function getAmountInBaseRate({ amount, currencyCode }: {
    amount: number
    currencyCode: CurrencyCode
  }, { precision }: { precision?: number } = {}) {
    const amountInBaseRate = getAmountInRate({
      amount,
      baseCurrencyCode: currenciesStore.base,
      currencyCode,
      rates: currenciesStore.rates,
    })

    return formatAmount(amountInBaseRate, currenciesStore.base, { precision })
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
