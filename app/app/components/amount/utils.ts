import type { MinorDisplay } from '~~/utils/money/scale'

import { currencyScale, toMinor } from '~~/utils/money/scale'

import type { CurrencyCode, CurrencyItem } from '~/components/currencies/types'

import { currencies } from '~/components/currencies/currencies'

const currencyMap = new Map(currencies.map(c => [c.code, c]))

/** The user's custom currencies and edits of built-in ones, set by the currencies store. */
let userCurrencies: ReadonlyMap<CurrencyCode, CurrencyItem> = new Map()
let customScales: Readonly<Record<CurrencyCode, number>> = {}

export function setUserCurrencies(values: typeof userCurrencies) {
  userCurrencies = values
  customScales = Object.fromEntries([...values].flatMap(([code, c]) => c.scale === undefined ? [] : [[code, c.scale]]))
}

/** Scale of a currency for display and input; a code nobody knows displays as 2 decimals instead of breaking a page. */
export function scaleOf(currencyCode: CurrencyCode | undefined): number {
  if (!currencyCode)
    return 2
  try {
    return currencyScale(currencyCode, customScales)
  }
  catch {
    return 2
  }
}

/** A decimal value the user typed or a fixture holds, to minor units of the currency. */
export function amountToMinor(value: number, currencyCode: CurrencyCode | undefined): number {
  return toMinor(value, scaleOf(currencyCode))
}

/** Minor units as a decimal value, for charts and inputs that edit an existing amount. */
export function minorToAmount(minor: number, currencyCode: CurrencyCode | undefined): number {
  return minor / 10 ** scaleOf(currencyCode)
}

const grouping = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/**
 * Minor units with space thousands and the currency's fraction: `auto` (the default) shows it only when it is not
 * zero. Integer arithmetic, so a BTC amount keeps every satoshi. A fractional input (a converted total) is rounded.
 */
export function formatAmount(minor: number, currencyCode?: CurrencyCode, { minorDisplay }: { minorDisplay?: MinorDisplay } = {}): string {
  const scale = scaleOf(currencyCode)
  const display = minorDisplay ?? userCurrencies.get(currencyCode ?? '')?.minorDisplay ?? 'auto'
  const unit = 10 ** scale
  let abs = Math.round(Math.abs(minor))
  if (display === 'never')
    abs = Math.round(abs / unit) * unit
  const sign = minor < 0 && abs !== 0 ? '-' : ''
  const whole = grouping.format(Math.floor(abs / unit)).replace(/,/g, ' ')
  const fraction = abs % unit
  const showFraction = scale > 0 && (display === 'always' || (display === 'auto' && fraction !== 0))
  return `${sign}${whole}${showFraction ? `.${String(fraction).padStart(scale, '0')}` : ''}`
}

export function getCurrencySymbol(currencyCode?: CurrencyCode) {
  if (!currencyCode)
    return ''
  return userCurrencies.get(currencyCode)?.symbol ?? currencyMap.get(currencyCode)?.symbol ?? currencyCode
}

export function formatByCurrency(value: string, separator: string) {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
}
