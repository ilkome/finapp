<script setup lang="ts">
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template lang="pug">
div(
  class=`
    cursor-pointer relative
    py-1 px-3
    flex items-center gap-3
    rounded-md
    bg-item-main-bg
    hocus_bg-item-main-hover
  `
  @click="emit('click')"
)
  slot
</template>
