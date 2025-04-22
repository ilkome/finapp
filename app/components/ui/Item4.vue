<script setup lang="ts">
import { cn } from '~~/lib/cn'

import { classes } from '~/components/ui/getStyles'

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
    :class="cn(
      'justify-center data-[state=open]:!bg-item-4 min-h-[32px]',
      classes.item.link,
      classes.item.center,
      classes.item.minw1,
      classes.item.rounded,
      variant === 'icon' ? 'text-xl text-(--ui-text-muted)' : '',
      variant === 'text' ? 'px-3 text-sm text-1' : '',
      isActive ? '!bg-item-3' : '',
    )"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
