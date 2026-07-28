<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { filterKey } from '~/components/filter/injectionKeys'
import { statConfigKey, statDateKey, statStickyNavKey } from '~/components/stat/injectionKeys'
import { useStatReportContext } from '~/components/stat/useStatReportContext'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  activeTab: StatTabSlug
  categoryId?: CategoryId
  hasChildren?: boolean
  preCategoriesIds?: CategoryId[]
  storageKey: string
  trnsIds: TrnId[]
  walletId?: WalletId
}>()

const trnsStore = useTrnsStore()
const filter = inject(filterKey)!
const statConfig = inject(statConfigKey)!
const statDate = inject(statDateKey)!
// Dashboard pins the nav row + sum tiles to the top with the header's background.
const stickyNav = inject(statStickyNavKey, false)

// Mobile has no per-type tabs (see Header/Menu), so always show the combined
// summary view.
const effectiveTab = computed<StatTabSlug>(() => statConfig.showTabs.value ? props.activeTab : 'summary')

const sharedItemProps = computed(() => ({
  categoryId: props.categoryId,
  hasChildren: props.hasChildren,
  preCategoriesIds: props.preCategoriesIds,
  statTab: effectiveTab.value,
  storageKey: props.storageKey,
  walletId: props.walletId,
}))

const datedTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  dates: {
    end: statDate.range.value.end,
    start: statDate.range.value.start,
  },
  trnsIds: props.trnsIds,
}))

const expenseTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  trnsIds: datedTrnsIds.value,
  trnsTypes: [TrnType.Expense],
}))

const incomeTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  trnsIds: datedTrnsIds.value,
  trnsTypes: [TrnType.Income],
}))

// Built unconditionally (not gated on the split tab) because useStatReport must
// be called from setup - see plan section 5.
const commonContextParams = {
  applyStatsExclusion: computed(() => !props.categoryId && !filter.categoriesIds.value.length),
  categoryId: computed(() => props.categoryId),
  filter,
  hasChildren: computed(() => props.hasChildren),
  preCategoriesIds: computed(() => props.preCategoriesIds),
  statConfig,
  statDate,
  statTab: effectiveTab,
  storageKey: computed(() => props.storageKey),
  walletId: computed(() => props.walletId),
}

const expense = useStatReportContext({
  ...commonContextParams,
  trnsIds: expenseTrnsIds,
  type: computed(() => 'expense' as const),
})

const income = useStatReportContext({
  ...commonContextParams,
  trnsIds: incomeTrnsIds,
  type: computed(() => 'income' as const),
})
</script>

<template>
  <div
    v-if="effectiveTab === 'split'"
    class="grid max-w-7xl gap-4 px-2 pb-24 lg:px-4 xl:py-2 2xl:px-8"
  >
    <div class="grid gap-8 @3xl/page:grid-cols-2">
      <StatReportChart :ctx="expense" />
      <StatReportChart :ctx="income" />
    </div>

    <div :class="stickyNav && 'bg-default/90 sticky top-0 z-10 -mx-2 px-2 backdrop-blur lg:-mx-4 lg:px-4 lg:pb-2'">
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

  <StatReport
    v-else
    v-bind="sharedItemProps"
    :trnsIds="datedTrnsIds"
    class="max-w-7xl p-2 pt-0 lg:px-4 2xl:px-8"
  />
</template>
