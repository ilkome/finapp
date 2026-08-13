<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  activeTab: StatTabSlug
  categoryId?: CategoryId
  hasChildren?: boolean
  preCategoriesIds?: CategoryId[]
  storageKey: string
  trnsIds: TrnId[]
  walletId?: WalletId
}>()

const statConfig = inject(statConfigKey)!

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
</script>

<template>
  <StatReportSplit
    v-if="effectiveTab === 'split'"
    v-bind="sharedItemProps"
    :trnsIds="trnsIds"
  />

  <StatReport
    v-else
    v-bind="sharedItemProps"
    :trnsIds="trnsIds"
    class="max-w-7xl p-2 pt-0 lg:px-4 2xl:px-8"
  />
</template>
