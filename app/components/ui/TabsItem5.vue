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
      ...getStyles('item', ['link', 'rounded', 'minh2', 'minw2']),
      { '!bg-item-3 !text-1': isActive },
    ]"
    class="
      flex gap-1 items-center justify-center
      px-3
      text-secondary2 text-sm leading-none
      border-1 rounded-lg
    "
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
