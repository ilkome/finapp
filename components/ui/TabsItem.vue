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
        '!bg-item-3 !text-accent-1': isActive,
      },
      getStyles('item', ['minh']),
    ]"
    class="
      select-none
      grow px-2 flex gap-1 items-center justify-center
      text-4 text-sm
      hocus:bg-item-5
      @4xl/tabs_text-lg @4xl/tabs_p-3
    "
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
