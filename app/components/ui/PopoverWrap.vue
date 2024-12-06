<script setup lang="ts">
const props = defineProps<{
  title?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <div class="grid max-h-[60dvh] grid-rows-[auto,1fr] gap-2">
    <div class="flex items-center px-3">
      <UiTitle
        v-if="props.title"
        class="px-1 pb-2 pt-4"
      >
        {{ props.title }}
      </UiTitle>
      <BottomSheetClose @onClick="emit('close')" />
    </div>

    <div class="scroller overflow-y-auto px-3">
      <slot />
    </div>
  </div>
</template>
