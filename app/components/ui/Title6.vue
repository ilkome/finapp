<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="text-2xs text-2 leading-none lg:text-sm"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
