<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { SeriesSlugSelected, StatQuickCategoryFilter, StatReportSelectedRecord, StatReportType } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { filterKey } from '~/components/filter/injectionKeys'
import { statCanSplitKey, statConfigKey, statDateKey, statStickyNavigationHeightKey, statStickyNavKey, statStickyTopKey, statTrnsViewStateKey } from '~/components/stat/injectionKeys'
import { resolveQuickCategorySelection } from '~/components/stat/quickCategorySelection'
import { buildSortedStatReportSelection } from '~/components/stat/report/useStatReportData'
import { statDevMetrics } from '~/components/stat/statDevMetrics'
import { useStatReportContext } from '~/components/stat/useStatReportContext'
import { getTypesMapping } from '~/components/stat/utils'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = withDefaults(defineProps<{
  categoryId?: CategoryId
  hasChildren?: boolean
  initialFilteredType?: SeriesSlugSelected
  lockSingleTypeLayout?: boolean
  preCategoriesIds?: CategoryId[]
  reportType?: StatReportType
  storageKey: string
  trnsIds: TrnId[]
  walletId?: WalletId
}>(), { reportType: 'combined' })

const isDev = import.meta.dev
const filter = inject(filterKey)!
const statConfig = inject(statConfigKey)!
const statDate = inject(statDateKey)!
const trnsViewState = inject(statTrnsViewStateKey)!
const stickyNav = inject(statStickyNavKey, false)
const stickyTop = inject(statStickyTopKey, ref(0))
const canSplit = inject(statCanSplitKey, ref(false))
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()
const statLayout = useTemplateRef<HTMLElement>('statLayout')
const statNavigation = useTemplateRef<HTMLElement>('statNavigation')
const { width: statLayoutWidth } = useElementSize(statLayout)
const { height: measuredNavigationHeight } = useElementSize(statNavigation, undefined, { box: 'border-box' })
const stickyNavigationHeight = computed(() => Math.max(42, measuredNavigationHeight.value))
provide(statCanSplitKey, canSplit)
provide(statStickyNavigationHeightKey, stickyNavigationHeight)

const projections = computed(() => {
  const expense: TrnId[] = []
  const income: TrnId[] = []
  for (const id of props.trnsIds) {
    const type = trnsStore.items?.[id]?.type
    if (type === TrnType.Expense)
      expense.push(id)
    else if (type === TrnType.Income)
      income.push(id)
  }
  return { combined: props.trnsIds, expense, income }
})

const selectionRange = computed(() => statDate.params.value.intervalSelected >= 0
  ? statDate.selectedInterval.value ?? statDate.range.value
  : statDate.range.value)
const sharedSelection = computed(() => buildSortedStatReportSelection({
  sourceIds: trnsStore.getStoreTrnsIds({ dates: selectionRange.value, trnsIds: props.trnsIds }),
  trnsItems: trnsStore.items ?? {},
  trnsTypes: getTypesMapping('combined'),
}))
const selectionProjections = computed(() => {
  const expense: StatReportSelectedRecord[] = []
  const income: StatReportSelectedRecord[] = []
  for (const record of sharedSelection.value) {
    const type = trnsStore.items?.[record.id]?.type
    if (type === TrnType.Expense)
      expense.push(record)
    else if (type === TrnType.Income)
      income.push(record)
  }
  return { combined: sharedSelection.value, expense, income }
})

const quickCategoryFilters = Object.fromEntries(
  (['combined', 'expense', 'income'] as const).map(reportType => [reportType, {
    categoriesIds: ref<CategoryId[]>([]),
    childCategoryId: ref<CategoryId>(),
  }]),
) as Record<StatReportType, StatQuickCategoryFilter>

function setQuickCategoryFilter(categoryId: CategoryId) {
  const transactibleIds = new Set(categoriesStore.getTransactibleIds([categoryId]))
  const selection = resolveQuickCategorySelection({
    categoryId,
    hasExpense: selectionProjections.value.expense.some(record => transactibleIds.has(record.categoryId)),
    hasIncome: selectionProjections.value.income.some(record => transactibleIds.has(record.categoryId)),
    isSelected: Object.values(quickCategoryFilters).some(filter => filter.categoriesIds.value.includes(categoryId)),
  })

  for (const reportType of ['combined', 'expense', 'income'] as const) {
    quickCategoryFilters[reportType].categoriesIds.value = selection[reportType]
    quickCategoryFilters[reportType].childCategoryId.value = undefined
  }
}

for (const filter of Object.values(quickCategoryFilters))
  filter.setCategoryFilter = setQuickCategoryFilter

const commonParams = {
  applyStatsExclusion: computed(() => !props.categoryId && !filter.categoriesIds.value.length),
  categoryId: computed(() => props.categoryId),
  filter,
  hasChildren: computed(() => props.hasChildren),
  initialFilteredType: props.initialFilteredType,
  preCategoriesIds: computed(() => props.preCategoriesIds),
  statConfig,
  statDate,
  storageKey: computed(() => props.storageKey),
  trnsViewState,
  walletId: computed(() => props.walletId),
}

function createContext(reportType: StatReportType) {
  return useStatReportContext({
    ...commonParams,
    quickCategoryFilter: quickCategoryFilters[reportType],
    reportType: computed(() => reportType),
    selectionSource: computed(() => selectionProjections.value[reportType]),
    trnsIds: computed(() => projections.value[reportType]),
    type: computed(() => reportType === 'combined' ? undefined : reportType),
  })
}

const contexts = {
  combined: createContext(props.reportType),
  expense: createContext('expense'),
  income: createContext('income'),
}
watchEffect(() => {
  canSplit.value = statLayoutWidth.value >= 768 && !props.lockSingleTypeLayout
})
</script>

<template>
  <div
    ref="statLayout"
    class="stat-layout grid max-w-7xl min-w-0 grid-cols-[minmax(0,1fr)] gap-3 px-2 pb-24 lg:px-4 2xl:px-8"
    :data-stat-chart-layout="statConfig.config.value.chart.layout"
    :data-stat-page-layout="statConfig.config.value.page.layout"
    :data-stat-report-context-count="isDev ? statDevMetrics.reportContextCount.value : undefined"
    :data-stat-report-get-store-count="isDev ? statDevMetrics.getStoreTrnsIdsCount.value : undefined"
    :data-stat-report-selection-count="isDev ? statDevMetrics.reportSelectionCount.value : undefined"
  >
    <StatChartSection :contexts />
    <div
      ref="statNavigation"
      data-stat-navigation
      :class="stickyNav && 'bg-default/90 sticky z-10 -mx-2 px-2 backdrop-blur lg:-mx-4 lg:px-4 lg:pb-2'"
      :style="stickyNav ? { top: `${stickyTop}px` } : undefined"
    >
      <StatDateFilterRow />
    </div>
    <StatContentSection :contexts />
  </div>
</template>
