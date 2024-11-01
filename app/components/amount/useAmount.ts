import type { CurrencyCode } from '~/components/currencies/types'
import type { TrnId } from '~/components/trns/types'
import { formatAmount } from '~/components/amount/formatAmount'
import { getAmountInRate, getTotal } from '~/components/amount/getTotal'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export default function useAmount() {
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  function getAmountInBaseRate({ amount, currencyCode, noFormat }: {
    amount: number
    currencyCode: CurrencyCode
    noFormat?: boolean
  }) {
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

    return formatAmount(+amountInBaseRate, baseCurrencyCode)
  }

  const baseCurrencyCode = computed(() => currenciesStore.base)

  function getTotalOfTrnsIds(trnsIds: TrnId[]) {
    return getTotal({
      baseCurrencyCode: currenciesStore.base,
      rates: currenciesStore.rates,
      transferCategoriesIds: categoriesStore.transferCategoriesIds,
      trnsIds,
      trnsItems: trnsStore.items ?? {},
      walletsIds: Object.keys(walletsStore.items ?? {}),
      walletsItems: walletsStore.items ?? {},
    })
  }

  return {
    baseCurrencyCode,
    formatAmount,
    getAmountInBaseRate,
    getTotalOfTrnsIds,
  }
}
