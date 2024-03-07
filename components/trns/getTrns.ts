import dayjs from 'dayjs'
import type { PeriodName } from '~/components/chart/useChart'
import type { TrnId, TrnsGetterProps } from '~/components/trns/types'

export function getTrnsIds(props: TrnsGetterProps) {
  if (!props.trnsItems)
    return []

  let trnsIds: TrnId[] = Object.keys(props.trnsItems)

  // Type
  if (props.trnType !== undefined && props.trnType !== null) {
    trnsIds = trnsIds.filter(
      trnId => props.trnsItems[trnId].type === props.trnType,
    )
  }

  // @deprecated: Date
  if (props?.date && props?.periodName !== 'all') {
    const filterDate = dayjs(props.date)
    const filterPeriod = props.periodName as PeriodName
    const fromDate = filterDate.startOf(filterPeriod).valueOf()
    const untilDate = filterDate.endOf(filterPeriod).valueOf()

    trnsIds = trnsIds.filter(
      trnId =>
        props.trnsItems[trnId].date >= fromDate
        && props.trnsItems[trnId].date <= untilDate,
    )
  }

  // From date
  if (props.fromDate) {
    trnsIds = trnsIds.filter(
      trnId => props.trnsItems[trnId].date >= props.fromDate,
    )
  }

  // Until date
  if (props.untilDate) {
    trnsIds = trnsIds.filter(
      trnId => props.trnsItems[trnId].date <= props.untilDate,
    )
  }

  // Wallet
  if (props.walletsIds?.length > 0) {
    trnsIds = trnsIds.filter((trnId: TrnId) => {
      const trn = props.trnsItems[trnId]
      return (
        props.walletsIds?.includes(trn?.walletId)
        || props.walletsIds?.includes(trn?.expenseWalletId)
        || props.walletsIds?.includes(trn?.incomeWalletId)
        || props.walletsIds?.includes(trn?.walletToId)
        || props.walletsIds?.includes(trn?.walletFromId)
      )
    })
  }

  // Category
  if (props.categoriesIds?.length > 0) {
    trnsIds = trnsIds.filter((trnId: TrnId) =>
      props.categoriesIds?.includes(props.trnsItems[trnId].categoryId),
    )
  }

  return trnsIds.sort(
    (a, b) => props.trnsItems[b].date - props.trnsItems[a].date,
  )
}
