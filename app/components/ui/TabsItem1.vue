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
      '!bg-item-4': isActive,
    }]"
    class="flex flex-1 grow select-none items-center justify-center gap-1 rounded-lg px-2 text-sm text-3 hocus:bg-item-5"
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
