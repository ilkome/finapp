<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="text-3 font-tertiary text-base font-semibold leading-none bg-foreground-1 sticky top-0 z-20 px-3 pb-3 pt-4"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
