<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { Range } from '~/components/date/types'
import type { StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  activeTab: StatTabSlug
  hasChildren?: boolean
  isOneCategory?: boolean
  preCategoriesIds?: CategoryId[]
  range: Range
  storageKey: string
  trnsIds: TrnId[]
  walletId?: WalletId
}>()

const trnsStore = useTrnsStore()

const datedTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  dates: {
    from: props.range.start,
    until: props.range.end,
  },
  trnsIds: props.trnsIds,
}))

const expenseTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  trnsIds: datedTrnsIds.value,
  trnsTypes: [0, 2],
}, {
  includesChildCategories: true,
}))

const incomeTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  trnsIds: datedTrnsIds.value,
  trnsTypes: [1, 2],
}, {
  includesChildCategories: true,
}))
</script>

<template>
  <!-- Summary -->
  <div
    v-if="props.activeTab === 'summary'"
    class="@3xl/page:gap-8 @3xl/page:grid-cols-2 grid max-w-7xl gap-8 px-2 pb-24 lg:px-4 xl:py-2 2xl:px-8"
  >
    <StatItem
      :activeTab="props.activeTab"
      :hasChildren="props.hasChildren"
      :isOneCategory="props.isOneCategory"
      :preCategoriesIds="props.preCategoriesIds"
      :storageKey="props.storageKey"
      :trnsIds="expenseTrnsIds"
      :walletId="props.walletId"
      type="expense"
    />

    <StatItem
      :activeTab="props.activeTab"
      :hasChildren="props.hasChildren"
      :isOneCategory="props.isOneCategory"
      :preCategoriesIds="props.preCategoriesIds"
      :storageKey="props.storageKey"
      :trnsIds="incomeTrnsIds"
      :walletId="props.walletId"
      type="income"
    />
  </div>

  <div
    v-else
    class="min-h-dvh max-w-7xl p-2 lg:px-4 2xl:px-8"
  >
    <StatItem
      :activeTab="props.activeTab"
      :hasChildren="props.hasChildren"
      :isOneCategory="props.isOneCategory"
      :preCategoriesIds="props.preCategoriesIds"
      :storageKey="props.storageKey"
      :trnsIds="datedTrnsIds"
      :type="props.activeTab"
      :walletId="props.walletId"
    />
  </div>
</template>
