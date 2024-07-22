<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="text-3 text-base font-semibold font-nunito leading-none"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
