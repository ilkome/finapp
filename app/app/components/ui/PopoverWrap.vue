<script setup lang="ts">
const props = defineProps<{
  isShowCloseBtn?: boolean
  title?: string
}>()

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

    <BottomSheetClose
      v-if="props.isShowCloseBtn"
      @click="emit('close')"
    />

    <div
      v-if="$slots.default"
      class="scroller overflow-y-auto py-px"
    >
      <slot />
    </div>
  </div>
</template>
