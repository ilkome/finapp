<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="text-item-base text-secondary text-md font-semibold leading-none"
    @click="(e) => emit('click', e)"
  >
    <slot />
  </div>
</template>
