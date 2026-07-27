<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="sticky top-0 z-20 bg-default px-4 pt-5 pb-4 font-tertiary text-lg leading-none font-semibold"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
