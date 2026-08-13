import type { TrnId, TrnItem, TrnsGetterProps } from '~/components/trns/types'

import { TrnType } from '~/components/trns/types'

export function createTrnMatcher(props: Omit<TrnsGetterProps, 'sort' | 'trnsIds' | 'trnsItems'>) {
  const walletsSet = props.walletsIds?.length ? new Set(props.walletsIds) : null
  const categoriesSet = props.categoriesIds?.length ? new Set(props.categoriesIds) : null
  const recurrencesSet = props.recurrenceIds?.length ? new Set(props.recurrenceIds) : null
  const typesSet = Array.isArray(props.trnsTypes) ? new Set(props.trnsTypes) : null
  const start = props.dates?.start
  const end = props.dates?.end

  return (trn: TrnItem | undefined): trn is TrnItem => {
    if (!trn)
      return false
    if (typesSet && !typesSet.has(trn.categoryId === 'transfer' ? TrnType.Transfer : trn.type))
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
    if (recurrencesSet && (trn.recurrenceId == null || !recurrencesSet.has(trn.recurrenceId)))
      return false
    return true
  }
}

export function filterTrnsIds(props: TrnsGetterProps) {
  if (!props.trnsIds && !props.trnsItems)
    return []

  const trnsIds: TrnId[] = props.trnsIds || Object.keys(props.trnsItems ?? {})
  const hasFilters = props.trnsTypes?.length
    || props.dates?.start !== undefined
    || props.dates?.end !== undefined
    || props.walletsIds?.length
    || props.categoriesIds?.length
    || props.recurrenceIds?.length
  const matches = createTrnMatcher(props)
  const result = hasFilters ? trnsIds.filter(id => matches(props.trnsItems?.[id])) : trnsIds

  if (props.sort)
    result.sort((a, b) => (props.trnsItems?.[b]?.date ?? 0) - (props.trnsItems?.[a]?.date ?? 0))

  return result
}
