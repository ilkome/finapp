<script setup lang="ts">
import { cn } from '~~/lib/cn'

import { classes } from '~/components/ui/getStyles'

const props = defineProps<{
  isActive?: boolean
}>()

const emit = defineEmits(['click'])
</script>

<template>
  <div
    :class="cn(
      'flex flex-1 grow select-none items-center justify-center gap-1 text-nowrap rounded px-2 text-sm text-3 hover:bg-[var(--item-5)]',
      [classes.item.minh3],
      props.isActive && 'bg-item-4',
    )"
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
