<script setup lang="ts">
const props = defineProps<{
  title?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <div class="grid grid-rows-[auto,1fr] max-h-[60dvh]">
    <div class="flex items-center px-3 h-12">
      <UiTitle v-if="props.title">
        {{ props.title }}
      </UiTitle>
      <BaseBottomSheetClose @onClick="emit('close')" />
    </div>

    <div class="overflow-y-auto scroller">
      <slot />
    </div>
  </div>
</template>
