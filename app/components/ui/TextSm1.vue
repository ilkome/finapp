<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="font-primary text-muted text-xs leading-none"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
