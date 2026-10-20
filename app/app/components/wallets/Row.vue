<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'
import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

// One wallet row as the wallets list draws it; lists put rows in `grid gap-1` so spacing matches everywhere.
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  baseCurrencyCode: string
  chevron?: 'more' | 'right'
  contextMenuItems?: ContextMenuItem[][]
  to?: string
  wallet: WalletItemComputed
  walletId: WalletId
}>()

const emit = defineEmits<{
  click: [walletId: WalletId]
}>()
</script>

<template>
  <UiRowBackground class="group flex items-stretch" type="standard" v-bind="$attrs">
    <slot name="before" />
    <WalletsItem
      class="min-w-0 grow"
      :baseCurrencyCode="props.baseCurrencyCode"
      :chevron="props.chevron"
      :contextMenuItems="props.contextMenuItems"
      isShowBaseRate
      isShowCreditLimit
      isShowIcon
      isShowRate
      :to="props.to"
      :wallet="props.wallet"
      :walletId="props.walletId"
      @click="emit('click', $event)"
    >
      <template v-if="$slots.append" #append>
        <slot name="append" />
      </template>
    </WalletsItem>
    <slot name="after" />
  </UiRowBackground>
</template>
