<script setup lang="ts">
import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

/** One wallet pill: the wallet plus what this period shows for it. */
export type StatWalletRecord = {
  /** Period total when the block is in period mode; absent shows the wallet balance. */
  amount?: number
  isSelected: boolean
  wallet: WalletItemComputed
  walletId: WalletId
}

const props = defineProps<{
  isShowIcon?: boolean
  items: StatWalletRecord[]
}>()

const emit = defineEmits<{
  select: [walletId: WalletId]
}>()
</script>

<template>
  <div
    class="relative isolate z-0 -mx-2 scroll-strip flex snap-x snap-mandatory scroll-px-2 overflow-x-auto px-2 py-px lg:-mx-4 lg:scroll-px-4 lg:px-4 2xl:-mx-8 2xl:scroll-px-8 2xl:px-8"
    data-stat-block="wallets"
    data-stat-wallets-section
  >
    <div class="flex shrink-0 gap-2">
      <WalletsItem
        v-for="item in props.items"
        :key="item.walletId"
        :activeItemId="item.isSelected ? item.walletId : null"
        :amount="item.amount"
        :isShowIcon="props.isShowIcon"
        :wallet="item.wallet"
        :walletId="item.walletId"
        bodyClass="snap-start snap-always"
        insideClasses="min-h-9.5!"
        compact
        @click="emit('select', item.walletId)"
      />
    </div>
  </div>
</template>
