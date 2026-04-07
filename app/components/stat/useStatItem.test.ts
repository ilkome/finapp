import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'

import type { TotalReturns } from '~/components/amount/getTotal'
import type { Range } from '~/components/date/types'
import type { IntervalData } from '~/components/stat/types'

// ---------------------------------------------------------------------------
// Stub Nuxt/Vue auto-imports used by useStatItem
// ---------------------------------------------------------------------------
vi.stubGlobal('computed', computed)
vi.stubGlobal('ref', ref)
vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))

// ---------------------------------------------------------------------------
// Mock @vueuse/core — useStorage as a plain ref
// ---------------------------------------------------------------------------
vi.mock('@vueuse/core', () => ({
  useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
}))

// ---------------------------------------------------------------------------
// Mock stores / composables used inside useStatItem
// ---------------------------------------------------------------------------
const getStoreTrnsIdsMock = vi.fn(({ trnsIds }: { sort?: boolean, trnsIds?: string[] }) => trnsIds ?? [])

vi.mock('~/components/trns/useTrnsStore', () => ({
  useTrnsStore: () => ({
    getStoreTrnsIds: getStoreTrnsIdsMock,
    items: {},
  }),
}))

const computeTotalMock = vi.fn((): TotalReturns => ({
  adjustment: 0,
  expense: 0,
  expenseTransfers: 0,
  income: 0,
  incomeTransfers: 0,
  sum: 0,
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
const { useStatItem } = await import('~/components/stat/useStatItem')

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
      intervalsBy: 'month' as const,
      intervalSelected: -1,
      rangeBy: 'year' as const,
      rangeDuration: 1,
    },
    range: { end: Date.now(), start: Date.now() - 86400000 * 30 },
    selectedInterval: undefined as Range | undefined,
  }
  const merged = { ...defaults, ...overrides }
  return {
    intervalsInRange: computed(() => merged.intervalsInRange),
    params: computed(() => merged.params),
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
      chart: { isShowAverage: false },
      chartType: 'bar' as const,
    })),
  }
}

