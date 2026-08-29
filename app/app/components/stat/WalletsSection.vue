<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

import { filterKey } from '~/components/filter/injectionKeys'
import { statConfigKey } from '~/components/stat/injectionKeys'
import { getNextWalletFilterIds, getSortedFilterWalletsIds } from '~/components/stat/utils'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = withDefaults(defineProps<{
  isCategoryFocusActive?: boolean
  periodWalletIds: WalletId[]
}>(), { isCategoryFocusActive: false })

const filter = inject(filterKey)!
const statConfig = inject(statConfigKey)!
const walletsStore = useWalletsStore()
const trnsFormStore = useTrnsFormStore()

const sortedFilterWalletsIds = computed(() => getSortedFilterWalletsIds(
  filter.walletsIds.value,
  walletsStore.recentWalletIds,
  props.periodWalletIds,
  statConfig.config.value.wallets.isShow,
  statConfig.config.value.wallets.count,
  statConfig.config.value.wallets.displayMode,
  props.isCategoryFocusActive && statConfig.config.value.wallets.displayMode === 'period',
))

function onClickWallet(walletId: WalletId) {
  const nextWalletIds = getNextWalletFilterIds(
    filter.walletsIds.value,
    walletId,
    statConfig.config.value.wallets.selectionMode,
  )
  filter.applyFilter(nextWalletIds, filter.categoriesIds.value)
  trnsFormStore.values.walletId = walletId
}
</script>

<template>
  <div
    v-if="statConfig.config.value.wallets.isShow"
    class="stat-wallets-scroll relative isolate z-0 -mx-2 flex snap-x snap-mandatory scroll-px-2 overflow-x-auto px-2 py-px lg:-mx-4 lg:scroll-px-4 lg:px-4 2xl:-mx-8 2xl:scroll-px-8 2xl:px-8"
    data-stat-block="wallets"
    data-stat-wallets-section
  >
    <div class="flex shrink-0 gap-2">
      <WalletsItem
        v-for="walletId in sortedFilterWalletsIds"
        :key="walletId"
        :activeItemId="filter.walletsIds.value.includes(`${walletId}`) ? walletId : null"
        :walletId
        :wallet="walletsStore.itemsComputed?.[walletId]!"
        :isShowIcon="statConfig.config.value.wallets.isShowIcon"
        bodyClass="snap-start snap-always"
        insideClasses="min-h-9.5!"
        compact
        @click="onClickWallet(walletId)"
      />
    </div>
  </div>
</template>

<style scoped>
.stat-wallets-scroll {
  scrollbar-width: none;
}

.stat-wallets-scroll::-webkit-scrollbar {
  display: none;
}
</style>
