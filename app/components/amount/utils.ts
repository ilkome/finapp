import type { CurrencyCode } from '~/components/currencies/types'

import { currencies } from '~/components/currencies/currencies'

export function formatAmount(amount: number, currencyCode?: CurrencyCode, {
  precision = 0,
} = {}) {
  const currencySettings = currencyCode
    ? currencies.find(c => c.code === currencyCode) ?? null
    : null

  const p = precision != null ? precision : currencySettings?.precision ?? 2

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: p,
    minimumFractionDigits: p,
  }).format(amount).replace(/,/g, ' ')
}

export function getCurrencySymbol(currencyCode?: CurrencyCode) {
  const currencySettings = currencies.find(c => c.code === currencyCode)

  if (currencySettings?.symbol)
    return currencySettings.symbol

  return currencyCode ?? ''
}

export function formatByCurrency(value: string, separator: string) {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
}
