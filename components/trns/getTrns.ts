import type { TrnId, TrnsGetterProps } from '~/components/trns/types'

export function getTrnsIds(props: TrnsGetterProps) {
  if (!props.trnsItems)
    return []

  let trnsIds: TrnId[] = Object.keys(props.trnsItems)

  // Type
  if (props?.trnType !== undefined && props?.trnType !== null) {
    trnsIds = trnsIds.filter(
      trnId => props.trnsItems[trnId].type === props.trnType,
    )
  }

  // Date
  if (props?.dates) {
    if (props.dates.from) {
      trnsIds = trnsIds.filter(
        trnId => props.trnsItems[trnId].date >= props.dates?.from,
      )
    }
    if (props?.dates?.until)
      trnsIds = trnsIds.filter(trnId => props.trnsItems[trnId].date <= props.dates.until)
  }

  // Wallet
  if (props.walletsIds && props.walletsIds?.length > 0) {
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
  if (props.categoriesIds && props.categoriesIds?.length > 0) {
    trnsIds = trnsIds.filter((trnId: TrnId) =>
      props.categoriesIds?.includes(props.trnsItems[trnId].categoryId),
    )
  }

  // Sort
  return trnsIds.sort((a, b) => props.trnsItems[b].date - props.trnsItems[a].date)
}
