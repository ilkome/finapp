<script setup lang="ts">
const emit = defineEmits(['click'])
</script>

<template lang="pug">
button(
  class=`
    cursor-pointer
    py-3 px-3 w-full
    text-accent-primary text-center
    bg-foreground-active rounded-full
    hocus_bg-foreground-hover
    transition
  `
  @click="emit('click')"
)
  slot
</template>
