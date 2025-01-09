<script setup lang="ts">
const props = defineProps<{
  title?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <div class="grid max-h-[60dvh] grid-rows-[auto,1fr] gap-0">
    <UiTitleModal v-if="props.title">
      {{ props.title }}
    </UiTitleModal>

    <BottomSheetClose
      @onClick="emit('close')"
    />

    <div class="scroller overflow-y-auto pb-2 pt-px">
      <slot />
    </div>
  </div>
</template>
