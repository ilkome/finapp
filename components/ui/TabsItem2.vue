<script setup lang="ts">
import { getStyles } from '~/components/ui/classes'

defineProps<{
  isActive?: boolean
}>()

const emit = defineEmits(['click'])
</script>

<template>
  <div
    :class="[
      ...getStyles('item', ['link', 'rounded']),
      { '!cursor-default !bg-item-3 !text-accent-1': isActive },
    ]"
    class="
      py-2 px-3 flex gap-1 items-center justify-center
      border-1 rounded-md
      text-secondary2 text-sm leading-none
    "
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
