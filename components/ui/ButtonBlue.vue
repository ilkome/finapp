<script setup lang="ts">
const emit = defineEmits(['click'])
</script>

<template lang="pug">
button(
  class=`
    cursor-pointer
    py-3 px-3 w-full
    text-accent-primary text-center
    bg-accent-default rounded-full
    hocus_bg-accent-default/80
    transition
  `
  @click="emit('click')"
)
  slot
</template>
