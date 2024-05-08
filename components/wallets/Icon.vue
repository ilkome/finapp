<script setup lang="ts">
import type { WalletId, WalletItem } from '~/components/wallets/types'

defineProps<{
  color: WalletItem['color']
  name: WalletItem['name']
  walletId: WalletId
}>()

const emit = defineEmits<{
  click: [e: WalletId]
}>()
</script>

<template>
  <div
    class="border flex-center mt-[2px] w-7 h-5 rounded-md text-2xs leading-none text-icon-primary2 hocus_scale-110"
    :style="{ borderColor: color }"
    @click.stop="emit('click', walletId)"
  >
    {{ name.substring(0, 2) }}
  </div>
</template>
