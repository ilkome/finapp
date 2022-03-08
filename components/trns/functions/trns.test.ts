import { describe, expect, it } from 'vitest'
import type { TrnItem, TrnTransaction, TrnTransfer } from '~/components/trns/types'
import { TrnType } from '~/components/trns/types'
import { getWalletAmount } from '~/components/wallets/functions/getWalletAmount'
import { getTrnsIds } from '~/components/trns/functions/getTrns'

describe('trns', () => {
  const trnsItems = {
    incomeTransaction: {
      categoryId: 'income',
      walletId: 'walletId1',
      type: TrnType.Income,
      amount: 1000,
    } as TrnTransaction,

    expenseTransaction: {
      type: TrnType.Expense,
      categoryId: 'expense',
      walletId: 'walletId1',
      amount: 400,
    } as TrnItem,

    transferSameCurrncy: {
      type: TrnType.Transfer,
      categoryId: 'transfer',
      incomeAmount: 40,
      incomeWalletId: 'walletId2',
      expenseAmount: 40,
      expenseWalletId: 'walletId1',
    } as TrnTransfer,

    transferReverse: {
      type: TrnType.Transfer,
      categoryId: 'transfer',
      incomeAmount: 10,
      incomeWalletId: 'walletId1',
      expenseAmount: 30,
      expenseWalletId: 'walletId2',
    } as TrnTransfer,

    transferDifCurrncy: {
      type: TrnType.Transfer,
      categoryId: 'transfer',
      incomeAmount: 20,
      incomeWalletId: 'walletId2',
      expenseAmount: 10,
      expenseWalletId: 'walletId1',
    } as TrnTransfer,
  }

  const trnsIdsInWallet1 = getTrnsIds({ walletsIds: ['walletId1'], trnsItems })
  const wallet1Amount = getWalletAmount({
    walletId: 'walletId1',
    trnsIds: trnsIdsInWallet1,
    trnsItems,
  })
  const trnsIdsInWallet2 = getTrnsIds({ walletsIds: ['walletId2'], trnsItems })

  const wallet2Amount = getWalletAmount({
    walletId: 'walletId2',
    trnsIds: trnsIdsInWallet2,
    trnsItems,
  })

  it('get right trns', () => {
    expect(trnsIdsInWallet1).toEqual(['incomeTransaction', 'expenseTransaction', 'transferSameCurrncy', 'transferReverse', 'transferDifCurrncy'])
    expect(trnsIdsInWallet2).toEqual(['transferSameCurrncy', 'transferReverse', 'transferDifCurrncy'])
  })

  it('get right amount', () => {
    expect(wallet1Amount).toEqual({
      income: 1000 + 10,
      expense: 400 + 40 + 10,
      total: 1000 + 10 - 400 - 40 - 10,
    })
    expect(wallet2Amount).toEqual({
      income: 40 + 20,
      expense: 30,
      total: 40 + 20 - 30,
    })
  })
})
