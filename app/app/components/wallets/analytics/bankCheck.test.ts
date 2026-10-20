import { describe, expect, it } from 'vitest'

import type { BankReports } from '~/components/bankReports/types'
import type { Trns } from '~/components/trns/types'
import type { Wallets } from '~/components/wallets/types'

import { bankMismatches } from '~/components/wallets/analytics/bankCheck'

const day = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const wallet = { currencyCode: 'RUB', type: 'cash' } as Wallets[string]
const wallets: Wallets = { a: wallet, b: wallet, c: wallet }
const trns: Trns = {
  t1: { categoryId: 'salary', createdAt: 0, date: day('2026-01-10'), toAmount: 100, toWalletId: 'a', type: 'income', updatedAt: 0 },
  t2: { categoryId: 'food', createdAt: 0, date: day('2026-02-05'), fromAmount: 30, fromWalletId: 'a', type: 'expense', updatedAt: 0 },
  t3: { categoryId: 'salary', createdAt: 0, date: day('2026-01-10'), toAmount: 50, toWalletId: 'b', type: 'income', updatedAt: 0 },
}
const report = (balanceAmount: number, iso: string) => ({ balanceAmount, balanceDate: day(iso), createdAt: 0, updatedAt: 0 })

describe('bankMismatches', () => {
  it('compares each wallet on its own bank day and skips matches and wallets without a report', () => {
    const reports: BankReports = { a: report(100, '2026-01-31'), b: report(40, '2026-02-10') }
    expect(bankMismatches(trns, wallets, reports, ['a', 'b', 'c'])).toEqual([{ diff: -10, walletId: 'b' }])
    expect(bankMismatches(trns, wallets, { a: report(100, '2026-02-05') }, ['a'])).toEqual([{ diff: 30, walletId: 'a' }])
  })
})
