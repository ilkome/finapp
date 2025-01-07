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
  transferType: 1,
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
    edited: 1690711427451,
    type: 0,
    walletId: 'WalletId',
  },
  raw: {
    ...valuesBase,
    transferType: 1,
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
    edited: 1690711427451,
    expenseAmount: 20,
    expenseWalletId: 'expenseWalletId',
    incomeAmount: 30,
    incomeWalletId: 'incomeWalletId',
    type: 2,
  },
  raw: {
    ...valuesBase,
    transferType: 1,
    trnType: 2,
  },
}

const transactions = [{
  data: {
    become: false,
    expect: {},
  },
  name: 'Format empty',
}, {
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
    become: false,
    expect: {},
  },
  name: 'Format empty',
}, {
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
}, {
  data: {
    become: false,
    expect: {
      ...transfer.raw,
      trnType: 1,
    } as TrnFormValues,
  },
  name: 'Format with wrong type',
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
        const data = test.id === 'transactions'
          ? formatTransaction(variant.data.expect)
          : formatTransfer(variant.data.expect)
        delete data.editedAt

        const res = variant.data.become
        delete res.editedAt

        expect(data).toEqual(res)
      })
    })
  })
})
