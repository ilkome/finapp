import currency from 'currency.js'

import type { CurrencyCode } from '~/components/currencies/types'

import { currencies } from '~/components/currencies/currencies'

export function formatAmount(amount: number, currencyCode?: CurrencyCode, {
  precision = 0,
} = {}) {
  let currencySettings: Partial<currency.Options> | null = null

  if (currencyCode && currencies.find(c => c.code === currencyCode))
    currencySettings = currencies.find(c => c.code === currencyCode)

  return currency(amount, {
    pattern: currencySettings?.pattern ?? '#',
    precision: precision !== 0 ? precision : currencySettings?.precision ?? 2,
    separator: currencySettings?.separator ?? ' ',
    symbol: '',
  }).format()
}

export function getCurrencySymbol(currencyCode?: CurrencyCode) {
  const currencySettings = currencies.find(c => c.code === currencyCode)

  if (currencySettings?.symbol)
    return currencySettings.symbol

  return currencyCode ?? ''
}

export function formatByCurrency(value: string, separator: string) {
  return currency(value, {
    pattern: '#',
    precision: 0,
    separator,
  })
    .format()
}
