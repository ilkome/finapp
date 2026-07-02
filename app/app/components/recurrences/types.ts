import { z } from 'zod/v4'

import { TrnType } from '~/components/trns/types'

export type RecurrenceId = string

export const recurrenceFreqs = ['day', 'week', 'month', 'year'] as const
export type RecurrenceFreq = typeof recurrenceFreqs[number]

export const recurrenceEndModes = ['never', 'date', 'count'] as const
export type RecurrenceEndMode = typeof recurrenceEndModes[number]

export const recurrenceStatuses = ['active', 'paused', 'cancelled'] as const
export type RecurrenceStatus = typeof recurrenceStatuses[number]

// One dated price of a series: `amount` applies to occurrences on/after `from` (civil day),
// until the next entry. Enables a price-change history (request 4).
export const amountChangeSchema = z.object({
  amount: z.number().positive(),
  from: z.number(),
})
export type AmountChange = z.infer<typeof amountChangeSchema>

// A recurrence is expense or income only (no transfer). Currency derives from the wallet,
// like trns. anchorDate / endDate are civil days (UTC-midnight ms-epoch). See plans/recurrences.md.
export const recurrenceItemSchema = z.object({
  amount: z.number().positive(),
  // Dated price history (ascending by `from`); the scalar `amount` mirrors the current entry.
  // Absent/empty means the price never changed.
  amountHistory: z.array(amountChangeSchema).optional(),
  anchorDate: z.number(),
  autoCreate: z.boolean(),
  categoryId: z.string().min(1),
  desc: z.string().optional(),
  endCount: z.number().int().positive().nullable().optional(),
  endDate: z.number().nullable().optional(),
  endMode: z.enum(recurrenceEndModes),
  freq: z.enum(recurrenceFreqs),
  interval: z.number().int().min(1),
  // Generation bookkeeping: last occurrence civil-day materialized for autoCreate rules.
  lastGeneratedDate: z.number().nullable().optional(),
  // month freq only: always fire on the last calendar day.
  monthLastDay: z.boolean(),
  // JSON array of skipped occurrence day-keys (YYYY-MM-DD).
  skipDates: z.array(z.string()),
  status: z.enum(recurrenceStatuses),
  type: z.union([z.literal(TrnType.Expense), z.literal(TrnType.Income)]),
  updatedAt: z.number(),
  walletId: z.string().min(1),
})

export type RecurrenceItem = z.infer<typeof recurrenceItemSchema>
export type Recurrences = Record<RecurrenceId, RecurrenceItem>
