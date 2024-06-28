<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

defineProps<{
  hideDivider?: boolean
  isActive?: boolean
  isShowIcons?: boolean
  isShowLine?: boolean
  isShowToggle?: boolean
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()

const slots = useSlots()
</script>

<template>
  <div
    @click="e => emit('click', e)"
  >
    <div
      :class="[
        { '!bg-item-3': isActive },
        getStyles('item', ['link', 'rounded', 'padding1', 'minh']),
      ]"

      class="
        flex grow items-center gap-3 overflow-hidden -my-[1px]
        uiElement
      "
    >
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
        class="flex-center w-6"
      >
        <slot name="leftIcon" />
      </div>

      <slot name="default" />

      <slot name="line" />
    </div>

    <div
      v-if="isShowLine"
      class="ml-9 mr-2 h-[1px] bg-item-5 group-last:hidden"
      :class="{ 'ml-9': isShowIcons, 'ml-11': !isShowIcons }"
    />
  </div>
</template>

<style>
.v-popper--shown .uiElement {
  @apply !bg-item-3;
}
</style>
