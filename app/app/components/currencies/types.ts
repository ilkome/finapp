import { z } from 'zod/v4'
import { CURRENCY_SCALES, MAX_SCALE } from '~~/utils/money/scale'

export type CurrencyCode = string

export const ratesSchema = z.record(z.string(), z.number())

export type Rates = z.infer<typeof ratesSchema>

export const minorDisplays = ['auto', 'always', 'never'] as const

/** A `currencies` row: a custom currency, or the user's edits of a built-in one (null fields keep the built-in's). */
export const currencyItemSchema = z.object({
  code: z.string().regex(/^[A-Z0-9]{2,10}$/),
  createdAt: z.number().optional(),
  manualRate: z.number().positive().optional(),
  manualRateCurrencyCode: z.string().optional(),
  minorDisplay: z.enum(minorDisplays).optional(),
  name: z.string().optional(),
  scale: z.number().int().min(0).max(MAX_SCALE).optional(),
  symbol: z.string().optional(),
  updatedAt: z.number().optional(),
})

export type CurrencyItem = z.infer<typeof currencyItemSchema>

export function isBuiltInCurrency(code: CurrencyCode): boolean {
  return code in CURRENCY_SCALES
}

export type CurrencyError = 'builtInCode' | 'code' | 'rate' | 'rateRequired' | 'scale'

/** The table's check constraints plus the custom-currency rules, so a saved row is never dropped by the server. */
export function validateCurrency(item: CurrencyItem, isNew: boolean): CurrencyError | null {
  if (!/^[A-Z0-9]{2,10}$/.test(item.code))
    return 'code'
  const builtIn = isBuiltInCurrency(item.code)
  if (isNew && builtIn)
    return 'builtInCode'
  if (!builtIn && (item.scale === undefined || !Number.isInteger(item.scale) || item.scale < 0 || item.scale > MAX_SCALE))
    return 'scale'
  if ((item.manualRate === undefined) !== (item.manualRateCurrencyCode === undefined))
    return 'rate'
  if (item.manualRate !== undefined && !(item.manualRate > 0))
    return 'rate'
  if (item.manualRateCurrencyCode === item.code)
    return 'rate'
  if (!builtIn && item.manualRate === undefined)
    return 'rateRequired'
  return null
}
