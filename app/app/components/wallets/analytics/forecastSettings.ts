import { z } from 'zod/v4'

import type { CategoryId } from '~/components/categories/types'

export const amountModes = ['median', 'average', 'max', 'last'] as const
export type AmountMode = typeof amountModes[number]

export const cardPaymentModes = ['minimum', 'full_debt'] as const
export type CardPaymentMode = typeof cardPaymentModes[number]

/** A manual choice on a category: `state` absent keeps detection, `amount` (base currency) absent keeps the detected amount. */
export type RegularOverride = {
  amount?: number
  state?: 'exclude' | 'include'
}

// `.catch` per field: one bad value from an older or newer client resets only itself.
const forecastSettingsSchema = z.object({
  /** Card obligation: the minimum payment every month, or the whole statement debt once. */
  cardPaymentMode: z.enum(cardPaymentModes).default('minimum').catch('minimum'),
  historyMonths: z.number().int().min(1).max(24).default(6).catch(6),
  horizonMonths: z.number().int().min(1).max(60).default(12).catch(12),
  /** Detect on parent categories, children summed in. */
  isByParentCategory: z.boolean().default(false).catch(false),
  regularAmountMode: z.enum(amountModes).default('median').catch('median'),
  /** A category is regular when it has spending in at least this many months of the history. */
  regularMinMonths: z.number().int().min(1).max(24).default(5).catch(5),
})

export type ForecastSettings = z.infer<typeof forecastSettingsSchema>

/** A stored row (or nothing) to settings with every default filled. */
export function parseForecastSettings(raw: unknown): ForecastSettings {
  return forecastSettingsSchema.parse(raw && typeof raw === 'object' ? raw : {})
}

const forecastCategorySchema = z.object({
  categoryId: z.string().min(1),
  currencyCode: z.string().optional(),
  /** true include, false exclude, absent detected. */
  isIncluded: z.boolean().optional(),
  /** Minor units of `currencyCode`. */
  monthlyAmount: z.number().int().min(0).optional(),
})

export type ForecastCategory = z.infer<typeof forecastCategorySchema>
export type ForecastCategories = Record<CategoryId, ForecastCategory>

/** Stored rows to categories by id; a row the schema rejects is dropped. */
export function parseForecastCategories(raw: unknown): ForecastCategories {
  const result: ForecastCategories = {}
  for (const value of Array.isArray(raw) ? raw : Object.values(raw && typeof raw === 'object' ? raw : {})) {
    const parsed = forecastCategorySchema.safeParse(value)
    if (parsed.success)
      result[parsed.data.categoryId] = parsed.data
  }
  return result
}

/** A stored category as the override detection uses, its amount in base currency. */
export function toRegularOverride(item: ForecastCategory, toBase: (amount: number, currencyCode: string) => number, baseCode: string): RegularOverride | undefined {
  const override: RegularOverride = {}
  if (item.isIncluded !== undefined)
    override.state = item.isIncluded ? 'include' : 'exclude'
  if (item.monthlyAmount !== undefined)
    override.amount = Math.round(toBase(item.monthlyAmount, item.currencyCode ?? baseCode))
  return override.state || override.amount !== undefined ? override : undefined
}
