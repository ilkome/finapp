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
      { '!bg-item-3 !text-primary': isActive },
    ]"
    class="
      grow
      py-2 px-3 flex gap-1 items-center
      border-1 rounded-md
      justify-center text-secondary2 text-sm leading-none
    "
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
