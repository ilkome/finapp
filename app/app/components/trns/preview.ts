import type { CurrencyCode, Rates } from '~/components/currencies/types'

import { getAmountInRate } from '~/components/amount/getTotal'
import { minorToAmount } from '~/components/amount/utils'

export type TrnConversion = {
  currency: CurrencyCode
  /** At the latest rates. */
  now?: number
  /** At the rates of the transaction's day. */
  onDate?: number
}

export type TrnTransferRate = {
  from: CurrencyCode
  now?: number
  onDate?: number
  to: CurrencyCode
  /** Units of `to` received per unit of `from` in this transfer. */
  transfer: number
}

// A currency without a rate is left out, never converted at 1:1 (`getAmountInRate` would).
function convert(amount: number, from: CurrencyCode, to: CurrencyCode, rates: Rates | null) {
  if (!rates || !rates[from] || !rates[to])
    return undefined
  return Math.round(getAmountInRate(amount, from, to, rates))
}

/** The amount (minor units) in the base currency first, then in every other wallet currency, rounded to minor units. */
export function getTrnConversions(props: {
  amount: number
  base: CurrencyCode
  currency: CurrencyCode
  rates: Rates | null
  ratesOnDate: Rates | null
  walletCurrencies: CurrencyCode[]
}): TrnConversion[] {
  const targets = [...new Set([props.base, ...props.walletCurrencies])].filter(c => c !== props.currency)

  return targets.flatMap((currency) => {
    const row = {
      currency,
      now: convert(props.amount, props.currency, currency, props.rates),
      onDate: convert(props.amount, props.currency, currency, props.ratesOnDate),
    }
    return row.now === undefined && row.onDate === undefined ? [] : [row]
  })
}

/** Units of `to` per one unit of `from`: a rate is a plain ratio, so minor units are scaled back to whole units. */
export function getTransferRate(props: {
  fromAmount: number
  fromCurrency: CurrencyCode
  rates: Rates | null
  ratesOnDate: Rates | null
  toAmount: number
  toCurrency: CurrencyCode
}): TrnTransferRate | null {
  if (props.fromCurrency === props.toCurrency || !props.fromAmount)
    return null

  const marketRate = (rates: Rates | null) => rates?.[props.fromCurrency] && rates[props.toCurrency]
    ? rates[props.toCurrency]! / rates[props.fromCurrency]!
    : undefined

  return {
    from: props.fromCurrency,
    now: marketRate(props.rates),
    onDate: marketRate(props.ratesOnDate),
    to: props.toCurrency,
    transfer: minorToAmount(props.toAmount, props.toCurrency) / minorToAmount(props.fromAmount, props.fromCurrency),
  }
}
