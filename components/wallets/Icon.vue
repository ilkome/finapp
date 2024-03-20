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
    class="border flex-center mt-[2px] w-8 h-6 rounded-md text-2xs leading-none text-icon-primary2 hocus_scale-110"
    :style="{ borderColor: color }"
    @click.stop="emit('click', walletId)"
  >
    {{ name.substring(0, 2) }}
  </div>
</template>
