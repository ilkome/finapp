<script setup lang="ts">
const props = defineProps<{
  title?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <div class="grid max-h-[60dvh] grid-rows-[auto,1fr]">
    <div class="flex items-center px-3">
      <UiTitle
        v-if="props.title"
        class="px-1 pb-2 pt-4"
      >
        {{ props.title }}
      </UiTitle>
      <BaseBottomSheetClose @onClick="emit('close')" />
    </div>

    <div class="scroller overflow-y-auto">
      <slot />
    </div>
  </div>
</template>
