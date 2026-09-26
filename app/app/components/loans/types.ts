import { z } from 'zod/v4'

import type { TrnFormValues } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

export type LoanId = string

export const loanScheduleTypes = ['annuity', 'differentiated'] as const
export const loanOverpaymentModes = ['reducePayment', 'reduceTerm'] as const
export const loanInterestMethods = ['monthly', 'daily'] as const

export const loanItemSchema = z.object({
  // null: the bank publishes no contract rate (0 is a real interest-free loan).
  annualRate: z.number().nullable().default(null),
  // Pushed by bank sync: the debt the bank reports and when it was read.
  bankDebtAmount: z.number().optional(),
  bankDebtUpdatedAt: z.number().optional(),
  contractNumber: z.string().default(''),
  // Wallet the payment is debited from; enables the "not enough money" signal.
  debitWalletId: z.string().optional(),
  desc: z.string().default(''),
  // Civil day (UTC-midnight ms-epoch), stated by the contract - never derived from startDate.
  firstPaymentDate: z.number().default(() => Date.now()),
  // How interest accrues: `monthly` is rate / 12, `daily` is actual/365 like most banks.
  interestMethod: z.enum(loanInterestMethods).default('monthly'),
  // Days a payment may come after its due date and still count as on time.
  lateAfterDays: z.number().int().min(0).default(3),
  // Pushed by bank sync: the bank's own split of the next payment (civil day).
  nextPaymentDate: z.number().optional(),
  nextPaymentInterest: z.number().optional(),
  nextPaymentPrincipal: z.number().optional(),
  overpaymentMode: z.enum(loanOverpaymentModes).default('reducePayment'),
  paymentDay: z.number().int().min(1).max(31).default(1),
  // A payment more than this many days before the next due date is a prepayment, not that payment.
  prepayWindowDays: z.number().int().min(0).default(15),
  principalAmount: z.number().default(0),
  scheduleType: z.enum(loanScheduleTypes).default('annuity'),
  startDate: z.number().default(() => Date.now()),
  termMonths: z.number().int().positive().default(12),
  updatedAt: z.number().default(() => Date.now()),
  walletId: z.string().min(1),
})

// Only imported or hand-edited rows are stored; a generated row is represented by its absence.
export const loanScheduleRowSchema = z.object({
  date: z.number(),
  interestPart: z.number(),
  loanId: z.string().min(1),
  paymentNumber: z.number().int().min(1),
  principalPart: z.number(),
  source: z.enum(['bank', 'manual']).default('manual'),
  totalAmount: z.number(),
  updatedAt: z.number().default(() => Date.now()),
})

export type LoanItem = z.infer<typeof loanItemSchema>
export type Loans = Record<LoanId, LoanItem>

export type LoanScheduleRowId = string
export type LoanScheduleRowItem = z.infer<typeof loanScheduleRowSchema>
export type LoanScheduleRows = Record<LoanScheduleRowId, LoanScheduleRowItem>

export function getDefaultLoanItem(walletId: WalletId): LoanItem {
  return loanItemSchema.parse({ walletId })
}

// Deterministic ids, same scheme as bank-sync loans-import (loan:<walletId>, lsr:<loanId>:<n>), so offline
// creates/edits of the same wallet's loan or schedule row on two devices
// converge to the same row instead of hitting the unique-constraint conflict.
export const loanIdFor = (walletId: WalletId): LoanId => `loan:${walletId}`
export function loanScheduleRowIdFor(loanId: LoanId, paymentNumber: number): LoanScheduleRowId {
  return `lsr:${loanId}:${paymentNumber}`
}

/** Interest of a loan payment: saved as the credit wallet's expense next to the payment transfer. */
export type LoanInterestDraft = {
  amount: number
  amountRaw: string
  isEnabled: boolean
}

export type TrnFormValuesWithLoan = TrnFormValues & {
  loanInterest?: LoanInterestDraft
}
