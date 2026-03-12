import type { CurrencyCode } from '~/components/currencies/types'

import { currencies } from '~/components/currencies/currencies'

const currencyMap = new Map(currencies.map(c => [c.code, c]))
const formatterCache = new Map<number, Intl.NumberFormat>()

function getFormatter(precision: number) {
  let fmt = formatterCache.get(precision)
  if (!fmt) {
    fmt = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: precision,
      minimumFractionDigits: precision,
    })
    formatterCache.set(precision, fmt)
  }
  return fmt
}

export function formatAmount(amount: number, currencyCode?: CurrencyCode, {
  precision = 0,
} = {}) {
  const currencySettings = currencyCode ? currencyMap.get(currencyCode) : undefined
  const p = precision ?? currencySettings?.precision ?? 2

  return getFormatter(p).format(amount).replace(/,/g, ' ')
}

export function getCurrencySymbol(currencyCode?: CurrencyCode) {
  if (!currencyCode)
    return ''

  const currencySettings = currencyMap.get(currencyCode)
  return currencySettings?.symbol ?? currencyCode
}

export function formatByCurrency(value: string, separator: string) {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
}
