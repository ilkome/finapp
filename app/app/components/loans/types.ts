import { z } from 'zod/v4'

import type { TrnFormValues } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

export type LoanId = string

export const loanScheduleTypes = ['annuity', 'differentiated'] as const
export const loanPrepaymentModes = ['reduce_payment', 'reduce_term'] as const
export const loanInterestAccruals = ['monthly', 'daily'] as const

const isDay = (value: number) => value % 86400000 === 0

// Amounts are integer minor units of the loan wallet's currency; days are civil days (UTC-midnight ms).
export const loanItemSchema = z.object({
  // null: the bank publishes no contract rate (0 is a real interest-free loan).
  annualRatePercent: z.number().min(0).nullable().default(null),
  // Civil day the user marked the loan closed; set when the bank closed it with a balance gap left.
  closedDate: z.number().int().refine(isDay).optional(),
  contractNumber: z.string().default(''),
  createdAt: z.number().int().default(() => Date.now()),
  description: z.string().default(''),
  // Stated by the contract - never derived from startDate.
  firstPaymentDate: z.number().int().refine(isDay),
  // How interest accrues: `monthly` is rate / 12, `daily` is actual/actual like most banks.
  interestAccrual: z.enum(loanInterestAccruals).default('monthly'),
  // Days a payment may come after its due date and still count as on time.
  lateAfterDays: z.number().int().min(0).default(3),
  paymentDayOfMonth: z.number().int().min(1).max(31).default(1),
  // Wallet the payment is debited from; enables the "not enough money" signal.
  paymentWalletId: z.string().optional(),
  prepaymentMode: z.enum(loanPrepaymentModes).default('reduce_payment'),
  // A payment more than this many days before the next due date is a prepayment, not that payment.
  prepaymentWindowDays: z.number().int().min(0).default(15),
  principalAmount: z.number().int().min(0).default(0),
  scheduleType: z.enum(loanScheduleTypes).default('annuity'),
  startDate: z.number().int().refine(isDay),
  // Same cap as the form preview: the schedule is generated in a computed on every device.
  termMonths: z.number().int().positive().max(600).default(12),
  updatedAt: z.number().int().default(() => Date.now()),
  // The loan's id: the loan row has no column of its own for it.
  walletId: z.string().min(1),
})

// Only payments that differ from the generated schedule are stored; a generated one is represented by its absence.
export const loanScheduleOverrideSchema = z.object({
  createdAt: z.number().int().default(() => Date.now()),
  dueDate: z.number().int().refine(isDay),
  interestAmount: z.number().int().min(0),
  loanId: z.string().min(1),
  paymentNumber: z.number().int().min(1),
  principalAmount: z.number().int().min(0),
  source: z.enum(['bank', 'manual']).default('manual'),
  totalAmount: z.number().int().min(0),
  updatedAt: z.number().int().default(() => Date.now()),
})

export type LoanItem = z.infer<typeof loanItemSchema>
export type Loans = Record<LoanId, LoanItem>

export type LoanScheduleOverrideId = string
export type LoanScheduleOverrideItem = z.infer<typeof loanScheduleOverrideSchema>
export type LoanScheduleOverrides = Record<LoanScheduleOverrideId, LoanScheduleOverrideItem>

export function getDefaultLoanItem(walletId: WalletId, today: number): LoanItem {
  return loanItemSchema.parse({ firstPaymentDate: today, startDate: today, walletId })
}

// Deterministic ids, so offline creates of the same loan or schedule override on two devices land on one row.
export const loanIdFor = (walletId: WalletId): LoanId => walletId
export function loanScheduleOverrideIdFor(loanId: LoanId, paymentNumber: number): LoanScheduleOverrideId {
  return `${loanId}:${paymentNumber}`
}

/** Interest of a loan payment: saved as the credit wallet's expense next to the payment transfer. */
type LoanInterestDraft = {
  amount: number
  amountRaw: string
  isEnabled: boolean
}

export type TrnFormValuesWithLoan = TrnFormValues & {
  loanInterest?: LoanInterestDraft
}

/** Keep the entries of a stored map that pass `schema`, with its defaults applied (demo snapshot). */
export function parseValidEntries<T>(schema: z.ZodType<T>, raw: unknown): Record<string, T> {
  return Object.fromEntries(Object.entries(raw ?? {}).flatMap(([id, value]) => {
    const parsed = schema.safeParse(value)
    return parsed.success ? [[id, parsed.data]] : []
  }))
}
