<script setup lang="ts">
const emit = defineEmits(['click'])
</script>

<template lang="pug">
button(
  class=`
    cursor-pointer
    py-3 px-3 w-full
    text-accent-3 text-center
    bg-item-4 rounded-full
    hocus_bg-item-5
    transition
  `
  @click="emit('click')"
)
  slot
</template>
