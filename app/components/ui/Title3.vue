<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="font-tertiary text-muted text-base leading-none font-semibold"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
