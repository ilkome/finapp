/**
 * Typed amount text as a plain decimal string. Spaces and apostrophes group digits. When both `,` and `.` appear,
 * the last one is the decimal point; one separator kind used once is the decimal point (`130,5`), used more than once
 * it groups digits (`1.000.000`).
 */
export function normalizeAmountText(text: string): string {
  const value = text.replace(/[\s']/g, '')
  const lastComma = value.lastIndexOf(',')
  const lastDot = value.lastIndexOf('.')
  let decimal: ',' | '.' | undefined
  if (lastComma >= 0 && lastDot >= 0)
    decimal = lastComma > lastDot ? ',' : '.'
  else if (lastComma >= 0 && value.indexOf(',') === lastComma)
    decimal = ','
  else if (lastDot >= 0 && value.indexOf('.') === lastDot)
    decimal = '.'
  if (!decimal)
    return value.replace(/[,.]/g, '')
  const at = value.lastIndexOf(decimal)
  return `${value.slice(0, at).replace(/[,.]/g, '')}.${value.slice(at + 1).replace(/[,.]/g, '')}`
}

/** A typed amount as a number; undefined for blank or unreadable text. */
export function parseAmountInput(text: string): number | undefined {
  const value = Number.parseFloat(normalizeAmountText(text))
  return Number.isFinite(value) ? value : undefined
}
