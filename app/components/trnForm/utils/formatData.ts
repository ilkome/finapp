import type { Transaction, Transfer, TrnFormValues } from '~/components/trns/types'

function formatTransaction(props: TrnFormValues): Transaction | false {
  if (props.trnType === 2 || !props.categoryId || !props.walletId) {
    return false
  }

  const data: Transaction = {
    amount: props.amount[0],
    categoryId: props.categoryId,

    date: props.date || new Date().getTime(),
    edited: new Date().getTime(),

    type: props.trnType,
    walletId: props.walletId,
  }

  if (props.desc)
    data.desc = props.desc

  return data
}

function formatTransfer(props: TrnFormValues): Transfer | false {
  if (props.trnType !== 2 || !props.expenseWalletId || !props.incomeWalletId) {
    return false
  }

  const data: Transfer = {
    categoryId: 'transfer' as const,

    date: props.date,
    edited: new Date().getTime(),

    expenseAmount: props.amount[1],
    expenseWalletId: props.expenseWalletId,

    incomeAmount: props.amount[2],
    incomeWalletId: props.incomeWalletId,

    type: props.trnType,
  }

  if (props.desc)
    data.desc = props.desc

  return data
}

export {
  formatTransaction,
  formatTransfer,
}
