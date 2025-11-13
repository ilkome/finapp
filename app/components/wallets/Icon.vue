<script setup lang="ts">
import type { WalletItem } from '~/components/wallets/types'

const props = defineProps<{
  color: WalletItem['color']
  name: WalletItem['name']
}>()

/**
 * - If the name contains multiple words, returns the first letter of each word, joined and sliced to 2 characters.
 * - If the name is a single word, returns the first two characters of the name.
 */
function getWalletIconName(name: string) {
  return name.split(' ')
    .map(word => word[0])
    .length > 1
    ? name.split(' ').map(word => word[0]).join('').slice(0, 2)
    : name.slice(0, 2)
}
</script>

<template>
  <div
    :style="{ backgroundColor: props.color }"
    class="flex-center text-icon-primary text-2xs aspect-square w-7 overflow-hidden rounded-sm p-1.5 font-extrabold opacity-80"
  >
    {{ getWalletIconName(props.name) }}
  </div>
</template>

<style scoped>

</style>
