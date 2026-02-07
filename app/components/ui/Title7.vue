<script setup lang="ts">
import { cn } from '~~/lib/cn'

import { classes } from '~/components/ui/getStyles'

const props = defineProps<{
  isHideArrow?: boolean
}>()
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <div
    :class="cn(
      [classes.item.center, classes.item.minh2, classes.item.minw1, classes.item.rounded],
      'group flex grow items-center justify-between px-4 gap-2 pb-0 !font-tertiary !text-base font-semibold leading-none tracking-wide',
      !props.isHideArrow && [classes.item.link],
    )"
    @click="emit('click')"
  >
    <div><slot /></div>
    <Icon
      v-if="!props.isHideArrow"
      name="lucide:chevron-right"
      size="22"
      class="text-2 group-hover:text-1 -ml-1"
    />
  </div>
</template>
