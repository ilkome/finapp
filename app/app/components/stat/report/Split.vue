<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { filterKey } from '~/components/filter/injectionKeys'
import { statConfigKey, statDateKey, statStickyNavKey, statStickyTopKey } from '~/components/stat/injectionKeys'
import { statDevMetrics } from '~/components/stat/statDevMetrics'
import { useStatReportContext } from '~/components/stat/useStatReportContext'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  categoryId?: CategoryId
  hasChildren?: boolean
  preCategoriesIds?: CategoryId[]
  storageKey: string
  trnsIds: TrnId[]
  walletId?: WalletId
}>()
const isDev = import.meta.dev

const trnsStore = useTrnsStore()
const filter = inject(filterKey)!
const statConfig = inject(statConfigKey)!
const statDate = inject(statDateKey)!
const stickyNav = inject(statStickyNavKey, false)
const stickyTop = inject(statStickyTopKey, ref(0))

function getSplitTrnsIds(params: Parameters<typeof trnsStore.getStoreTrnsIds>[0]) {
  if (isDev)
    statDevMetrics.getStoreTrnsIdsCount.value++
  return trnsStore.getStoreTrnsIds(params)
}

const datedTrnsIds = computed(() => getSplitTrnsIds({
  dates: statDate.range.value,
  trnsIds: props.trnsIds,
}))
const expenseTrnsIds = computed(() => getSplitTrnsIds({
  trnsIds: datedTrnsIds.value,
  trnsTypes: [TrnType.Expense],
}))
const incomeTrnsIds = computed(() => getSplitTrnsIds({
  trnsIds: datedTrnsIds.value,
  trnsTypes: [TrnType.Income],
}))

const commonParams = {
  applyStatsExclusion: computed(() => !props.categoryId && !filter.categoriesIds.value.length),
  categoryId: computed(() => props.categoryId),
  filter,
  hasChildren: computed(() => props.hasChildren),
  isDateBounded: true,
  preCategoriesIds: computed(() => props.preCategoriesIds),
  statConfig,
  statDate,
  statTab: computed(() => 'split' as const),
  storageKey: computed(() => props.storageKey),
  walletId: computed(() => props.walletId),
}

const expense = useStatReportContext({
  ...commonParams,
  trnsIds: expenseTrnsIds,
  type: computed(() => 'expense' as const),
})
const income = useStatReportContext({
  ...commonParams,
  trnsIds: incomeTrnsIds,
  type: computed(() => 'income' as const),
})
</script>

<template>
  <div
    class="grid max-w-7xl gap-4 px-2 pb-24 lg:px-4 xl:py-2 2xl:px-8"
    :data-stat-report-context-count="isDev ? statDevMetrics.reportContextCount.value : undefined"
    :data-stat-report-get-store-count="isDev ? statDevMetrics.getStoreTrnsIdsCount.value : undefined"
    :data-stat-report-selection-count="isDev ? statDevMetrics.reportSelectionCount.value : undefined"
  >
    <div class="grid gap-8 @3xl/page:grid-cols-2">
      <StatReportChart :ctx="expense" />
      <StatReportChart :ctx="income" />
    </div>

    <div
      :class="stickyNav && 'bg-default/90 sticky z-10 -mx-2 px-2 backdrop-blur md:pt-2 lg:-mx-4 lg:px-4 lg:pb-2'"
      :style="stickyNav ? { top: `${stickyTop}px` } : undefined"
    >
      <StatDateFilterRow />
    </div>

    <div class="grid gap-8 @3xl/page:grid-cols-2">
      <div class="@container/stat grid min-w-0 content-start gap-3">
        <StatReportSums :ctx="expense" />
        <StatReportDetails :ctx="expense" />
      </div>
      <div class="@container/stat grid min-w-0 content-start gap-3">
        <StatReportSums :ctx="income" />
        <StatReportDetails :ctx="income" />
      </div>
    </div>
  </div>
</template>
