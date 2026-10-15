import type { CurrencyCode, Rates } from '~/components/currencies/types'

import { getAmountInRate } from '~/components/amount/getTotal'

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
  return getAmountInRate(amount, from, to, rates)
}

/** The amount in the base currency first, then in every other wallet currency. */
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

export function getTransferRate(props: {
  expenseAmount: number
  expenseCurrency: CurrencyCode
  incomeAmount: number
  incomeCurrency: CurrencyCode
  rates: Rates | null
  ratesOnDate: Rates | null
}): TrnTransferRate | null {
  if (props.expenseCurrency === props.incomeCurrency)
    return null

  return {
    from: props.expenseCurrency,
    now: convert(1, props.expenseCurrency, props.incomeCurrency, props.rates),
    onDate: convert(1, props.expenseCurrency, props.incomeCurrency, props.ratesOnDate),
    to: props.incomeCurrency,
    transfer: props.incomeAmount / props.expenseAmount,
  }
}
