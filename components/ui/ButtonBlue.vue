<script setup lang="ts">
const emit = defineEmits(['click'])
</script>

<template lang="pug">
button(
  class=`
    overflow-hidden relative
    enabled:cursor-pointer
    py-3 px-3 w-full
    min-h-[48px]
    text-accent-primary text-center
    bg-accent-2 rounded-full
    hocus_bg-accent-2/80
    transition
  `
  @click="emit('click')"
)
  slot
</template>
