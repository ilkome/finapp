<script setup lang="ts">
import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

const props = defineProps<{
  activeItemId?: WalletId | null
  alt?: boolean
  contextMenuItems?: any[][]
  insideClasses?: string
  isShowBaseRate?: boolean
  isShowCreditLimit?: boolean
  isShowIcon?: boolean
  isShowRate?: boolean
  isSort?: boolean
  lineWidth?: number
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
      :alt="props.alt"
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
  </UContextMenu>

  <WalletsItemBody
    v-else
    :activeItemId="props.activeItemId"
    :alt="props.alt"
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
