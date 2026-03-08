import type { TrnId, TrnsGetterProps } from '~/components/trns/types'

export function filterTrnsIds(props: TrnsGetterProps) {
  if (!props.trnsIds && !props.trnsItems)
    return []

  const trnsIds: TrnId[] = props.trnsIds || Object.keys(props.trnsItems ?? {})

  const walletsSet = props.walletsIds?.length ? new Set(props.walletsIds) : null
  const categoriesSet = props.categoriesIds?.length ? new Set(props.categoriesIds) : null
  const typesSet = Array.isArray(props.trnsTypes) ? new Set(props.trnsTypes) : null
  const from = props.dates?.from
  const until = props.dates?.until

  const hasFilters = typesSet || from || until || walletsSet || categoriesSet

  const result = hasFilters
    ? trnsIds.filter((id) => {
        const trn = props.trnsItems?.[id]
        if (!trn)
          return false
        if (typesSet && !typesSet.has(trn.type))
          return false
        if (from && trn.date < from)
          return false
        if (until && trn.date > until)
          return false
        if (walletsSet && !walletsSet.has(trn.walletId) && !walletsSet.has(trn.expenseWalletId) && !walletsSet.has(trn.incomeWalletId))
          return false
        if (categoriesSet && !categoriesSet.has(trn.categoryId))
          return false
        return true
      })
    : trnsIds

  if (props.sort)
    result.sort((a, b) => props.trnsItems?.[b]?.date - props.trnsItems?.[a]?.date)

  return result
}
