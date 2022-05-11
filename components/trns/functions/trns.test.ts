import { describe, expect, it } from 'vitest'
import { getTrnsIds } from '~/components/trns/functions/getTrns'
import { TrnType } from '~/components/trns/types'
import type { TrnTransaction, TrnTransfer } from '~/components/trns/types'

const trnsItems = {
  incomeTransaction: {
    amount: 1000,
    categoryId: 'income',
    type: TrnType.Income,
    walletId: 'walletId1',
  } as TrnTransaction,

  expenseTransaction: {
    amount: 400,
    categoryId: 'expense',
    type: TrnType.Expense,
    walletId: 'walletId1',
  } as TrnTransaction,

  transferSameCurrncy: {
    categoryId: 'transfer',
    expenseAmount: 40,
    expenseWalletId: 'walletId1',
    incomeAmount: 40,
    incomeWalletId: 'walletId2',
    type: TrnType.Transfer,
  } as TrnTransfer,

  transferReverse: {
    categoryId: 'transfer',
    expenseAmount: 30,
    expenseWalletId: 'walletId2',
    incomeAmount: 10,
    incomeWalletId: 'walletId1',
    type: TrnType.Transfer,
  } as TrnTransfer,

  transferDifCurrncy: {
    categoryId: 'transfer',
    expenseAmount: 10,
    expenseWalletId: 'walletId1',
    incomeAmount: 20,
    incomeWalletId: 'walletId2',
    type: TrnType.Transfer,
  } as TrnTransfer,
}

describe('trns', () => {
  const trnsIdsInWallet1 = getTrnsIds({ walletsIds: ['walletId1'], trnsItems })
  const trnsIdsInWallet2 = getTrnsIds({ walletsIds: ['walletId2'], trnsItems })

  it('get right trns', () => {
    expect(trnsIdsInWallet1).toEqual(['incomeTransaction', 'expenseTransaction', 'transferSameCurrncy', 'transferReverse', 'transferDifCurrncy'])
    expect(trnsIdsInWallet2).toEqual(['transferSameCurrncy', 'transferReverse', 'transferDifCurrncy'])
  })
})
