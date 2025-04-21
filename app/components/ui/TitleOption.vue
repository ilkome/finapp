<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="font-tertiary font-semibold leading-none text-(--ui-text-muted)"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
