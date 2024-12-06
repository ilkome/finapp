<script setup lang="ts">
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { MoneyTypeSlugNew } from '~/components/stat/types'
import type { CategoryId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'

const props = defineProps<{
  activeTab: MoneyTypeSlugNew
  preCategoriesIds?: CategoryId[]
  storageKey: string
  trnsIds: TrnId[]
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
      :storageKey
      :trnsIds="expenseTrnsIds"
      :preCategoriesIds="props.preCategoriesIds"
      hasChildren
      type="expense"
    />

    <StatItem
      :storageKey
      :trnsIds="incomeTrnsIds"
      :preCategoriesIds="props.preCategoriesIds"
      hasChildren
      type="income"
    />
  </div>

  <div
    v-else
    class="max-w-7xl px-2 pb-24 lg:px-4 xl:py-2 2xl:px-8"
  >
    <StatItem
      :storageKey
      :type="activeTab"
      :trnsIds="trnsIds"
      :preCategoriesIds="props.preCategoriesIds"
      hasChildren
    />
  </div>
</template>
