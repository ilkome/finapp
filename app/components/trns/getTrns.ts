import type { TrnId, TrnsGetterProps } from '~/components/trns/types'

export function getTrnsIds(props: TrnsGetterProps) {
  if (!props.trnsIds && !props.trnsItems)
    return []

  const trnsIds: TrnId[] = props.trnsIds || Object.keys(props.trnsItems ?? {})

  const walletsSet = props.walletsIds?.length ? new Set(props.walletsIds) : null
  const categoriesSet = props.categoriesIds?.length ? new Set(props.categoriesIds) : null
  const typesSet = Array.isArray(props.trnsTypes) ? new Set(props.trnsTypes) : null

  const filters: Array<(ids: TrnId[]) => TrnId[]> = [
    // Types filter
    ids => typesSet
      ? ids.filter(id => typesSet.has(props.trnsItems?.[id]?.type))
      : ids,

    // Date filters
    ids => props.dates?.from
      ? ids.filter(id => props.trnsItems?.[id]?.date >= props.dates.from)
      : ids,
    ids => props.dates?.until
      ? ids.filter(id => props.trnsItems?.[id]?.date <= props.dates.until)
      : ids,

    // Wallet filter
    ids => walletsSet
      ? ids.filter((id) => {
          const trn = props.trnsItems?.[id]
          return walletsSet.has(trn?.walletId)
            || walletsSet.has(trn?.expenseWalletId)
            || walletsSet.has(trn?.incomeWalletId)
        })
      : ids,

    // Category filter
    ids => categoriesSet
      ? ids.filter(id => categoriesSet.has(props.trnsItems?.[id]?.categoryId))
      : ids,
  ]

  return filters
    .reduce((ids, filter) => filter(ids), trnsIds)
    .sort((a, b) => props.trnsItems?.[b]?.date - props.trnsItems?.[a]?.date)
}
