import type { Range } from '~~/utils/date/types'

import type { TotalReturns } from '~/components/amount/getTotal'
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { ChartType } from '~/components/stat/chart/types'
import type { TrnsDisplayRow } from '~/components/trns/listRows'
import type { TrnId, Trns, TrnsViewType } from '~/components/trns/types'

export type StatTabSlug = 'income' | 'expense' | 'summary' | 'split'
export type SeriesSlug = 'income' | 'expense'
export type SeriesSlugSelected = 'income' | 'expense' | 'netIncome'

export type StatConfigPanelId = 'root' | 'wallets' | 'statAverage' | 'chart' | 'catsRound' | 'catsList' | 'vertical'

type CategoryWithDataBase = {
  id: CategoryId
  name: CategoryItem['name']
  trnsIds: TrnId[]
  value: number
}

export type CategoryWithData = CategoryWithDataBase & {
  categories?: CategoryWithDataBase[]
}

export type CategoriesWithData = Record<CategoryId, CategoryWithData>

export type ChartSeries = {
  color?: string
  data: number[]
  icon?: string
  markArea?: {
    data: [{ xAxis: string }, { xAxis: string }][]
    itemStyle: { color: string, opacity: number }
  }
  markedArea?: 'markedArea'
  markLine?: Record<string, unknown>
  name: string
  type: ChartType
}

export type IntervalData = {
  range: Range
  total: TotalReturns
  trnsIds: TrnId[]
}

export type StatFeedLocalFilter = {
  filterBy: TrnsViewType | 'all'
  showWithDesc: boolean
}

export type StatFeedIndexMetrics = {
  dateToOffsetLookups: number
  periodRangeCount: number
  routedIds: number
  visitedIds: number
}

export type StatFeedIndex = {
  idsByOffset: Map<number, TrnId[]>
  materializedOffsets: number[]
  metrics: StatFeedIndexMetrics
  nextHistoricalId: TrnId | null
}

export type BuildStatFeedIndexOptions = {
  baseOffset: number
  candidateIds: readonly TrnId[]
  filter: StatFeedLocalFilter
  items: Trns | null | undefined
  minimumDate: number
  rangeForOffset: (offset: number) => Range
  searchedThroughOffset: number
}

export type StatFeedPeriod = {
  ids: TrnId[]
  offset: number
}

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
    rangePanOffset: number
  }
  filteredType: string
  parentCategoriesIds: string[]
  selectedCategoriesIds: string[]
  selectedWalletsIds: string[]
  statTab: string
}

export type StatVisibleItem = {
  end: number
  index: number
  start: number
}

export type StatPeriodRow = {
  id?: string
  offset?: number
}

export type StatPeriodTransitionDirection = 'backward' | 'forward'

export type StatPeriodTransitionSource = 'measurement' | 'resize' | 'scroll'

export type StatPeriodTransitionState = {
  activeOffset: number
  direction: StatPeriodTransitionDirection | null
}

export type StatVirtualRow
  = | { id: string, offset: number, type: 'periodAnchor' }
    | (TrnsDisplayRow & { offset: number })
    | { id: string, type: 'loader' }
    | { id: string, type: 'end' }
