<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'
import { cn } from '~~/lib/cn'

const props = defineProps<{
  hideDivider?: boolean
  insideClasses?: string
  isActive?: boolean
  isLink?: boolean
  isShowIcon?: boolean
  isShowIcons?: boolean
  isShowLine?: boolean
  isShowToggle?: boolean
  lineWidth?: number
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()

const slots = useSlots()

const classes = computed(() => cn(
  getStyles('item', ['rounded', 'padding1', 'minh2', 'link']),
  'uiElement flex grow items-center gap-3 overflow-hidden -my-[1px]',
  props.insideClasses,
  { 'bg-item-3': props.isActive },
))
</script>

<template>
  <div @click="(e: Event) => emit('click', e)">
    <div :class="classes">
      <div
        v-if="isShowToggle"
        class="flex-center"
      >
        <Icon
          :name="isActive ? 'mdi:chevron-down' : 'mdi:chevron-right'"
          size="22"
          class="-mr-2"
        />
      </div>

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
      v-if="isShowLine"
      class="mx-2 h-[1px] bg-item-5 group-last:hidden"
      :class="{ 'ml-9': isShowIcons, 'ml-11': isShowIcon }"
    />
    <div
      v-if="lineWidth"
      class="mx-2 h-[1px] bg-item-5 group-last:hidden"
      :class="{ 'ml-12': lineWidth === 1, 'ml-11': lineWidth === 2 }"
    />
  </div>
</template>

<style>
.v-popper--shown .uiElement {
  @apply !bg-item-3;
}
</style>
