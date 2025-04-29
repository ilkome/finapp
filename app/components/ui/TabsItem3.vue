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
      '!bg-item-4 !text-primary': isActive,
    }]"
    class="flex grow select-none items-center justify-center gap-1 px-2 text-sm leading-none text-muted hover:bg-[var(--item-5)]"
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
