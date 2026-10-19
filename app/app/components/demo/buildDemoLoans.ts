import { addCivilDays, addCivilMonths } from '~~/utils/date/civil'

import type { BankReports } from '~/components/bankReports/types'
import type { LoanParams, LoanTrn, ScheduleOverride } from '~/components/loans/engine/types'
import type { LoanItem, Loans, LoanScheduleOverrides } from '~/components/loans/types'
import type { LocaleSlug } from '~/components/locale/types'
import type { TrnItem, Trns } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { demoLoans, demoLoanStart, walletDebitRub } from '~/components/demo/data'
import { paramsOf } from '~/components/loans/engine/derive'
import { reconcileSchedule } from '~/components/loans/engine/reconcile'
import { generateSchedule } from '~/components/loans/engine/schedule'
import { loanIdFor, loanItemSchema, loanScheduleOverrideIdFor, loanScheduleOverrideSchema } from '~/components/loans/types'

/**
 * A bank's own schedule stored in full, every row: the `interestOnly` payments repay no principal
 * and push the term out by as many months, like a payment holiday does.
 */
function bankSchedule(params: LoanParams, interestOnly: number[]): ScheduleOverride[] {
  const extended = { ...params, termMonths: params.termMonths + interestOnly.length }
  const overrides: ScheduleOverride[] = []
  for (const n of interestOnly) {
    const row = generateSchedule(extended, overrides)[n - 1]!
    overrides.push({ date: row.date, interestPart: row.interestPart, paymentNumber: n, principalPart: 0, source: 'bank', totalAmount: row.interestPart })
  }
  return generateSchedule(extended, overrides).map(({ date, interestPart, paymentNumber, principalPart, totalAmount }) =>
    ({ date, interestPart, paymentNumber, principalPart, source: 'bank' as const, totalAmount }))
}

/**
 * Demo loans with their trns, bank schedule overrides and bank reports (the debt a bank reports). Amounts are minor
 * units: `convert`, `money` and `round` return minor units of the target currency. Each due payment is one transfer from the
 * loan's debit wallet (converted when the currencies differ) plus its interest as the credit
 * wallet's own expense. The plan is re-read after every payment, so a prepayment re-solves the tail
 * the way the app does. Every date is a civil day.
 */
