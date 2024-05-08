<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="text-item-base font-mono text-secondary text-lg font-semibold leading-none"
    @click="(e) => emit('click', e)"
  >
    <slot />
  </div>
</template>
