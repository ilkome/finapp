<script setup lang="ts">
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <div
    class="text-secondary font-primary text-md font-medium"
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
