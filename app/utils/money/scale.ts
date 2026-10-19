/**
 * Decimal places of each currency's minor unit, pinned forever: a stored amount is an integer count of minor
 * units, so a scale that changed would change the meaning of every stored amount. Fiat follows ISO 4217;
 * crypto keeps its native decimals capped at 9, so a balance stays within 2^53 units. Never read from `Intl`
 * at run time: browsers' currency data differs and changes.
 * The data-model migration holds a copy of this table as SQL `VALUES`; a test keeps them equal.
 */
const SCALE_GROUPS: Record<number, string[]> = {
  0: ['BIF', 'CLP', 'DJF', 'GNF', 'ISK', 'JPY', 'KMF', 'KRW', 'PYG', 'RWF', 'UGX', 'UYI', 'VND', 'VUV', 'XAF', 'XBA', 'XBB', 'XBC', 'XBD', 'XDR', 'XOF', 'XPF', 'XSU', 'XTS', 'XUA', 'XXX'],
  2: ['AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BMD', 'BND', 'BOB', 'BOV', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHE', 'CHF', 'CHW', 'CNH', 'CNY', 'COP', 'COU', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP', 'GMD', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IRR', 'JMD', 'KES', 'KGS', 'KHR', 'KPW', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MXV', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'QAR', 'RON', 'RSD', 'RUB', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SRD', 'SSP', 'STN', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'USD', 'USN', 'UYU', 'UZS', 'VES', 'WST', 'XCD', 'YER', 'ZAR', 'ZMW', 'ZWL'],
  3: ['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND'],
  4: ['CLF', 'UYW'],
  6: ['USDT', 'XAG', 'XAU', 'XPD', 'XPT', 'XRP'],
  8: ['BTC', 'DOGE'],
  9: ['ETH', 'SOL', 'TON'],
}

export const MAX_SCALE = 9

export const CURRENCY_SCALES: Readonly<Record<string, number>> = Object.freeze(Object.fromEntries(
  Object.entries(SCALE_GROUPS).flatMap(([scale, codes]) => codes.map(code => [code, Number(scale)])),
))

/** Scale of a built-in currency, or of one of the user's custom currencies; throws for an unknown code. */
export function currencyScale(code: string, customScales?: Readonly<Record<string, number>>): number {
  const scale = CURRENCY_SCALES[code] ?? customScales?.[code]
  if (scale === undefined)
    throw new Error(`Unknown currency scale: ${code}`)
  return scale
}

/** A decimal value to integer minor units; `toPrecision` drops float noise such as 1.005 * 100 = 100.49999. */
export function toMinor(value: number, scale: number): number {
  return Math.round(Number((value * 10 ** scale).toPrecision(15)))
}

export function fromMinor(minor: number, scale: number): number {
  return minor / 10 ** scale
}

export type MinorDisplay = 'always' | 'auto' | 'never'

/**
 * Minor units as a localized number with the currency's symbol (or code) after it. `auto` shows the fraction
 * only when it is not zero. Decimal style, not `currency` style: `Intl` rejects codes such as `USDT`.
 */
export function formatMinor(minor: number, scale: number, options: {
  locale?: string
  minorDisplay?: MinorDisplay
  symbol?: string
} = {}): string {
  const { locale, minorDisplay = 'auto', symbol } = options
  const showFraction = minorDisplay === 'always' || (minorDisplay === 'auto' && minor % 10 ** scale !== 0)
  const digits = showFraction ? scale : 0
  const value = showFraction ? fromMinor(minor, scale) : Math.round(minor / 10 ** scale)
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value)
  return symbol ? `${number} ${symbol}` : number
}
