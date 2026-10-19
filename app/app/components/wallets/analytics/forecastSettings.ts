import { z } from 'zod/v4'

export const amountModes = ['median', 'average', 'max', 'last'] as const
export type AmountMode = typeof amountModes[number]

const regularOverrideSchema = z.object({
  /** Monthly amount in base currency; absent keeps the detected one. */
  amount: z.number().min(0).optional(),
  state: z.enum(['exclude', 'include']),
})
export type RegularOverride = z.infer<typeof regularOverrideSchema>

// `.catch` per field: one bad value from an older or newer client resets only itself.
const forecastSettingsSchema = z.object({
  amountMode: z.enum(amountModes).default('median').catch('median'),
  /** Card obligation: the minimum payment every month, or the whole statement debt once. */
  cardPayment: z.enum(['full', 'min']).default('min').catch('min'),
  /** Detect on parent categories, children summed in. */
  groupByParent: z.boolean().default(false).catch(false),
  horizonMonths: z.number().int().min(1).max(60).default(12).catch(12),
  /** A category is regular when it has spending in at least this many months of the window. */
  minMonths: z.number().int().min(1).max(24).default(5).catch(5),
  overrides: z.record(z.string(), regularOverrideSchema).default({}).catch({}),
  /** Wallets the forecast starts from; empty means every wallet available for withdrawal. */
  walletIds: z.array(z.string()).default([]).catch([]),
  windowMonths: z.number().int().min(1).max(24).default(6).catch(6),
})

export type ForecastSettings = z.infer<typeof forecastSettingsSchema>

/** Stored value (JSON text from SQLite, an object from the cache, or nothing) to settings with every default filled. */
export function parseForecastSettings(raw: unknown): ForecastSettings {
  let value = raw
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw)
    }
    catch {
      value = {}
    }
  }
  return forecastSettingsSchema.parse(value && typeof value === 'object' ? value : {})
}
