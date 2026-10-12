/** Round to `precision` decimals, e.g. a currency's minor unit (`currencyMinorUnit`). */
export function roundTo(value: number, precision: number): number {
  const factor = 10 ** precision
  return Math.round((value + Number.EPSILON) * factor) / factor
}