function createStatItem(overrides?: {
  filterCategories?: string[]
  intervalSelected?: number
  intervalsInRange?: Range[]
  statTab?: 'summary' | 'expense' | 'income' | 'split'
  trnsIds?: string[]
  type?: 'income' | 'expense' | 'netIncome'
}) {
  const {
    filterCategories = [],
    intervalSelected = -1,
    intervalsInRange = [],
    statTab = 'summary',
    trnsIds = [],
    type,
  } = overrides ?? {}

  return useStatItem({
    filter: makeFilter(filterCategories) as any,
    statConfig: makeStatConfig() as any,
    statDate: makeStatDate({
      intervalsInRange,
      params: {
        intervalsBy: 'month',
        intervalSelected,
        rangeBy: 'year',
        rangeDuration: 1,
      },
    }) as any,
    statTab: computed(() => statTab),
    storageKey: computed(() => 'test'),
    trnsIds: computed(() => trnsIds),
    type: computed(() => type),
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useStatItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getStoreTrnsIdsMock.mockImplementation(({ trnsIds }: { sort?: boolean, trnsIds?: string[] }) => trnsIds ?? [])
  })

  // -------------------------------------------------------------------------
  // hasCategoryFilter optimization
  // -------------------------------------------------------------------------
  describe('hasCategoryFilter optimization', () => {
    it('reuses intervalsData when filteredCategoriesIds is empty', () => {
      const intervals: Range[] = [
        { end: 200, start: 100 },
        { end: 400, start: 300 },
      ]

      const item = createStatItem({
        intervalsInRange: intervals,
        trnsIds: ['t1', 't2'],
      })

      // Access both computed values to trigger evaluation
      const baseData = item.chartSeries.value
      void baseData

      // bucketTrnsByIntervals should be called only once because
      // intervalsDataWithFilteredCategories reuses intervalsData
      // when no category filter is active
      expect(bucketTrnsByIntervalsMock).toHaveBeenCalledTimes(1)
    })

    it('calls bucketTrnsByIntervals twice when category filter is active and both paths accessed', () => {
      const intervals: Range[] = [
        { end: 200, start: 100 },
      ]

      const item = createStatItem({
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

      // Should call bucket twice: once for intervalsData, once for filtered
      expect(bucketTrnsByIntervalsMock).toHaveBeenCalledTimes(2)
    })
  })

  // -------------------------------------------------------------------------
  // baseTrnsIdsForSelection
  // -------------------------------------------------------------------------
  describe('baseTrnsIdsForSelection', () => {
    it('uses rangeTrnsIds when no interval is selected', () => {
      const rangeTrnsIds = ['t1', 't2', 't3']

      const item = createStatItem({
        intervalSelected: -1,
        trnsIds: rangeTrnsIds,
      })

      // selectedTrnsIds uses baseTrnsIdsForSelection internally
      // When no interval selected, it should pass rangeTrnsIds
      void item.selectedTrnsIds.value

      // getStoreTrnsIds is called multiple times:
      // 1. rangeTrnsIds computed
      // 2. selectedTrnsIds computed (which uses baseTrnsIdsForSelection = rangeTrnsIds)
      const selectedCall = getStoreTrnsIdsMock.mock.calls.find(
        call => call[0].sort === true,
      )
      expect(selectedCall).toBeDefined()
      expect(selectedCall![0].trnsIds).toEqual(rangeTrnsIds)
    })

    it('uses interval trnsIds when an interval is selected', () => {
      const intervalTrnsIds = ['t2']
      const intervals: Range[] = [
        { end: 200, start: 100 },
      ]

      bucketTrnsByIntervalsMock.mockReturnValue([{
        range: intervals[0]!,
        total: { adjustment: 0, expense: 0, expenseTransfers: 0, income: 0, incomeTransfers: 0, sum: 0, sumTransfers: 0 },
        trnsIds: intervalTrnsIds,
      }])

      const item = createStatItem({
        intervalSelected: 0,
        intervalsInRange: intervals,
        trnsIds: ['t1', 't2', 't3'],
      })

      void item.selectedTrnsIds.value

      // The selectedTrnsIds call (with sort: true) should receive interval trnsIds
      const selectedCall = getStoreTrnsIdsMock.mock.calls.find(
        call => call[0].sort === true,
      )
      expect(selectedCall).toBeDefined()
      expect(selectedCall![0].trnsIds).toEqual(intervalTrnsIds)
    })
  })

  // -------------------------------------------------------------------------
  // onClickSumItem
  // -------------------------------------------------------------------------
  describe('onClickSumItem', () => {
    it('sets filteredType to the clicked type', () => {
      const item = createStatItem()

      // Default filteredType is 'netIncome'
      expect(item.filteredType.value).toBe('netIncome')

      item.onClickSumItem('expense')
      expect(item.filteredType.value).toBe('expense')
    })

    it('toggles back to netIncome when clicking the same type', () => {
      const item = createStatItem()

      item.onClickSumItem('expense')
      expect(item.filteredType.value).toBe('expense')

      item.onClickSumItem('expense')
      expect(item.filteredType.value).toBe('netIncome')
    })

    it('switches between types', () => {
      const item = createStatItem()

      item.onClickSumItem('income')
      expect(item.filteredType.value).toBe('income')

      item.onClickSumItem('expense')
      expect(item.filteredType.value).toBe('expense')

      item.onClickSumItem('expense')
      expect(item.filteredType.value).toBe('netIncome')
    })
  })

  // -------------------------------------------------------------------------
  // onSetCategoryFilter
  // -------------------------------------------------------------------------
  describe('onSetCategoryFilter', () => {
    it('sets the category filter when empty', () => {
      const item = createStatItem()

      expect(item.filteredCategoriesIds.value).toEqual([])

      item.onSetCategoryFilter('cat1')
      expect(item.filteredCategoriesIds.value).toEqual(['cat1'])
    })

    it('clears filter when the same category is clicked again', () => {
      const item = createStatItem()

      item.onSetCategoryFilter('cat1')
      expect(item.filteredCategoriesIds.value).toEqual(['cat1'])

      item.onSetCategoryFilter('cat1')
      expect(item.filteredCategoriesIds.value).toEqual([])
    })

    it('replaces filter when a different category is clicked', () => {
      const item = createStatItem()

      item.onSetCategoryFilter('cat1')
      expect(item.filteredCategoriesIds.value).toEqual(['cat1'])

      item.onSetCategoryFilter('cat2')
      expect(item.filteredCategoriesIds.value).toEqual(['cat2'])
    })
  })

  // -------------------------------------------------------------------------
  // selectedTypeForSum
  // -------------------------------------------------------------------------
  describe('selectedTypeForSum', () => {
    it('returns summary for summary tab', () => {
      const item = createStatItem({ statTab: 'summary' })
      expect(item.selectedTypeForSum.value).toBe('summary')
    })

    it('returns statTab for expense tab', () => {
      const item = createStatItem({ statTab: 'expense' })
      expect(item.selectedTypeForSum.value).toBe('expense')
    })

    it('returns type for split tab', () => {
      const item = createStatItem({ statTab: 'split', type: 'income' })
      expect(item.selectedTypeForSum.value).toBe('income')
    })
  })

  // -------------------------------------------------------------------------
  // isPeriodOneDay
  // -------------------------------------------------------------------------
  describe('isPeriodOneDay', () => {
    it('returns false for month range', () => {
      const item = createStatItem()
      expect(item.isPeriodOneDay.value).toBe(false)
    })
  })
})
