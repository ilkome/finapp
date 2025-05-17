<script setup lang="ts">
import { cn } from '~~/lib/cn'

import { classes } from '~/components/ui/getStyles'

const props = defineProps<{
  isHideArrow?: boolean
  isOpen?: boolean
  isShown?: boolean
}>()
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <div
    :class="cn(
      [classes.item.center, classes.item.padding3, classes.item.minh2, classes.item.minw1, classes.item.rounded],
      'flex grow items-center gap-2 pb-0 !font-tertiary !text-base font-semibold leading-none tracking-wide',
      !props.isHideArrow && [classes.item.link],
    )"
    @click="emit('click')"
  >
    <div><slot /></div>
    <Icon
      v-if="!props.isHideArrow && !props.isShown"
      name="lucide:chevron-left"
      size="22"
      class="-ml-1"
    />
  </div>
</template>
