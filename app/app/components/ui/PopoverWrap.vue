<script setup lang="ts">
const props = withDefaults(defineProps<{
  contentClass?: string
  isShowCloseBtn?: boolean
  isShowScroll?: boolean
  title?: string
}>(), {
  isShowScroll: true,
})

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div
    class="flex flex-col overflow-hidden"
    style="max-height: min(600px, var(--reka-popper-available-height, 60dvh))"
  >
    <UiTitleModal v-if="props.title" :hasClose="props.isShowCloseBtn">
      {{ props.title }}
    </UiTitleModal>

    <UiButtonClose
      v-if="props.isShowCloseBtn"
      @click="emit('close')"
    />

    <div
      v-if="$slots.default"
      :class="cn(
        // Custom content (`#custom`) owns its own padding; plain content gets the default gutter,
        // and a bottom one only under a title (a bare menu ends at its last row).
        props.isShowScroll ? cn('scroller overflow-y-auto overscroll-contain px-3 py-px', props.title && 'md:pb-4') : 'grid flex-1 overflow-hidden',
        'min-h-0',
        props.contentClass,
      )"
    >
      <slot />
    </div>
  </div>
</template>
