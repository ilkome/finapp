<script setup lang="ts">
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template lang="pug">
.text-secondary.font-primary.text-md.font-medium(@click="emit('click')")
  slot
</template>
