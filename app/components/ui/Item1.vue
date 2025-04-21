<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const { isActive = false, variant = 'icon' } = defineProps<{
  isActive?: boolean
  variant?: 'icon' | 'text'
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="justify-center data-[state=open]:!bg-item-4" :class="[
      getStyles('item', ['link', 'center', 'minh2', 'minw1', 'rounded']),
      {
        'text-xl text-(--ui-text-muted)': variant === 'icon',
      },
      {
        'px-3 text-sm text-1': variant === 'text',
      },
      {
        '!bg-item-3': isActive,
      },
    ]"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
