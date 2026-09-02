<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

import { statConfigKey } from '~/components/stat/injectionKeys'
import { getNextWalletFilterIds, getSortedFilterWalletsIds } from '~/components/stat/utils'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = withDefaults(defineProps<{
  isCategoryFocusActive?: boolean
  periodWalletIds: WalletId[]
  selectedWalletIds: WalletId[]
  walletPeriodTotals: Partial<Record<WalletId, number>>
}>(), { isCategoryFocusActive: false })

const emit = defineEmits<{
  'update:selectedWalletIds': [walletIds: WalletId[]]
}>()

const statConfig = inject(statConfigKey)!
const walletsStore = useWalletsStore()
const trnsFormStore = useTrnsFormStore()

const sortedFilterWalletsIds = computed(() => getSortedFilterWalletsIds(
  props.selectedWalletIds,
  walletsStore.sortedIds,
  props.periodWalletIds,
  statConfig.config.value.wallets.isShow,
  statConfig.config.value.wallets.count,
  statConfig.config.value.wallets.displayMode,
  props.isCategoryFocusActive && statConfig.config.value.wallets.displayMode === 'period',
))

function onClickWallet(walletId: WalletId) {
  const nextWalletIds = getNextWalletFilterIds(
    props.selectedWalletIds,
    walletId,
    statConfig.config.value.wallets.selectionMode,
  )
  emit('update:selectedWalletIds', nextWalletIds)
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
        :activeItemId="props.selectedWalletIds.includes(`${walletId}`) ? walletId : null"
        :amount="statConfig.config.value.wallets.valueMode === 'period' ? props.walletPeriodTotals[walletId] ?? 0 : undefined"
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
