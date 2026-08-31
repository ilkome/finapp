<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { StatConfigBlockId, StatReportBlockId } from '~/components/stat/config/schema'
import type { SeriesSlugSelected, StatQuickCategoryFilter, StatReportSelectedRecord, StatReportType } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { filterKey } from '~/components/filter/injectionKeys'
import { statReportBlockOrder } from '~/components/stat/config/schema'
import { statCanSplitKey, statConfigKey, statContentWidthKey, statDateKey, statStickyNavKey, statStickyTopKey, statTrnsViewStateKey } from '~/components/stat/injectionKeys'
import { resolveQuickCategorySelection } from '~/components/stat/quickCategorySelection'
import { buildSortedStatReportSelection } from '~/components/stat/report/useStatReportData'
import { statDevMetrics } from '~/components/stat/statDevMetrics'
import { useStatReportContext } from '~/components/stat/useStatReportContext'
import { getTypesMapping, getUsedWalletIds } from '~/components/stat/utils'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = withDefaults(defineProps<{
  categoryId?: CategoryId
  hasChildren?: boolean
  initialFilteredType?: SeriesSlugSelected
  lockSingleTypeLayout?: boolean
  preCategoriesIds?: CategoryId[]
  reportType?: StatReportType
  showWallets?: boolean
  storageKey: string
  trnsIds: TrnId[]
  walletId?: WalletId
  walletSourceTrnsIds?: TrnId[]
}>(), { reportType: 'combined' })

const isDev = import.meta.dev
const filter = inject(filterKey)!
const statConfig = inject(statConfigKey)!
const statDate = inject(statDateKey)!
const trnsViewState = inject(statTrnsViewStateKey)!
const hostStickyNavigation = inject(statStickyNavKey, false)
const stickyTop = inject(statStickyTopKey, ref(0))
const canSplit = inject(statCanSplitKey, ref(false))
const contentWidth = inject(statContentWidthKey, null)
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()
const activeWalletType = ref<SeriesSlugSelected>('net')
const statLayout = useTemplateRef<HTMLElement>('statLayout')
const statNavigation = shallowRef<HTMLElement>()
const statSummary = shallowRef<HTMLElement>()
const { width: statLayoutWidth } = useElementSize(statLayout)
const { height: measuredNavigationHeight } = useElementSize(statNavigation, undefined, { box: 'border-box' })
const { height: measuredSummaryHeight } = useElementSize(statSummary, undefined, { box: 'border-box' })
const stickyNavigationHeight = computed(() => Math.max(42, measuredNavigationHeight.value))
provide(statCanSplitKey, canSplit)

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
    onFilteredTypeChange: (type) => {
      activeWalletType.value = type
    },
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
activeWalletType.value = contexts.combined.filteredType.value
const periodWalletIds = computed(() => {
  const periodTrnsIds = trnsStore.getStoreTrnsIds({
    categoriesIds: contexts.combined.effectiveFilteredCategoriesIds.value,
    dates: selectionRange.value,
    trnsIds: props.walletSourceTrnsIds ?? props.trnsIds,
    trnsTypes: getTypesMapping(activeWalletType.value),
  })
  return getUsedWalletIds(periodTrnsIds, trnsStore.items ?? {})
})
const isCategoryFocusActive = computed(() => contexts.combined.effectiveFilteredCategoriesIds.value.length > 0)
const orderedBlocks = computed(() => statConfig.config.value.page.blockOrder)
const layoutEntries = computed(() => {
  const entries: Array<{
    block?: StatConfigBlockId
    blocks?: StatReportBlockId[]
    key: string
  }> = []

  for (const block of orderedBlocks.value) {
    if (isReportBlock(block)) {
      const previous = entries.at(-1)
      if (previous?.blocks)
        previous.blocks.push(block)
      else entries.push({ blocks: [block], key: `report-${entries.length}` })
    }
    else {
      entries.push({ block, key: block })
    }
  }

  return entries
})
const navigationIsPinned = computed(() => hostStickyNavigation && statConfig.config.value.date.isPinned)
const summaryIsPinned = computed(() => hostStickyNavigation && statConfig.config.value.summary.isPinned)
const navigationIndex = computed(() => orderedBlocks.value.indexOf('navigation'))
const summaryIndex = computed(() => orderedBlocks.value.indexOf('summary'))
const navigationComesBeforeSummary = computed(() => navigationIndex.value < summaryIndex.value)
const summaryComesBeforeNavigation = computed(() => summaryIndex.value < navigationIndex.value)
const navigationIsBeforeSummary = computed(() => navigationIsPinned.value
  && summaryIsPinned.value
  && navigationComesBeforeSummary.value)
