<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

defineProps<{
  isActive?: boolean
}>()

const emit = defineEmits(['click'])
</script>

<template>
  <div
    :class="[getStyles('item', ['minh2']), {
      '!bg-item-3 !text-accent-1': isActive,
    }]"
    class="text-3 hocus:bg-item-hover flex grow select-none items-center justify-center gap-1 px-2 text-sm"
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
