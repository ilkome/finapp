<script setup lang="ts">
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template lang="pug">
div(
  class=`
    relative
    py-1 px-3
    flex items-center gap-3
    rounded-md
    bg-item-4
    text-secondary/80
    hocus_bg-item-5
    min-h-[42px]
  `
  @click="emit('click')"
)
  slot
</template>
