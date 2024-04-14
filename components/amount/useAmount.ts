import type { TrnId } from '~/components/trns/types'
import { formatAmount } from '~/components/amount/formatAmount'
import { getAmountInRate, getTotal } from '~/components/amount/getTotal'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export default function useAmount() {
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  function getAmountInBaseRate({ amount, currencyCode, noFormat }: {
    amount: number
    currencyCode: string // TODO: add typings
    noFormat?: boolean
  }) {
    const rates = currenciesStore.rates
    const baseCurrencyCode = currenciesStore.base

    const amountInBaseRate = getAmountInRate({
      amount,
      currencyCode,
      rates,
      baseCurrencyCode,
    })

    if (noFormat)
      return +amountInBaseRate

    return formatAmount(amountInBaseRate, baseCurrencyCode)
  }

  const baseCurrencyCode = computed(() => currenciesStore.base)

  function getTotalOfTrnsIds(trnsIds: TrnId[]) {
    return getTotal({
      trnsIds,
      trnsItems: trnsStore.items,
      transferCategoriesIds: categoriesStore.transferCategoriesIds,
      walletsIds: walletsStore.ids,
      walletsItems: walletsStore.items,
    })
  }

  return {
    baseCurrencyCode,
    formatAmount,
    getAmountInBaseRate,
    getTotalOfTrnsIds,
  }
}
