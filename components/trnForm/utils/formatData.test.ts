import { describe, expect, it } from 'vitest'
import type { TrnFormValues } from '~/components/trnForm/types'
import type { Transaction, Transfer } from '~/components/trns/types'
import { formatTransaction, formatTransfer } from '~/components/trnForm/utils/formatData'

const valuesBase: TrnFormValues = {
  id: 'id',
  amount: [10, 20, 30],
  amountRaw: ['10', '20', '30'],
  date: 99999,
  desc: null,
  transferType: 1,
  trnType: 2,
  walletId: 'WalletId',
  categoryId: 'CategoryId',
  expenseWalletId: 'expenseWalletId',
  incomeWalletId: 'incomeWalletId',
}

const transaction: {
  raw: TrnFormValues
  generated: Transaction
} = {
  raw: {
    ...valuesBase,
    transferType: 1,
    trnType: 0,
  },
  generated: {
    categoryId: 'CategoryId',
    date: 99999,
    edited: 1690711427451,
    type: 0,
    amount: 10,
    walletId: 'WalletId',
  },
}

const transfer: {
  raw: TrnFormValues
  generated: Transfer
} = {
  raw: {
    ...valuesBase,
    transferType: 1,
    trnType: 2,
  },
  generated: {
    categoryId: 'transfer',
    date: 99999,
    edited: 1690711427451,
    type: 2,
    expenseAmount: 20,
    incomeAmount: 30,
    incomeWalletId: 'incomeWalletId',
    expenseWalletId: 'expenseWalletId',
  },
}

const transactions = [{
  name: 'Format empty',
  data: {
    expect: {},
    become: false,
  },
}, {
  name: 'Format income',
  data: {
    expect: {
      ...transaction.raw,
    } as TrnFormValues,
    become: {
      ...transaction.generated,
    } as Transaction | false,
  },
}, {
  name: 'Format with wrong type',
  data: {
    expect: {
      ...transaction.raw,
      trnType: 2,
    } as TrnFormValues,
    become: false,
  },
}, {
  name: 'Format with missing CategoryId',
  data: {
    expect: {
      ...transaction.raw,
      categoryId: null,
    } as TrnFormValues,
    become: false,
  },
}]

const transfers = [{
  name: 'Format empty',
  data: {
    expect: {},
    become: false,
  },
}, {
  name: 'Format values',
  data: {
    expect: {
      ...transfer.raw,
    } as TrnFormValues,
    become: {
      ...transfer.generated,
    } as Transfer,
  },
}, {
  name: 'Format with wrong type',
  data: {
    expect: {
      ...transfer.raw,
      trnType: 1,
    } as TrnFormValues,
    become: false,
  },
}, {
  name: 'Format with missing expenseWalletId',
  data: {
    expect: {
      ...transfer.raw,
      expenseWalletId: null,
    } as TrnFormValues,
    become: false,
  },
}, {
  name: 'Format with wrong type',
  data: {
    expect: {
      ...transfer.raw,
      trnType: 1,
    } as TrnFormValues,
    become: false,
  },
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
        delete data.edited

        const res = variant.data.become
        delete res.edited

        expect(data).toEqual(res)
      })
    })
  })
})