export function buildDemoLoans(ctx: {
  convert: (amount: number, from: string, to: string) => number
  currencyOf: (walletId: WalletId) => string
  locale: LocaleSlug
  /** A RUB-scale amount in the currency of the wallet it lands on. */
  money: (rubScale: number, walletId: WalletId) => number
  /** A RUB-scale round figure in `currency`. */
  round: (rubScale: number, currency: string) => number
  today: number
}) {
  const { convert, currencyOf, locale, money, round, today } = ctx
  const at = (date: number) => ({ createdAt: date, date, updatedAt: Date.now() })
  const trns: Trns = {}
  const scheduleOverrides: LoanScheduleOverrides = {}
  const bankReports: BankReports = {}

  const loans = demoLoans.map((config): LoanItem => {
    const currency = currencyOf(config.walletId)
    const paymentWalletId = config.debitWalletId ?? walletDebitRub
    /** A loan-currency amount as it leaves or reaches the debit wallet. */
    const onDebit = (amount: number) => Math.round(convert(amount, currency, currencyOf(paymentWalletId)))
    const start = demoLoanStart(config, today)
    const loan = loanItemSchema.parse({
      annualRatePercent: config.annualRate,
      firstPaymentDate: addCivilMonths(start, 1),
      interestAccrual: config.interestMethod,
      lateAfterDays: config.lateAfterDays,
      paymentDayOfMonth: config.paymentDay,
      paymentWalletId,
      prepaymentMode: config.overpaymentMode === 'reduceTerm' ? 'reduce_term' : 'reduce_payment',
      principalAmount: round(config.principalAmount, currency),
      scheduleType: config.scheduleType,
      startDate: start,
      termMonths: config.termMonths,
      walletId: config.walletId,
    })
    const loanId = loanIdFor(loan.walletId)
    const params = paramsOf(loan)
    const overrides = config.bankRate === undefined ? [] : bankSchedule({ ...params, annualRate: config.bankRate }, config.interestOnly ?? [])
    for (const row of overrides)
      scheduleOverrides[loanScheduleOverrideIdFor(loanId, row.paymentNumber)] = loanScheduleOverrideSchema.parse({ dueDate: row.date, interestAmount: row.interestPart, loanId, paymentNumber: row.paymentNumber, principalAmount: row.principalPart, source: row.source, totalAmount: row.totalAmount })

    trns[`demo_loan_${loan.walletId}_taken`] = config.purchase
      ? { ...at(loan.startDate), categoryId: config.purchase.categoryId, description: config.purchase.desc[locale], fromAmount: loan.principalAmount, fromWalletId: loan.walletId, type: 'expense' } satisfies TrnItem
      : { ...at(loan.startDate), fromAmount: loan.principalAmount, fromWalletId: loan.walletId, toAmount: onDebit(loan.principalAmount), toWalletId: paymentWalletId, type: 'transfer' } satisfies TrnItem

    const schedule = generateSchedule(params, overrides)
    const dueCount = schedule.filter(row => row.date <= today).length
    /** Payment number of a deviation counted back from the latest due payment. */
    const numberAgo = (ago: number | undefined) => ago === undefined ? null : dueCount - ago

    const paid: LoanTrn[] = []
    const skipped = new Set<number>()
    let prepaid = false
    let carried: { interest: number, total: number } | null = null
    const pay = (kind: LoanTrn['kind'], amount: number, date: number) => {
      const id = `demo_loan_${loan.walletId}_${paid.length}`
      paid.push({ amount, date, id, kind })
      trns[id] = kind === 'payment'
        ? { ...at(date), fromAmount: onDebit(amount), fromWalletId: paymentWalletId, toAmount: amount, toWalletId: loan.walletId, type: 'transfer' } satisfies TrnItem
        : { ...at(date), categoryId: kind === 'interest' ? 'loan_interest' : 'loan_fine', fromAmount: amount, fromWalletId: loan.walletId, type: 'expense' } satisfies TrnItem
    }

    // Every pass settles or skips one row, so a pass count past twice the schedule means a row
    // never reaches paid: stop instead of hanging the tab.
    for (let guard = 0; guard < schedule.length * 2; guard++) {
      // By status: a row caught up by an earlier payment is paid without transactions of its own.
      const row = reconcileSchedule(params, schedule, paid, today)
        .find(r => (r.status === 'scheduled' || r.status === 'overdue') && r.totalAmount > 0 && !skipped.has(r.paymentNumber))
      if (!row || row.date > today)
        break
      const n = row.paymentNumber

      if ((config.missed && n === dueCount) || n === numberAgo(config.catchUp)) {
        skipped.add(n)
        if (n !== dueCount)
          carried = { interest: row.interestPart, total: row.totalAmount }
        continue
      }
      if (n === numberAgo(config.payoff)) {
        // The whole debt left before this row plus its interest: the tail re-solves to nothing.
        pay('payment', row.remainingBalance + row.principalPart + row.interestPart, row.date)
        pay('interest', row.interestPart, row.date)
        break
      }
      if (!prepaid && n === numberAgo(config.prepayment?.paymentsAgo)) {
        // Re-read the plan: under reduce_payment the prepayment lowers this very payment.
        pay('payment', round(config.prepayment!.amount, currency), addCivilDays(row.date, -21))
        prepaid = true
        continue
      }

      const date = n === numberAgo(config.late) ? addCivilDays(row.date, 5) : row.date
      const interest = row.interestPart + (carried?.interest ?? 0)
      // The bank takes the late fee out of the payment, so the transfer carries it on top.
      const fine = carried ? Math.round(money(700, loan.walletId)) : 0
      pay('payment', row.totalAmount + (carried?.total ?? 0) + fine, date)
      if (interest > 0)
        pay('interest', interest, date)
      if (fine > 0)
        pay('fine', fine, date)
      carried = null
    }

    if (config.bankDebt) {
      const balance = paid.reduce((total, trn) => trn.kind === 'payment' ? total - trn.amount : total + trn.amount, loan.principalAmount)
      const reportDate = addCivilDays(today, -2)
      bankReports[loan.walletId] = { createdAt: reportDate, debtAmount: balance, debtReportDate: reportDate, updatedAt: reportDate }
    }
    return loan
  })

  return {
    bankReports,
    loans: Object.fromEntries(loans.map(loan => [loanIdFor(loan.walletId), loan])) as Loans,
    scheduleOverrides,
    trns,
  }
}
