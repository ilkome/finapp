<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="text-item-2 text-sm leading-none"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
