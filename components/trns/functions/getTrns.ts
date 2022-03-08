import dayjs from 'dayjs'
import type { TrnID, TrnItem, TrnType } from '~/components/trns/types'
import type { WalletID } from '~/components/wallets/types'

type PeriodName = 'day' | 'week' | 'month' | 'year' | 'all'
type Date = number
interface Props {
  trnsItems: Record<string, TrnItem>
  walletsIds?: WalletID[]
  categoriesIds?: WalletID[]
  trnType?: TrnType
  periodName?: PeriodName
  date?: Date
}

export const getTrnsIds = (props: Props) => {
  let trnsIds: TrnID[] = Object.keys(props.trnsItems)
  const getTrn = (trnId: TrnID) => props.trnsItems[trnId]

  // Type
  if (props.trnType !== undefined && props.trnType !== null) {
    trnsIds = trnsIds.filter((trnId: TrnID) => {
      const trn = getTrn(trnId)
      return trn.type === props.trnType
    })
  }

  // Date
  if (props?.date && props?.periodName !== 'all') {
    const filterDate = dayjs(props.date)
    const filterPeriod = props.periodName
    const fromDate = filterDate.startOf(filterPeriod).valueOf()
    const untilDate = filterDate.endOf(filterPeriod).valueOf()

    trnsIds = trnsIds.filter(trnId =>
      (props.trnsItems[trnId].date >= fromDate)
      && (props.trnsItems[trnId].date <= untilDate))
  }

  // Wallet
  if (props.walletsIds?.length > 0) {
    trnsIds = trnsIds.filter((trnId: TrnID) => {
      const trn = getTrn(trnId)
      return props.walletsIds?.includes(trn?.walletId)
       || props.walletsIds?.includes(trn?.expenseWalletId)
       || props.walletsIds?.includes(trn?.incomeWalletId)
       || props.walletsIds?.includes(trn?.walletToId)
       || props.walletsIds?.includes(trn?.walletFromId)
    })
  }

  // Category
  if (props.categoriesIds?.length > 0) {
    trnsIds = trnsIds.filter((trnId: TrnID) => {
      const trn = getTrn(trnId)
      return props.categoriesIds?.includes(trn?.categoryId)
    })
  }

  // Sort
  trnsIds = trnsIds
    .sort((a, b) => {
      if (props.trnsItems[a].date > props.trnsItems[b].date) return -1
      if (props.trnsItems[a].date < props.trnsItems[b].date) return 1
      return 0
    })

  return trnsIds
}
