import currencyjs from 'currency.js'
import { currencies } from '~/components/currencies/currencies'
import type { CurrencyCode } from '~/components/currencies/types'
import { getAmountInRate } from '~/components/trns/getTotal'

function getCurrencySymbol(currencyCode?: CurrencyCode) {
  const currencySettings = currencies.find(c => c.code === currencyCode)

  if (currencySettings?.symbol)
    return currencySettings.symbol

  return currencyCode
}

function formatAmount(amount: number, currencyCode?: CurrencyCode) {
  let currencySettings = null

  if (currencyCode && currencies.find(c => c.code === currencyCode))
    currencySettings = currencies.find(c => c.code === currencyCode)

  return currencyjs(amount, {
    symbol: '',
    precision: currencySettings?.precision ?? 2,
    pattern: currencySettings?.pattern ?? '#',
    separator: currencySettings?.separator ?? ' ',
  }).format()
}

export default function useAmount() {
  const { $store } = useNuxtApp()

  function getAmountInBaseRate({ amount, currency, noFormat }: {
    amount: number
    currency: string // TODO: add typings
    noFormat?: boolean
  }) {
    const rates = $store.state.currencies.rates
    const baseRate = $store.state.currencies.base

    const amountInBaseRate = getAmountInRate({
      amount,
      currency,
      rates,
      baseRate,
    })

    if (noFormat)
      return +amountInBaseRate

    return formatAmount(amountInBaseRate, baseRate)
  }

  const baseCurrency = computed(() => $store.state.currencies.base)

  return {
    baseCurrency,

    formatAmount,
    getCurrencySymbol,
    getAmountInBaseRate,
  }
}
