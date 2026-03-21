import type { TrnId, TrnsGetterProps } from '~/components/trns/types'

import { TrnType } from '~/components/trns/types'

export function filterTrnsIds(props: TrnsGetterProps) {
  if (!props.trnsIds && !props.trnsItems)
    return []

  const trnsIds: TrnId[] = props.trnsIds || Object.keys(props.trnsItems ?? {})

  const walletsSet = props.walletsIds?.length ? new Set(props.walletsIds) : null
  const categoriesSet = props.categoriesIds?.length ? new Set(props.categoriesIds) : null
  const typesSet = Array.isArray(props.trnsTypes) ? new Set(props.trnsTypes) : null
  const start = props.dates?.start
  const end = props.dates?.end

  const hasFilters = typesSet || start !== undefined || end !== undefined || walletsSet || categoriesSet

  const result = hasFilters
    ? trnsIds.filter((id) => {
        const trn = props.trnsItems?.[id]
        if (!trn)
          return false
        if (typesSet && !typesSet.has(trn.type))
          return false
        if (start !== undefined && trn.date < start)
          return false
        if (end !== undefined && trn.date > end)
          return false
        if (walletsSet) {
          const matchesWallet = trn.type === TrnType.Transfer
            ? walletsSet.has(trn.expenseWalletId) || walletsSet.has(trn.incomeWalletId)
            : walletsSet.has(trn.walletId)
          if (!matchesWallet)
            return false
        }
        if (categoriesSet && !categoriesSet.has(trn.categoryId))
          return false
        return true
      })
    : trnsIds

  if (props.sort)
    result.sort((a, b) => (props.trnsItems?.[b]?.date ?? 0) - (props.trnsItems?.[a]?.date ?? 0))

  return result
}
