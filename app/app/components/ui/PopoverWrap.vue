<script setup lang="ts">
const props = withDefaults(defineProps<{
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
      :class="props.isShowScroll ? 'scroller overflow-y-auto' : 'grid flex-1 overflow-hidden'"
      class="min-h-0 px-2 py-px md:pb-4"
    >
      <slot />
    </div>
  </div>
</template>
