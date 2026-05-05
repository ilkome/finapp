<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'
import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

const props = defineProps<{
  activeItemId?: WalletId | null
  compact?: boolean
  contextMenuItems?: ContextMenuItem[][]
  insideClasses?: string
  isShowBaseRate?: boolean
  isShowCreditLimit?: boolean
  isShowIcon?: boolean
  isShowRate?: boolean
  isSort?: boolean
  lineWidth?: number
  to?: string
  wallet: WalletItemComputed
  walletId: WalletId
}>()

const emit = defineEmits<{
  click: [walletId: WalletId]
}>()
</script>

<template>
  <UContextMenu v-if="props.contextMenuItems" :items="props.contextMenuItems">
    <WalletsItemBody
      :activeItemId="props.activeItemId"
      :compact="props.compact"
      :insideClasses="props.insideClasses"
      :isShowBaseRate="props.isShowBaseRate"
      :isShowCreditLimit="props.isShowCreditLimit"
      :isShowIcon="props.isShowIcon"
      :isShowRate="props.isShowRate"
      :isSort="props.isSort"
      :lineWidth="props.lineWidth"
      :to="props.to"
      :wallet="props.wallet"
      :walletId="props.walletId"
      @click="emit('click', $event)"
    />
  </UContextMenu>

  <WalletsItemBody
    v-else
    :activeItemId="props.activeItemId"
    :compact="props.compact"
    :insideClasses="props.insideClasses"
    :isShowBaseRate="props.isShowBaseRate"
    :isShowCreditLimit="props.isShowCreditLimit"
    :isShowIcon="props.isShowIcon"
    :isShowRate="props.isShowRate"
    :isSort="props.isSort"
    :lineWidth="props.lineWidth"
    :wallet="props.wallet"
    :walletId="props.walletId"
    @click="emit('click', $event)"
  />
</template>
