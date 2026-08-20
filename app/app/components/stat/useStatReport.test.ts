import type { Range } from '~~/utils/date/types'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'

import type { TotalReturns } from '~/components/amount/getTotal'
import type { CategoryPieDatum } from '~/components/stat/chart/categoryBreakdown'
import type { IntervalData, StatQuickCategoryFilter } from '~/components/stat/types'

// ---------------------------------------------------------------------------
// Stub Nuxt/Vue auto-imports used by useStatReport
// ---------------------------------------------------------------------------
vi.stubGlobal('computed', computed)
vi.stubGlobal('ref', ref)
vi.stubGlobal('shallowRef', ref)
vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))

const zeroTotal: TotalReturns = {
  adjustment: 0,
  expense: 0,
  expenseTransfers: 0,
  income: 0,
  incomeTransfers: 0,
  net: 0,
  sumTransfers: 0,
}

// Forecast layer: mock so importing useStatReport does not pull in the recurrences store chain
// (which loads Nuxt-runtime composables). Off by default keeps the actuals-only path under test.
vi.mock('~/components/recurrences/useForecastMode', () => ({
  useForecastMode: () => ref('off'),
}))

vi.mock('~/components/recurrences/useForecastSeries', () => ({
  useForecastSeries: () => ({
    computeForecastTotal: () => zeroTotal,
    forecastIds: computed(() => []),
    forecastIntervalsData: computed(() => []),
    forecastItems: computed(() => ({})),
    forecastTotal: computed(() => zeroTotal),
    hasForecast: computed(() => false),
  }),
}))

vi.mock('~/components/currencies/useCurrenciesStore', () => ({
  useCurrenciesStore: () => ({ base: 'USD', rates: {} }),
}))

vi.mock('~/components/wallets/useWalletsStore', () => ({
  useWalletsStore: () => ({ items: {} }),
}))

// ---------------------------------------------------------------------------
// Mock @vueuse/core — useStorage as a plain ref
// ---------------------------------------------------------------------------
vi.mock('@vueuse/core', () => ({
  useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
}))

// ---------------------------------------------------------------------------
// Mock stores / composables used inside useStatReport
// ---------------------------------------------------------------------------
const getStoreTrnsIdsMock = vi.fn(({ trnsIds }: { sort?: boolean, trnsIds?: string[] }) => trnsIds ?? [])

vi.mock('~/components/trns/useTrnsStore', () => ({
  useTrnsStore: () => ({
    getStoreTrnsIds: getStoreTrnsIdsMock,
    items: {
      'in-range': { categoryId: 'cat1', date: 5, type: 0 },
      'out-of-range': { categoryId: 'cat1', date: 1, type: 0 },
      't1': { categoryId: 'cat1', date: 1, type: 0 },
      't2': { categoryId: 'cat1', date: 3, type: 0 },
      't3': { categoryId: 'cat2', date: 2, type: 0 },
    },
  }),
}))

vi.mock('~/components/categories/useCategoriesStore', () => ({
  useCategoriesStore: () => ({
    getTransactibleIds: (ids: string[]) => ids.flatMap(id => id === 'parent' ? ['cat1'] : [id]),
    items: {},
  }),
}))

const categoryBreakdownMocks = vi.hoisted(() => ({
  buildCategoriesPieData: vi.fn<() => CategoryPieDatum[]>(() => []),
  buildCategoriesSeries: vi.fn(() => []),
}))

vi.mock('~/components/stat/chart/categoryBreakdown', () => categoryBreakdownMocks)

const computeTotalMock = vi.fn((): TotalReturns => ({
  adjustment: 0,
  expense: 0,
  expenseTransfers: 0,
  income: 0,
  incomeTransfers: 0,
  net: 0,
  sumTransfers: 0,
}))

vi.mock('~/components/amount/useAmount', () => ({
  useAmount: () => ({
    computeTotalForTrnsIds: computeTotalMock,
  }),
}))

vi.mock('~/components/stat/chart/useStatChart', () => ({
  useStatChart: () => ({
    createSeriesItem: (type: string, _data: any[], _avg?: any) => ({
      data: [],
      name: type,
      type: 'bar',
    }),
    withMarkArea: (series: any[]) => series,
  }),
}))

const bucketTrnsByIntervalsMock = vi.fn(
  (
    _items: Record<string, unknown>,
    trnsIds: string[],
    intervals: Range[],
    computeTotal: (ids: string[]) => TotalReturns,
  ): IntervalData[] =>
    intervals.map(range => ({
      range,
      total: computeTotal(trnsIds),
      trnsIds,
    })),
)

vi.mock('~/components/stat/intervals', async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
    ...actual,
    bucketTrnsByIntervals: (...args: any[]) => (bucketTrnsByIntervalsMock as any)(...args),
  }
})

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------
const { normalizeSelectedSeries, useStatReport } = await import('~/components/stat/useStatReport')

