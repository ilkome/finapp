<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="sticky top-0 z-20 bg-foreground-1 px-3 pb-3 pt-4 font-tertiary text-lg font-semibold leading-none text-3"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