const summaryIsBeforeNavigation = computed(() => navigationIsPinned.value
  && summaryIsPinned.value
  && summaryComesBeforeNavigation.value)
const navigationStickyTop = computed(() => stickyTop.value + (
  summaryIsBeforeNavigation.value
    ? measuredSummaryHeight.value
    : 0
))
const summaryStickyTop = computed(() => stickyTop.value + (
  navigationIsBeforeSummary.value
    ? stickyNavigationHeight.value
    : 0
))

function isReportBlock(block: StatConfigBlockId): block is StatReportBlockId {
  return statReportBlockOrder.includes(block as StatReportBlockId)
}

function setNavigationElement(element: unknown) {
  statNavigation.value = element instanceof HTMLElement ? element : undefined
}

function setSummaryElement(element: unknown) {
  statSummary.value = element instanceof HTMLElement ? element : undefined
}
watchEffect(() => {
  canSplit.value = statLayoutWidth.value >= 768 && !props.lockSingleTypeLayout
  if (contentWidth)
    contentWidth.value = statLayoutWidth.value > 0 ? Math.round(statLayoutWidth.value) : null
})
</script>

<template>
  <div
    ref="statLayout"
    class="grid max-w-7xl min-w-0 grid-cols-[minmax(0,1fr)] gap-2 px-2 pb-24 stat-layout lg:px-4 2xl:px-8"
    :data-stat-chart-layout="statConfig.config.value.chart.layout"
    :data-stat-page-layout="statConfig.config.value.page.layout"
    :data-stat-report-context-count="isDev ? statDevMetrics.reportContextCount.value : undefined"
    :data-stat-report-get-store-count="isDev ? statDevMetrics.getStoreTrnsIdsCount.value : undefined"
    :data-stat-report-selection-count="isDev ? statDevMetrics.reportSelectionCount.value : undefined"
  >
    <template v-for="entry in layoutEntries" :key="entry.key">
      <div
        v-if="entry.block === 'navigation'"
        :ref="setNavigationElement"
        data-stat-navigation
        :data-stat-pinned-block="navigationIsPinned || undefined"
        :class="[
          navigationIsPinned && 'sticky z-10 -mx-2 bg-default/90 px-2 backdrop-blur lg:-mx-4 lg:px-4',
          navigationIsPinned && 'py-1! lg:py-1!',
        ]"
        :style="navigationIsPinned ? { top: `${navigationStickyTop}px` } : undefined"
      >
        <StatDateFilterRow
          :isShowNavigation="statConfig.config.value.date.isShowNavigation"
        />
      </div>
      <div
        v-else-if="entry.block === 'summary'"
        :ref="setSummaryElement"
        :data-stat-pinned-block="summaryIsPinned || undefined"
        :class="[
          summaryIsPinned && 'sticky z-10 bg-default/90 backdrop-blur',
          summaryIsPinned && 'py-1',
        ]"
        :style="summaryIsPinned ? { top: `${summaryStickyTop}px` } : undefined"
      >
        <StatContentSection :contexts />
      </div>
      <StatWalletsSection
        v-else-if="entry.block === 'wallets' && props.showWallets"
        :isCategoryFocusActive
        :periodWalletIds
      />
      <StatChartSection v-else-if="entry.block === 'chart'" :contexts />
      <StatReportBlockSection v-else-if="entry.blocks" :blocks="entry.blocks" :contexts />
    </template>
  </div>
</template>

<style scoped>
[data-stat-pinned-block] + [data-stat-pinned-block] {
  margin-top: -0.5rem;
}
</style>
