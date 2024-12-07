<script setup lang="ts">
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { MoneyTypeSlugNew } from '~/components/stat/types'
import type { CategoryId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

const props = defineProps<{
  activeTab: MoneyTypeSlugNew
  hasChildren?: boolean
  preCategoriesIds?: CategoryId[]
  storageKey: string
  trnsIds: TrnId[]
  walletId?: WalletId
}>()

const trnsStore = useTrnsStore()

const expenseTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  trnsIds: props.trnsIds,
  trnsTypes: [0, 2],
}, {
  includesChildCategories: true,
}))

const incomeTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  trnsIds: props.trnsIds,
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
      :preCategoriesIds="props.preCategoriesIds"
      :storageKey="props.storageKey"
      :trnsIds="expenseTrnsIds"
      :walletId="props.walletId"
      :hasChildren="props.hasChildren"
      type="expense"
    />

    <StatItem
      :preCategoriesIds="props.preCategoriesIds"
      :storageKey="props.storageKey"
      :trnsIds="incomeTrnsIds"
      :walletId="props.walletId"
      :hasChildren="props.hasChildren"
      type="income"
    />
  </div>

  <div
    v-else
    class="max-w-7xl px-2 pb-24 lg:px-4 xl:py-2 2xl:px-8"
  >
    <StatItem
      :preCategoriesIds="props.preCategoriesIds"
      :storageKey="props.storageKey"
      :trnsIds="props.trnsIds"
      :type="props.activeTab"
      :walletId="props.walletId"
      :hasChildren="props.hasChildren"
    />
  </div>
</template>
