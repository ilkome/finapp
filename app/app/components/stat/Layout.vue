<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { StatReportSelectedRecord, StatReportType } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { filterKey } from '~/components/filter/injectionKeys'
import { statCanSplitKey, statConfigKey, statDateKey, statStickyNavKey, statStickyTopKey, statTrnsViewStateKey } from '~/components/stat/injectionKeys'
import { buildSortedStatReportSelection } from '~/components/stat/report/useStatReportData'
import { statDevMetrics } from '~/components/stat/statDevMetrics'
import { useStatReportContext } from '~/components/stat/useStatReportContext'
import { getTypesMapping } from '~/components/stat/utils'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = withDefaults(defineProps<{
  categoryId?: CategoryId
  hasChildren?: boolean
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
const trnsStore = useTrnsStore()
const statLayout = useTemplateRef<HTMLElement>('statLayout')
const { width: statLayoutWidth } = useElementSize(statLayout)
watchEffect(() => {
  canSplit.value = statLayoutWidth.value >= 768
})
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

const commonParams = {
  applyStatsExclusion: computed(() => !props.categoryId && !filter.categoriesIds.value.length),
  categoryId: computed(() => props.categoryId),
  filter,
  hasChildren: computed(() => props.hasChildren),
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
</script>

<template>
  <div
    ref="statLayout"
    class="grid max-w-7xl min-w-0 grid-cols-[minmax(0,1fr)] gap-3 px-2 pb-24 lg:px-4 2xl:px-8"
    :data-stat-chart-layout="statConfig.config.value.chart.layout"
    :data-stat-page-layout="statConfig.config.value.page.layout"
    :data-stat-report-context-count="isDev ? statDevMetrics.reportContextCount.value : undefined"
    :data-stat-report-get-store-count="isDev ? statDevMetrics.getStoreTrnsIdsCount.value : undefined"
    :data-stat-report-selection-count="isDev ? statDevMetrics.reportSelectionCount.value : undefined"
  >
    <StatChartSection :contexts />
    <div
      :class="stickyNav && 'bg-default/90 sticky z-10 -mx-2 px-2 backdrop-blur md:pt-2 lg:-mx-4 lg:px-4 lg:pb-2'"
      :style="stickyNav ? { top: `${stickyTop}px` } : undefined"
    >
      <StatDateFilterRow />
    </div>
    <StatContentSection :contexts />
  </div>
</template>
