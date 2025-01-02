<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { StatDateProvider } from '~/components/date/types'
import type { MoneyTypeSlugNew } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  activeTab: MoneyTypeSlugNew
  hasChildren?: boolean
  isOneCategory?: boolean
  preCategoriesIds?: CategoryId[]
  storageKey: string
  trnsIds: TrnId[]
  walletId?: WalletId
}>()

const trnsStore = useTrnsStore()
const statDate = inject('statDate') as StatDateProvider

const datedTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  dates: {
    from: statDate.range.value.start,
    until: statDate.range.value.end,
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
    class="grid max-w-7xl gap-8 px-2 pb-24 md:grid-cols-2 lg:gap-8 lg:px-4 xl:py-2 2xl:px-8"
  >
    <StatItem
      :hasChildren="props.hasChildren"
      :isOneCategory="props.isOneCategory"
      :preCategoriesIds="props.preCategoriesIds"
      :storageKey="props.storageKey"
      :trnsIds="expenseTrnsIds"
      :walletId="props.walletId"
      type="expense"
    />

    <StatItem
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
    class="min-h-dvh max-w-7xl px-2 lg:px-4 xl:py-2 2xl:px-8"
  >
    <StatItem
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
