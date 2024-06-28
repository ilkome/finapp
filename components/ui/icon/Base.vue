<script setup lang="ts">
const props = defineProps<{
  color?: string
  name: string
  size?: string
}>()
</script>

<template>
  <div
    :class="props.name"
    :style="{
      color: props.color,
    }"
    class="text-xl"
  />
</template>
