<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="text-item-base text-2 text-2xs leading-none"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
