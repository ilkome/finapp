<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'
import { cn } from '~~/lib/cn'

const props = defineProps<{
  insideClasses?: string
  isActive?: boolean
  lineWidth?: number
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()

const slots = useSlots()

const classes = computed(() => cn(
  getStyles('item', ['rounded', 'padding1', 'minh2', 'link']),
  'uiElement flex grow items-center gap-3 overflow-hidden -my-[1px] border border-transparent',
  props.insideClasses,
  { 'relative border-accent-1/60 z-10': props.isActive },
))
</script>

<template>
  <div @click="(e: Event) => emit('click', e)">
    <div :class="classes">
      <div
        v-if="slots.leftIcon"
        class="flex-center min-w-8"
      >
        <slot name="leftIcon" />
      </div>

      <slot name="default" />
      <slot name="line" />
    </div>

    <div
      v-if="lineWidth"
      :class="{
        'ml-12': lineWidth === 1,
        'ml-[48px]': lineWidth === 2,
        'group-last/trn:hidden': lineWidth === 3,
        'ml-[48px] group-last/item:hidden': lineWidth === 4,
        'group-last:hidden': lineWidth !== 3 && lineWidth !== 4,
      }"
      class="bg-item-5 mx-2 h-px"
    />
  </div>
</template>

<style>
.v-popper--shown .uiElement {
  @apply !bg-item-3;
}
</style>
