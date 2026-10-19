import { z } from 'zod/v4'

import type { WalletId } from '~/components/wallets/types'

const day = z.number().int().refine(value => value % 86400000 === 0, 'must be a civil day')
const money = z.number().int().min(0)

/**
 * The latest figures the bank shows for a wallet, entered by hand or written through the API; id = the wallet id.
 * Every field is optional: a feature that reads one falls back to the app's own calculation when it is absent.
 * Amounts are minor units of the wallet's currency.
 */
export const bankReportSchema = z.object({
  // The balance the bank shows and the civil day it is for (set together).
  balanceAmount: z.number().int().optional(),
  balanceDate: day.optional(),
  createdAt: z.number().int().default(() => Date.now()),
  // Loan: the debt the bank reports and the day it was read.
  debtAmount: money.optional(),
  debtReportDate: day.optional(),
  // Card: statement debt to repay to keep the interest-free period, and the day the period ends.
  graceDebtAmount: money.optional(),
  graceEndDate: day.optional(),
  // Card: the minimum payment, its due day, and the day its billing period started.
  minPaymentAmount: money.optional(),
  minPaymentDueDate: day.optional(),
  minPaymentPeriodStartDate: day.optional(),
  // Loan: the bank's split of the next payment.
  nextInterestAmount: money.optional(),
  nextPaymentDate: day.optional(),
  nextPrincipalAmount: money.optional(),
  statementDate: day.optional(),
  updatedAt: z.number().int().default(() => Date.now()),
}).refine(r => (r.balanceAmount === undefined) === (r.balanceDate === undefined), 'balance amount and day are set together')

export type BankReport = z.infer<typeof bankReportSchema>
export type BankReports = Record<WalletId, BankReport>
