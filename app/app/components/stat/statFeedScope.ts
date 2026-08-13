import { isEqual } from 'es-toolkit'

export type StatFeedScope = {
  childCategoryId?: string
  date: {
    customDate: false | { end: number, start: number }
    granularityBy: string
    granularityDuration: number
    isShowMaxRange: boolean
    isSkipEmpty: boolean
    rangeBy: string
    rangeDuration: number
    rangeOffset: number
  }
  filteredType: string
  parentCategoriesIds: string[]
  selectedCategoriesIds: string[]
  selectedWalletsIds: string[]
  statTab: string
}

function sortIds(ids: readonly string[]) {
  return [...ids].sort()
}

export function normalizeStatFeedScope(scope: StatFeedScope): StatFeedScope {
  return {
    ...scope,
    date: {
      ...scope.date,
      customDate: scope.date.customDate ? { ...scope.date.customDate } : false,
    },
    parentCategoriesIds: sortIds(scope.parentCategoriesIds),
    selectedCategoriesIds: sortIds(scope.selectedCategoriesIds),
    selectedWalletsIds: sortIds(scope.selectedWalletsIds),
  }
}

export function isSameStatFeedScope(left: StatFeedScope, right: StatFeedScope): boolean {
  return isEqual(normalizeStatFeedScope(left), normalizeStatFeedScope(right))
}