describe('normalizeSelectedSeries', () => {
  it('migrates the legacy net income value', () => {
    expect(normalizeSelectedSeries('netIncome')).toBe('net')
  })

  it('keeps current values', () => {
    expect(normalizeSelectedSeries('expense')).toBe('expense')
    expect(normalizeSelectedSeries('income')).toBe('income')
    expect(normalizeSelectedSeries('net')).toBe('net')
  })
})

// ---------------------------------------------------------------------------
// Helpers to build mock params
// ---------------------------------------------------------------------------
function makeStatDate(overrides?: Partial<{
  intervalsInRange: Range[]
  params: Record<string, any>
  range: Range
  selectedInterval: Range
}>) {
  const defaults = {
    intervalsInRange: [] as Range[],
    params: {
      granularityBy: 'month' as const,
      intervalSelected: -1,
      rangeBy: 'year' as const,
      rangeDuration: 1,
    },
    range: { end: Date.now(), start: Date.now() - 86400000 * 30 },
    selectedInterval: undefined as Range | undefined,
  }
  const merged = { ...defaults, ...overrides }
  const params = ref(merged.params)
  return {
    intervalsInRange: computed(() => merged.intervalsInRange),
    params,
    range: computed(() => merged.range),
    selectedInterval: computed(() => merged.selectedInterval),
  }
}

function makeFilter(categoriesIds: string[] = []) {
  return {
    categoriesIds: computed(() => categoriesIds),
    clearFilter: vi.fn(),
    isShow: computed(() => categoriesIds.length > 0),
  }
}

function makeStatConfig() {
  return {
    config: computed(() => ({
      chart: { breakdown: 'cashflow', isGrouped: false, isShowAverage: false, type: 'bar' as const },
    })),
  }
}

