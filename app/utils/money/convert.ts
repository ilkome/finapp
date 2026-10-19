/** Units of each currency per one unit of the rates' base. */
export type RatesTable = Readonly<Record<string, number>>

/** One unit of a currency costs `rate` units of `currencyCode`. */
export type ManualRate = { currencyCode: string, rate: number }

/**
 * Market rates with manual rates applied: a manual rate overrides the market one and chains through its currency
 * (a custom currency priced in another custom currency). A chain that ends without a rate or loops is left out.
 */
export function applyManualRates(rates: RatesTable, manualRates: Readonly<Record<string, ManualRate>>): RatesTable {
  const codes = Object.keys(manualRates)
  if (!codes.length)
    return rates

  const result: Record<string, number> = { ...rates }
  const resolve = (code: string, seen: Set<string>): number | undefined => {
    const manual = manualRates[code]
    if (!manual)
      return rates[code]
    if (seen.has(code))
      return undefined
    seen.add(code)
    const ref = resolve(manual.currencyCode, seen)
    return ref === undefined ? undefined : ref / manual.rate
  }
  for (const code of codes) {
    const value = resolve(code, new Set())
    if (value === undefined)
      delete result[code]
    else
      result[code] = value
  }
  return result
}

/**
 * Minor units of `from` to minor units of `to`, unrounded (a sum rounds once, at the end); `undefined` when either
 * currency has no rate.
 */
export function convert(
  amountMinor: number,
  from: string,
  to: string,
  rates: RatesTable,
  scaleOf: (code: string) => number,
): number | undefined {
  if (from === to)
    return amountMinor
  const fromRate = rates[from]
  const toRate = rates[to]
  if (!fromRate || !toRate)
    return undefined
  return amountMinor / fromRate * toRate * 10 ** (scaleOf(to) - scaleOf(from))
}
