<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

defineProps<{
  isActive?: boolean
}>()

const emit = defineEmits(['click'])
</script>

<template>
  <div
    :class="[
      {
        '!bg-item-3 !-text-accent-1 @xl/wallets:!bg-transparent': isActive,
      },
      getStyles('item', ['minh2']),
    ]"
    class="
      select-none
      grow px-2 flex gap-1 items-center justify-center
      text-3 text-sm
      hocus:bg-item-5
      @4xl/tabs_text-lg @4xl/tabs_p-3
      @xl/wallets:grow-0
      @xl/wallets:rounded-md
      @xl/wallets:px-3
    "
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