function createStatReport(overrides?: {
  categoryId?: string
  filterCategories?: string[]
  intervalSelected?: number
  intervalsInRange?: Range[]
  quickCategoryFilter?: StatQuickCategoryFilter
  reportType?: 'combined' | 'expense' | 'income'
  trnsIds?: string[]
  type?: 'income' | 'expense' | 'net'
}) {
  const {
    categoryId,
    filterCategories = [],
    intervalSelected = -1,
    intervalsInRange = [],
    quickCategoryFilter,
    reportType = 'combined',
    trnsIds = [],
    type,
  } = overrides ?? {}

  return useStatReport({
    categoryId: computed(() => categoryId),
    filter: makeFilter(filterCategories) as any,
    quickCategoryFilter,
    reportType: computed(() => reportType),
    statConfig: makeStatConfig() as any,
    statDate: makeStatDate({
      intervalsInRange,
      params: {
        granularityBy: 'month',
        intervalSelected,
        rangeBy: 'year',
        rangeDuration: 1,
      },
    }) as any,
    storageKey: computed(() => 'test'),
    trnsIds: computed(() => trnsIds),
    type: computed(() => type),
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useStatReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    categoryBreakdownMocks.buildCategoriesSeries.mockReturnValue([])
    computeTotalMock.mockReturnValue({ ...zeroTotal })
    getStoreTrnsIdsMock.mockImplementation(({ trnsIds }: { sort?: boolean, trnsIds?: string[] }) => trnsIds ?? [])
  })

  it('builds focused category data for the selected actual interval and type', () => {
    const intervals = [{ end: 200, start: 100 }, { end: 400, start: 300 }]
    const report = createStatReport({ intervalSelected: 1, intervalsInRange: intervals, trnsIds: ['t1'] })
    report.onClickSumItem('income')

    void report.focusedCategoryPieData.value

    expect(categoryBreakdownMocks.buildCategoriesPieData).toHaveBeenLastCalledWith(
      expect.objectContaining({ intervals: [expect.objectContaining({ range: intervals[1] })], type: 'income' }),
    )
  })

  it('switches the main chart to category series when a summary amount is focused', () => {
    const report = createStatReport({
      intervalsInRange: [{ end: 200, start: 100 }],
      trnsIds: ['t1'],
    })

    report.onClickSumItem('expense')
    void report.chartSeries.value

    expect(categoryBreakdownMocks.buildCategoriesSeries).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'expense' }),
    )
  })

  it('hides a single-color summary pie in quick and regular category scopes', () => {
    const singleColorPie = [
      { color: 'red', value: 40 },
      { color: 'red', value: 60 },
    ]
    categoryBreakdownMocks.buildCategoriesPieData.mockReturnValue(singleColorPie)
    const report = createStatReport({ trnsIds: ['t1'] })

    expect(report.summaryCategoryPieData.value.expense).toEqual(singleColorPie)

    report.onSetCategoryFilter('cat1')

    expect(report.summaryCategoryPieData.value.expense).toEqual([])

    const categoryReport = createStatReport({ categoryId: 'cat1', trnsIds: ['t1'] })

    expect(categoryReport.summaryCategoryPieData.value.expense).toEqual([])
  })

  // -------------------------------------------------------------------------
  // hasCategoryFilter optimization
  // -------------------------------------------------------------------------
  describe('hasCategoryFilter optimization', () => {
    it('keeps the date range when filtering by a category', () => {
      getStoreTrnsIdsMock.mockImplementation(({ categoriesIds, dates, trnsIds }: {
        categoriesIds?: string[]
        dates?: Range
        trnsIds?: string[]
      }) => {
        if (dates)
          return ['in-range']
        if (categoriesIds)
          return trnsIds ?? []
        return trnsIds ?? []
      })

      const item = createStatReport({ trnsIds: ['in-range', 'out-of-range'] })
      item.onSetCategoryFilter('cat1')

      void item.rangeTotal.value

      expect(getStoreTrnsIdsMock).toHaveBeenCalledWith(expect.objectContaining({
        categoriesIds: ['cat1'],
        trnsIds: ['in-range'],
      }))
    })

    it('reuses intervalsData when filteredCategoriesIds is empty', () => {
      const intervals: Range[] = [
        { end: 200, start: 100 },
        { end: 400, start: 300 },
      ]

      const item = createStatReport({
        intervalsInRange: intervals,
        trnsIds: ['t1', 't2'],
      })

      // Access both computed values to trigger evaluation
      const baseData = item.chartSeries.value
      void baseData

      // chartSeries only evaluates the bounded chart dataset. The committed range dataset stays
      // lazy until a range total or selection requests it.
      expect(bucketTrnsByIntervalsMock).toHaveBeenCalledTimes(1)
    })

    it('calls bucketTrnsByIntervals twice when category filter is active and both paths accessed', () => {
      const intervals: Range[] = [
        { end: 200, start: 100 },
      ]

      const item = createStatReport({
        intervalSelected: 0,
        intervalsInRange: intervals,
        trnsIds: ['t1', 't2'],
      })

      // Set a category filter
      item.filteredCategoriesIds.value = ['cat1']

      // Access selectedTrnsIds to trigger intervalsData (via baseTrnsIdsForSelection with interval selected)
      void item.selectedTrnsIds.value
      // Access chartSeries to trigger intervalsDataWithFilteredCategories (separate call due to filter)
      void item.chartSeries.value

      // The selected interval evaluates the committed base dataset and chartSeries evaluates the
      // filtered bounded dataset. Their unused counterparts remain lazy.
      expect(bucketTrnsByIntervalsMock).toHaveBeenCalledTimes(2)
    })
  })

  // -------------------------------------------------------------------------
  // baseTrnsIdsForSelection
  // -------------------------------------------------------------------------
  describe('baseTrnsIdsForSelection', () => {
    it('uses rangeTrnsIds when no interval is selected', () => {
      const rangeTrnsIds = ['t1', 't2', 't3']

      const item = createStatReport({
        intervalSelected: -1,
        trnsIds: rangeTrnsIds,
      })

      // selectedTrnsIds uses baseTrnsIdsForSelection internally
      // When no interval selected, it should pass rangeTrnsIds
      void item.selectedTrnsIds.value

      expect(item.selectedTrnsIds.value).toEqual(['t2', 't3', 't1'])
    })

    it('uses interval trnsIds when an interval is selected', () => {
      const intervalTrnsIds = ['t2']
      const intervals: Range[] = [
        { end: 200, start: 100 },
      ]

      bucketTrnsByIntervalsMock.mockReturnValue([{
        range: intervals[0]!,
        total: { adjustment: 0, expense: 0, expenseTransfers: 0, income: 0, incomeTransfers: 0, net: 0, sumTransfers: 0 },
        trnsIds: intervalTrnsIds,
      }])

      const item = createStatReport({
        intervalSelected: 0,
        intervalsInRange: intervals,
        trnsIds: ['t1', 't2', 't3'],
      })

      void item.selectedTrnsIds.value

      expect(item.selectedTrnsIds.value).toEqual(intervalTrnsIds)
    })
  })

  // -------------------------------------------------------------------------
  // onClickSumItem
  // -------------------------------------------------------------------------
  describe('onClickSumItem', () => {
    it('sets filteredType to the clicked type', () => {
      const item = createStatReport()

      // Default filteredType is 'net'
      expect(item.filteredType.value).toBe('net')

      item.onClickSumItem('expense')
      expect(item.filteredType.value).toBe('expense')
    })

    it('toggles back to net when clicking the same type', () => {
      const item = createStatReport()

      item.onClickSumItem('expense')
      expect(item.filteredType.value).toBe('expense')

      item.onClickSumItem('expense')
      expect(item.filteredType.value).toBe('net')
    })

    it('switches between types', () => {
      const item = createStatReport()

      item.onClickSumItem('income')
      expect(item.filteredType.value).toBe('income')

      item.onClickSumItem('expense')
      expect(item.filteredType.value).toBe('expense')

      item.onClickSumItem('expense')
      expect(item.filteredType.value).toBe('net')
    })
  })

  // -------------------------------------------------------------------------
  // onSetCategoryFilter
  // -------------------------------------------------------------------------
  describe('onSetCategoryFilter', () => {
    it('shares quick category focus across split chart reports', () => {
      const quickCategoryFilter: StatQuickCategoryFilter = {
        categoriesIds: ref([]),
        childCategoryId: ref(),
      }
      const expense = createStatReport({ quickCategoryFilter, reportType: 'expense' })
      const income = createStatReport({ quickCategoryFilter, reportType: 'income' })

      expense.onSetCategoryFilter('cat1')

      expect(income.filteredCategoriesIds.value).toEqual(['cat1'])
      expect(income.effectiveFilteredCategoriesIds.value).toEqual(['cat1'])
    })

    it('sets the category filter when empty', () => {
      const item = createStatReport()

      expect(item.filteredCategoriesIds.value).toEqual([])

      item.onSetCategoryFilter('cat1')
      expect(item.filteredCategoriesIds.value).toEqual(['cat1'])
    })

    it('clears filter when the same category is clicked again', () => {
      const item = createStatReport()

      item.onSetCategoryFilter('cat1')
      expect(item.filteredCategoriesIds.value).toEqual(['cat1'])

      item.onSetCategoryFilter('cat1')
      expect(item.filteredCategoriesIds.value).toEqual([])
    })

    it('replaces filter when a different category is clicked', () => {
      const item = createStatReport()

      item.onSetCategoryFilter('cat1')
      expect(item.filteredCategoriesIds.value).toEqual(['cat1'])

      item.onSetCategoryFilter('cat2')
      expect(item.filteredCategoriesIds.value).toEqual(['cat2'])
    })

    it('keeps the quick parent selected while a child becomes the effective filter', () => {
      const item = createStatReport()

      item.onSetCategoryFilter('parent')
      item.onSetChildCategoryFilter('child')

      expect(item.filteredCategoriesIds.value).toEqual(['parent'])
      expect(item.filteredChildCategoryId.value).toBe('child')
      expect(item.effectiveFilteredCategoriesIds.value).toEqual(['child'])

      item.onSetChildCategoryFilter('child')
      expect(item.filteredChildCategoryId.value).toBeUndefined()
      expect(item.effectiveFilteredCategoriesIds.value).toEqual(['parent'])
    })

    it('filters transactions by the transactible children of a quick parent', () => {
      const item = createStatReport({ trnsIds: ['t1', 't2', 't3'] })

      item.onSetCategoryFilter('parent')

      expect(item.selectedAndFilteredTrnsIds.value).toEqual(['t2', 't1'])
      expect(item.selectedAndQuickFilteredTrnsIds.value).toEqual(['t2', 't1'])
    })

    it('clears the child filter when the quick category changes', () => {
      const item = createStatReport()

      item.onSetCategoryFilter('parent-1')
      item.onSetChildCategoryFilter('child')
      item.onSetCategoryFilter('parent-2')

      expect(item.filteredCategoriesIds.value).toEqual(['parent-2'])
      expect(item.filteredChildCategoryId.value).toBeUndefined()
      expect(item.effectiveFilteredCategoriesIds.value).toEqual(['parent-2'])
    })
  })

  // -------------------------------------------------------------------------
  // selectedTypeForSum
  // -------------------------------------------------------------------------
  describe('selectedTypeForSum', () => {
    it('returns summary for summary tab', () => {
      const item = createStatReport({ reportType: 'combined' })
      expect(item.selectedTypeForSum.value).toBe('summary')
    })

    it('returns statTab for expense tab', () => {
      const item = createStatReport({ reportType: 'expense' })
      expect(item.selectedTypeForSum.value).toBe('expense')
    })

    it('returns the income projection type', () => {
      const item = createStatReport({ reportType: 'income', type: 'income' })
      expect(item.selectedTypeForSum.value).toBe('income')
    })
  })

  // -------------------------------------------------------------------------
  // isPeriodOneDay
  // -------------------------------------------------------------------------
  describe('isPeriodOneDay', () => {
    it('returns false for month range', () => {
      const item = createStatReport()
      expect(item.isPeriodOneDay.value).toBe(false)
    })
  })
})
