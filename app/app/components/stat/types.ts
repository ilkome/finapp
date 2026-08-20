import type { ComputedRef } from 'vue'
import type { Range } from '~~/utils/date/types'

import type { TotalReturns } from '~/components/amount/getTotal'
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { FilterProvider } from '~/components/filter/types'
import type { AxisChartType } from '~/components/stat/chart/types'
import type { StatConfigProvider } from '~/components/stat/config/types'
import type { StatDateProvider } from '~/components/stat/date/types'
import type { TrnsDisplayRow } from '~/components/trns/listRows'
import type { TrnId, Trns, TrnsListFilterState, TrnsViewType } from '~/components/trns/types'

export const statReportTypes = ['combined', 'expense', 'income'] as const
export type StatReportType = typeof statReportTypes[number]
export type SeriesSlug = 'income' | 'expense'
export const seriesSlugsSelected = ['income', 'expense', 'net'] as const
export type SeriesSlugSelected = typeof seriesSlugsSelected[number]

export type StatConfigPanelId = 'root' | 'wallets' | 'statAverage' | 'chart' | 'catsRound' | 'catsList' | 'vertical' | 'trns'

export type UseStatReportParams = {
  applyStatsExclusion?: ComputedRef<boolean>
  filter: FilterProvider
  initialFilteredType?: SeriesSlugSelected
  isDateBounded?: boolean
  reportType: ComputedRef<StatReportType>
  selectionSource?: ComputedRef<StatReportSelectedRecord[]>
  statConfig: StatConfigProvider
  statDate: StatDateProvider
  storageKey: ComputedRef<string>
  trnsIds: ComputedRef<TrnId[]>
  trnsViewState?: TrnsListFilterState
  type: ComputedRef<SeriesSlugSelected | undefined>
}

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
  averageMode?: 'series' | 'stack'
  color?: string
  data: number[]
  icon?: string
  markArea?: {
    data: [{ xAxis: string }, { xAxis: string }][]
    itemStyle: { color: string, opacity: number }
  }
  markedArea?: 'markedArea'
  markLine?: Record<string, unknown>
  markLineValueType?: SeriesSlug
  name: string
  showValueType?: boolean
  type: AxisChartType
  valueTypes?: Array<SeriesSlug | undefined>
}

export type IntervalData = {
  range: Range
  total: TotalReturns
  trnsIds: TrnId[]
}

export type StatReportSelectedRecord = {
  categoryId: CategoryId
  id: TrnId
}

export type StatFeedLocalFilter = {
  filterBy: TrnsViewType | 'all'
  showHistoryWithDesc?: boolean
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
  reportType: StatReportType
  selectedCategoriesIds: string[]
  selectedWalletsIds: string[]
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
    | { id: string, offset: number, type: 'historyDivider' }
    | (TrnsDisplayRow & { offset: number })
    | { id: string, type: 'loader' }
    | { id: string, type: 'end' }
