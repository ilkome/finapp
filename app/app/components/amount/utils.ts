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
  precision,
}: { precision?: number } = {}) {
  const currencySettings = currencyCode ? currencyMap.get(currencyCode) : undefined
  const p = precision ?? currencySettings?.precision ?? 2

  const formatted = getFormatter(p).format(amount)

  // If rounding hides a non-zero value, show significant digits
  if (amount !== 0 && Number(formatted.replace(/,/g, '')) === 0) {
    const significant = getFormatter(Math.min(Math.max(-Math.floor(Math.log10(Math.abs(amount))) + 1, p), 20))
    return significant.format(amount).replace(/,/g, ' ')
  }

  return formatted.replace(/,/g, ' ')
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
