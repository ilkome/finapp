import type { TrnId } from '~/components/trns/types'

type EmptyTransactionsKey = 'trns.noExpenses' | 'trns.noIncome' | 'trns.noTrns'

export function canStickStatCategories(
  stickyTop: number,
  categoriesHeight: number,
  viewportHeight: number,
): boolean {
  return categoriesHeight > 0 && stickyTop + categoriesHeight <= viewportHeight
}

export function filterAvailableTrnIds(periodIds: TrnId[], availableIds: TrnId[]): TrnId[] {
  const availableSet = new Set(availableIds)
  return periodIds.filter(id => availableSet.has(id))
}

export function hasUnloadedTrnIds(availableIds: TrnId[], loadedIds: TrnId[]): boolean {
  const loadedSet = new Set(loadedIds)
  return availableIds.some(id => !loadedSet.has(id))
}

export function resolveCurrentPeriodEmptyKey(
  statTab: string,
  filteredType: string,
): EmptyTransactionsKey {
  const selectedType = statTab === 'summary' ? filteredType : statTab

  if (selectedType === 'expense')
    return 'trns.noExpenses'
  if (selectedType === 'income')
    return 'trns.noIncome'
  return 'trns.noTrns'
}

export function resolveStatStickyBottom(
  stickyTop: number,
  summaryTop: number,
  summaryBottom: number,
): number {
  return summaryTop <= stickyTop + 1 ? summaryBottom : stickyTop
}

export function isStatCategoriesPinned(
  position: string,
  categoriesTop: number,
  stickyTop: number,
): boolean {
  return position === 'sticky' && categoriesTop <= stickyTop + 1
}

export function isStatTrnsNearEnd(
  scrollTop: number,
  viewportHeight: number,
  scrollHeight: number,
  threshold = 600,
): boolean {
  return scrollTop + viewportHeight >= scrollHeight - threshold
}
