<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="text-3 font-semibold leading-none"
    @click="(e) => emit('click', e)"
  >
    <slot />
  </div>
</template>
