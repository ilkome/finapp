<script setup lang="ts">
const emit = defineEmits<{
  click: []
}>()
</script>

<template lang="pug">
FilterItemBg(@click="emit('click')")
  .text-secondary(v-if="$slots.icon")
    slot(name="icon")

  .text-sm.leading-none(v-if="$slots.text")
    slot(name="text")
</template>
