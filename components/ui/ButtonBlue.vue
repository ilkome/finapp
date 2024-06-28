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
      enabled:cursor-pointer
      py-3 px-3 w-full
      text-accent-3 text-center
      bg-accent-2 rounded-full
      hocus:bg-accent-2/80
      transition
      min-h-11
    "
    @click="emit('click')"
  >
    <slot />
  </button>
</template>
