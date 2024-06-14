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
        '!bg-item-3 !text-prima': isActive,
      },
      getStyles('item', ['minh']),
    ]"
    class="
      select-none
      grow px-2 flex gap-1 items-center justify-center
      text-prima/80 text-sm
      hocus_bg-item-5
      @4xl/tabs_text-lg @4xl/tabs_p-3
    "
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
