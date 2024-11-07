<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="text-3 font-tertiary text-base font-semibold leading-none"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
