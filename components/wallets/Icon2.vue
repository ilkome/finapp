<script setup lang="ts">
import type { WalletId, WalletItem } from '~/components/wallets/types'

defineProps<{
  name: WalletItem['name']
  color: WalletItem['color']
  walletId: WalletId
}>()

const emit = defineEmits<{
  click: [e: WalletId]
}>()
</script>

<template>
  <div
    class="size-2 rounded-full border hocus_scale-150"
    :style="{ borderColor: color }"
    @click.stop="emit('click', walletId)"
  />
</template>
