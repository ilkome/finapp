import { getAmountInRate } from '~/components/amount/getTotal'
import { formatAmount } from '~/components/amount/formatAmount'

export default function useAmount() {
  const { $store } = useNuxtApp()

  function getAmountInBaseRate({ amount, currencyCode, noFormat }: {
    amount: number
    currencyCode: string // TODO: add typings
    noFormat?: boolean
  }) {
    const rates = $store.state.currencies.rates
    const baseCurrencyCode = $store.state.currencies.base

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

  const baseCurrencyCode = computed(() => $store.state.currencies.base)

  return {
    baseCurrencyCode,
    formatAmount,
    getAmountInBaseRate,
  }
}
