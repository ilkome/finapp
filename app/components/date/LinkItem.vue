<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

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
    :class="[
      getStyles('item', ['link', props.variant === 'small' ? '' : 'alt', 'center2', 'minh3', 'rounded4']),
      { 'text-accent-1': props.isActive },
      { 'px-2 text-2xs': props.variant === 'small' },
      { 'px-3': props.variant !== 'small' },
    ]"
    class="text-nowrap rounded-full font-primary text-xs leading-none"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
