<script setup lang="ts">
const props = withDefaults(defineProps<{
  isShowCloseBtn?: boolean
  // Off when the slotted content manages its own scrolling (avoids a second,
  // nested scrollbar). On by default for plain content that relies on this wrap.
  scroll?: boolean
  title?: string
}>(), {
  scroll: true,
})

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div
    :class="cn('grid',
               (props.title || props.isShowCloseBtn) && 'grid-rows-[auto_1fr]',
    )"
    style="max-height: var(--reka-popper-available-height, 60dvh)"
  >
    <UiTitleModal v-if="props.title">
      {{ props.title }}
    </UiTitleModal>

    <UiButtonClose
      v-if="props.isShowCloseBtn"
      @click="emit('close')"
    />

    <div
      v-if="$slots.default"
      :class="props.scroll ? 'scroller overflow-y-auto' : 'grid min-h-0 overflow-hidden'"
      class="px-2 py-px"
    >
      <slot />
    </div>
  </div>
</template>
