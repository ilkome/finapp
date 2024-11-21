import type { TrnId, TrnsGetterProps2 } from '~/components/trns/types'

export function getTrnsIds(props: TrnsGetterProps2) {
  if (!props.trnsIds && !props.trnsItems)
    return []

  const trnsIds: TrnId[] = props.trnsIds || Object.keys(props.trnsItems ?? {})

  const filters: Array<(ids: TrnId[]) => TrnId[]> = [
    // Type filter
    ids => props.trnType != null
      ? ids.filter(id => props.trnsItems?.[id]?.type === props.trnType)
      : ids,

    // Types filter
    ids => Array.isArray(props.trnsTypes)
      ? ids.filter(id => props.trnsTypes?.includes(props.trnsItems?.[id]?.type))
      : ids,

    // Date filters
    ids => props.dates?.from
      ? ids.filter(id => props.trnsItems?.[id]?.date >= props.dates.from)
      : ids,
    ids => props.dates?.until
      ? ids.filter(id => props.trnsItems?.[id]?.date <= props.dates.until)
      : ids,

    // Wallet filter
    ids => props.walletsIds?.length
      ? ids.filter((id) => {
        const trn = props.trnsItems?.[id]
        const walletIds = [
          trn?.walletId,
          trn?.expenseWalletId,
          trn?.incomeWalletId,
          trn?.walletToId,
          trn?.walletFromId,
        ]
        return walletIds.some(walletId => props.walletsIds?.includes(walletId))
      })
      : ids,

    // Category filter
    ids => props.categoriesIds?.length
      ? ids.filter(id => props.categoriesIds?.includes(props.trnsItems?.[id]?.categoryId))
      : ids,
  ]

  return filters
    .reduce((ids, filter) => filter(ids), trnsIds)
    .sort((a, b) => props.trnsItems?.[b]?.date - props.trnsItems?.[a]?.date)
}
