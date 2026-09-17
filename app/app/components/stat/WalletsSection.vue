<script setup lang="ts">
import type { StatWalletRecord } from '~/components/stat/wallets/View.vue'
import type { WalletId } from '~/components/wallets/types'

import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'
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

const statConfig = useStatConfigCtx()
const walletsStore = useWalletsStore()
const trnsFormStore = useTrnsFormStore()

const walletsConfig = computed(() => statConfig.wallets.value)

const items = computed<StatWalletRecord[]>(() => getSortedFilterWalletsIds(
  props.selectedWalletIds,
  walletsStore.sortedIds,
  props.periodWalletIds,
  walletsConfig.value.isShow,
  walletsConfig.value.count,
  walletsConfig.value.displayMode,
  props.isCategoryFocusActive && walletsConfig.value.displayMode === 'period',
).flatMap((walletId) => {
  const wallet = walletsStore.itemsComputed?.[walletId]
  return wallet
    ? [{
        amount: walletsConfig.value.valueMode === 'period' ? props.walletPeriodTotals[walletId] ?? 0 : undefined,
        isSelected: props.selectedWalletIds.includes(`${walletId}`),
        wallet,
        walletId,
      }]
    : []
}))

function onSelect(walletId: WalletId) {
  emit('update:selectedWalletIds', getNextWalletFilterIds(props.selectedWalletIds, walletId, walletsConfig.value.selectionMode))
  trnsFormStore.values.walletId = walletId
}
</script>

<template>
  <StatWalletsView
    v-if="walletsConfig.isShow"
    :isShowIcon="walletsConfig.isShowIcon"
    :items
    @select="onSelect"
  />
</template>
