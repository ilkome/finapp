<script setup lang="ts">
const props = defineProps<{
  maxWidth?: boolean
}>()

const emit = defineEmits(['click'])
</script>

<template>
  <button
    :class="{
      'max-w-[320px]': props.maxWidth,
    }"

    class="
      overflow-hidden relative
      enabled:cursor-default
      py-3 px-3 w-full
      text-accent-3 text-center
      bg-blue-600 rounded-full
      hocus:bg-blue-700
      transition
      min-h-11
    "
    @click="emit('click')"
  >
    <slot />
  </button>
</template>
