<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

defineProps<{
  isActive?: boolean
}>()

const emit = defineEmits(['click'])
</script>

<template>
  <div
    :class="[getStyles('item', ['link', 'rounded', 'minh3', 'minw2']), {
      '!bg-item-4 !text-1': isActive,
    }]"
    class="text-muted flex shrink-0 items-center justify-center gap-1 rounded-lg border-1 px-3 text-sm leading-none"
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
