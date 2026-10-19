import { describe, expect, it } from 'vitest'
import { addCivilMonths, localInstantToCivilDay } from '~~/utils/date/civil'

import type { LoanTrn } from '~/components/loans/engine/types'

import { buildDemoLoans } from '~/components/demo/buildDemoLoans'
import { demoLoans, demoLoanStart } from '~/components/demo/data'
import { bankDebtCheck } from '~/components/loans/engine/bankDebt'
import { deriveLoan, overridesByLoan, paramsOf } from '~/components/loans/engine/derive'
import { generateSchedule } from '~/components/loans/engine/schedule'
import { loanIdFor, loanItemSchema } from '~/components/loans/types'
import { trnWalletDelta } from '~/components/trns/types'

// Demo data is built back from the moment it is generated, so the mix must hold on any day.
describe.each(['2026-01-31T12:00:00', '2026-10-08T09:00:00', '2028-02-29T23:00:00'])('demo loans generated on %s', (now) => {
  const instant = Date.parse(now)
  const today = localInstantToCivilDay(instant)
  const isRepaid = demoLoans.map((config) => {
    if (config.payoff !== undefined)
      return true
    const start = demoLoanStart(config, today)
    const loan = loanItemSchema.parse({ ...config, firstPaymentDate: addCivilMonths(start, 1), startDate: start })
    return generateSchedule(paramsOf(loan)).at(-1)!.date <= today
  })

  it('has both repaid and still running loans', () => {
    expect(isRepaid.filter(Boolean).length).toBeGreaterThanOrEqual(2)
    expect(isRepaid.filter(repaid => !repaid).length).toBeGreaterThanOrEqual(2)
  })
})

describe.each(['2026-01-31T12:00:00', '2026-10-08T09:00:00', '2028-02-29T23:00:00'])('demo loan trns generated on %s', (now) => {
  const today = localInstantToCivilDay(Date.parse(now))
  const built = buildDemoLoans({ convert: amount => amount, currencyOf: () => 'RUB', locale: 'en', money: amount => amount, round: amount => amount, today })
  const overrides = overridesByLoan(built.scheduleOverrides)

  it.each(demoLoans.map(config => config.walletId))('%s: the schedule explains the wallet balance', (walletId) => {
    const loan = built.loans[loanIdFor(walletId)]!
    let balance = 0
    const loanTrns: LoanTrn[] = []
    for (const [id, trn] of Object.entries(built.trns)) {
      balance += trnWalletDelta(trn, walletId)
      if (trn.type === 'transfer' && trn.toWalletId === walletId)
        loanTrns.push({ amount: trn.toAmount!, date: trn.date, id, kind: 'payment' })
      if (trn.type === 'expense' && trn.fromWalletId === walletId && (trn.categoryId === 'loan_interest' || trn.categoryId === 'loan_fine'))
        loanTrns.push({ amount: trn.fromAmount!, date: trn.date, id, kind: trn.categoryId === 'loan_interest' ? 'interest' : 'fine' })
    }

    const summary = deriveLoan(loan, overrides.get(loanIdFor(walletId)) ?? [], loanTrns, balance, today)
    expect(Math.abs(summary.unrecognized)).toBe(0)
    const report = built.bankReports[walletId]
    if (report?.debtAmount !== undefined)
      expect(Math.abs(bankDebtCheck({ report, rows: summary.rows, today, walletBalance: balance })!.diff)).toBe(0)
  })
})
