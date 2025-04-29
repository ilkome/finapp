<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="sticky top-0 z-20 bg-default px-4 pb-4 pt-5 font-tertiary text-lg font-semibold leading-none"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
