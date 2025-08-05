<script setup lang="ts">
const props = defineProps<{
  isShowCloseBtn?: boolean
  title?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <div
    class="grid max-h-[60dvh]"
    :class="{ 'grid-rows-[auto_1fr]': props.title || props.isShowCloseBtn }"
  >
    <UiTitleModal v-if="props.title">
      {{ props.title }}
    </UiTitleModal>

    <BottomSheetClose
      v-if="props.isShowCloseBtn"
      @onClick="emit('close')"
    />

    <div
      v-if="$slots.default"
      class="scroller overflow-y-auto py-px"
    >
      <slot />
    </div>
  </div>
</template>
