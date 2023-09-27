import dayjs from 'dayjs'
import type { Transaction, Transfer } from '~/components/trns/types'
import type { TrnFormValues } from '~/components/trnForm/types'

function formatTransaction(props: TrnFormValues): Transaction | false {
  if (props.trnType === 2 || !props.categoryId || !props.walletId) {
    console.error('missing props', props.trnType, props.categoryId, props.walletId)
    return false
  }

  const data: Transaction = {
    amount: props.amount[0],
    type: props.trnType,

    categoryId: props.categoryId,
    walletId: props.walletId,

    date: props.date || dayjs().valueOf(),
    edited: dayjs().valueOf(),
  }

  if (props.desc)
    data.desc = props.desc

  return data
}

function formatTransfer(props: TrnFormValues): Transfer | false {
  if (props.trnType !== 2 || !props.expenseWalletId || !props.incomeWalletId) {
    console.error('missing props', props.trnType, props.expenseWalletId, props.incomeWalletId)
    return false
  }

  const data: Transfer = {
    type: props.trnType,
    categoryId: 'transfer' as const,

    date: props.date,
    edited: dayjs().valueOf(),

    expenseAmount: props.amount[1],
    expenseWalletId: props.expenseWalletId,

    incomeAmount: props.amount[2],
    incomeWalletId: props.incomeWalletId,
  }

  if (props.desc)
    data.desc = props.desc

  return data
}

export {
  formatTransaction,
  formatTransfer,
}
