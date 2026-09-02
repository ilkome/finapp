<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'
import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

const props = defineProps<{
  activeItemId?: WalletId | null
  amount?: number
  // Classes for the visible item element. Use this (not a fallthrough `class`)
  // so it reaches the body in the context-menu branch, whose root is a
  // renderless ContextMenuRoot that would otherwise swallow it.
  bodyClass?: string
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
  <UiContextMenuMy v-if="props.contextMenuItems" :items="props.contextMenuItems">
    <WalletsItemBody
      :class="props.bodyClass"
      :activeItemId="props.activeItemId"
      :amount="props.amount"
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
  </UiContextMenuMy>

  <WalletsItemBody
    v-else
    :class="props.bodyClass"
    :activeItemId="props.activeItemId"
    :amount="props.amount"
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
