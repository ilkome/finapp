<script setup lang="ts">
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template lang="html">
  <span
    class="text-secondary font-primary text-md font-medium"
    @click="emit('click')"
  >
    <slot />
  </span>
</template>
