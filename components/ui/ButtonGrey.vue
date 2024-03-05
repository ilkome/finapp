<script setup lang="ts">
const emit = defineEmits(['click'])
</script>

<template lang="pug">
button(
  class=`
    cursor-pointer
    py-3 px-3 w-full
    text-accent-3 text-center
    bg-foreground-1 rounded-full
    hocus_bg-foreground-2
    transition
  `
  @click="emit('click')"
)
  slot
</template>
