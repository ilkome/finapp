<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="font-primary text-sm leading-none text-2"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
