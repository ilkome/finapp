import currencyjs from 'currency.js'
import { currencies } from '~/components/currencies/currencies'
import type { CurrencyCode } from '~/components/currencies/types'

export function formatAmount(amount: number, currencyCode?: CurrencyCode) {
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

export function getCurrencySymbol(currencyCode?: CurrencyCode) {
  const currencySettings = currencies.find(c => c.code === currencyCode)

  if (currencySettings?.symbol)
    return currencySettings.symbol

  return currencyCode
}
