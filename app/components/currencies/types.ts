import { z } from 'zod/v4'

export type CurrencyCode = string

export const ratesSchema = z.record(z.string(), z.number())

export type Rates = z.infer<typeof ratesSchema>
