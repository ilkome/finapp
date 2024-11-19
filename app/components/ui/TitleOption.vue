<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="text-item-base text-5 text-sm font-medium leading-none"
    @click="(e) => emit('click', e)"
  >
    <slot />
  </div>
</template>
