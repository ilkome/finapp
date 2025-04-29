<script setup lang="ts">
import { cn } from '~~/lib/cn'

import { classes } from '~/components/ui/getStyles'

export type DateLinkItemProps = {
  isActive?: boolean
  variant?: 'small'
}

const props = defineProps<DateLinkItemProps>()
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="cn(
      'flex items-center text-nowrap rounded-sm text-xs leading-none px-3',
      [classes.item.link, classes.item.minh3, classes.item.center2],
      props.variant === 'small' ? 'px-2 text-2xs text-muted' : 'bg-[var(--item-4)]',
      props.isActive ? 'text-primary' : '',
    )"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
