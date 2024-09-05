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
      getStyles('item', ['link', 'rounded', 'minh2']),
      { '!bg-item-3 !text-1': isActive },
    ]"
    class="
      aspect-square
      flex gap-1 items-center justify-center
      border-1 rounded-md
      text-secondary2 text-sm leading-none
    "
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
