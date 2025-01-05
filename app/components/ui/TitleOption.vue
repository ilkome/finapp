<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="font-tertiary text-3 font-semibold leading-none"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
