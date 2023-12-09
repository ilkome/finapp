<script setup lang="ts">
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template lang="pug">
.text-secondary.font-nunito.text-lg.font-semibold(@click="emit('click')")
  slot
</template>
