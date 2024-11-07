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
        '!bg-item-3 @xl/wallets:!bg-transparent': isActive,
      },
      getStyles('item', ['minh2']),
    ]"
    class="
      text-3
      hocus:bg-item-5 @4xl/tabs_text-lg @4xl/tabs_p-3 @xl/wallets:grow-0 @xl/wallets:rounded-md @xl/wallets:px-3 flex
      flex-1 grow
      select-none
      items-center
      justify-center gap-1
      rounded-lg
      px-2
      text-sm
    "
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
