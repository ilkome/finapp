<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'
import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

const props = defineProps<{
  activeItemId?: WalletId | null
  amount?: number
  baseCurrencyCode?: string
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

const bodyProps = computed(() => {
  const { bodyClass, contextMenuItems: _, ...rest } = props
  return { ...rest, class: bodyClass }
})
</script>

<template>
  <UiContextMenuMy v-if="props.contextMenuItems" :items="props.contextMenuItems">
    <WalletsItemBody v-bind="bodyProps" @click="emit('click', $event)" />
  </UiContextMenuMy>

  <WalletsItemBody v-else v-bind="bodyProps" @click="emit('click', $event)" />
</template>
