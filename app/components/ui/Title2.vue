<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="text-item-base text-2 font-tertiary font-bold leading-none"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
