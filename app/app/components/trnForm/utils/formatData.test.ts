import { describe, expect, it } from 'vitest'

import type { Transaction, Transfer, TrnFormValues } from '~/components/trns/types'

import { formatTransaction, formatTransfer } from '~/components/trnForm/utils/formatData'

const valuesBase: TrnFormValues = {
  amount: [10, 20, 30],
  amountRaw: ['10', '20', '30'],
  categoryId: 'CategoryId',
  date: 99999,
  expenseWalletId: 'expenseWalletId',
  incomeWalletId: 'incomeWalletId',
  transferType: 'income',
  trnId: 'id',
  trnType: 2,
  walletId: 'WalletId',
}

const transaction: {
  generated: Transaction
  raw: TrnFormValues
} = {
  generated: {
    amount: 10,
    categoryId: 'CategoryId',
    date: 99999,
    type: 0,
    updatedAt: 1690711427451,
    walletId: 'WalletId',
  },
  raw: {
    ...valuesBase,
    transferType: 'income',
    trnType: 0,
  },
}

const transfer: {
  generated: Transfer
  raw: TrnFormValues
} = {
  generated: {
    categoryId: 'transfer',
    date: 99999,
    expenseAmount: 20,
    expenseWalletId: 'expenseWalletId',
    incomeAmount: 30,
    incomeWalletId: 'incomeWalletId',
    type: 2,
    updatedAt: 1690711427451,
  },
  raw: {
    ...valuesBase,
    transferType: 'income',
    trnType: 2,
  },
}

const transactions = [{
  data: {
    become: {
      ...transaction.generated,
    } as Transaction | false,
    expect: {
      ...transaction.raw,
    } as TrnFormValues,
  },
  name: 'Format income',
}, {
  data: {
    become: false,
    expect: {
      ...transaction.raw,
      trnType: 2,
    } as TrnFormValues,
  },
  name: 'Format with wrong type',
}, {
  data: {
    become: false,
    expect: {
      ...transaction.raw,
      categoryId: null,
    } as TrnFormValues,
  },
  name: 'Format with missing CategoryId',
}]

const transfers = [{
  data: {
    become: {
      ...transfer.generated,
    } as Transfer,
    expect: {
      ...transfer.raw,
    } as TrnFormValues,
  },
  name: 'Format values',
}, {
  data: {
    become: false,
    expect: {
      ...transfer.raw,
      trnType: 1,
    } as TrnFormValues,
  },
  name: 'Format with wrong type',
}, {
  data: {
    become: false,
    expect: {
      ...transfer.raw,
      expenseWalletId: null,
    } as TrnFormValues,
  },
  name: 'Format with missing expenseWalletId',
}]

/**
 * Tests
 */
const tests = [{
  id: 'transactions',
  name: 'Format Transaction to put on server',
  variants: transactions,
}, {
  id: 'transfers',
  name: 'Format Transfer to put on server',
  variants: transfers,
}]

/**
 * Run
 */
tests.forEach((test) => {
  describe(test.name, () => {
    test.variants.forEach((variant) => {
      it(variant.name, () => {
        const rawData = test.id === 'transactions'
          ? formatTransaction(variant.data.expect)
          : formatTransfer(variant.data.expect)

        // Strip updatedAt (dynamic timestamp) before comparison
        let data: Omit<Transaction, 'updatedAt'> | Omit<Transfer, 'updatedAt'> | false = rawData
        if (rawData) {
          const { updatedAt: _u, ...rest } = rawData
          data = rest
        }

        let res: Omit<Transaction, 'updatedAt'> | Omit<Transfer, 'updatedAt'> | false
        if (variant.data.become && typeof variant.data.become === 'object') {
          const { updatedAt: _u, ...rest } = variant.data.become
          res = rest
        }
        else {
          res = false
        }

        expect(data).toEqual(res)
      })
    })
  })
})
