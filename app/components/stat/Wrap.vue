<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { statDateKey } from '~/components/stat/injectionKeys'
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
const statDate = inject(statDateKey)!

const sharedItemProps = computed(() => ({
  categoryId: props.categoryId,
  hasChildren: props.hasChildren,
  preCategoriesIds: props.preCategoriesIds,
  statTab: props.activeTab,
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
  trnsTypes: [TrnType.Expense, TrnType.Transfer],
}))

const incomeTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  trnsIds: datedTrnsIds.value,
  trnsTypes: [TrnType.Income, TrnType.Transfer],
}))
</script>

<template>
  <div
    v-if="props.activeTab === 'split'"
    class="grid max-w-7xl gap-8 px-2 pb-24 lg:px-4 xl:py-2 2xl:px-8 @3xl/page:grid-cols-2 @3xl/page:gap-8"
  >
    <StatItem
      v-bind="sharedItemProps"
      :trnsIds="expenseTrnsIds"
      type="expense"
    />

    <StatItem
      v-bind="sharedItemProps"
      :trnsIds="incomeTrnsIds"
      type="income"
    />
  </div>

  <StatItem
    v-else
    v-bind="sharedItemProps"
    :trnsIds="datedTrnsIds"
    class="max-w-7xl p-2 pt-0 lg:px-4 2xl:px-8"
  />
</template>
