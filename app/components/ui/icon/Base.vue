<script setup lang="ts">
const props = defineProps<{
  color?: string
  invert?: boolean
  name: string
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :style="{
      color: props.invert ? '' : props.color,
      backgroundColor: props.invert ? props.color : 'transparent',
    }"
    :class="[
      props.name, {
        'flex-center aspect-square overflow-hidden rounded-full p-1.5 leading-none text-white dark:text-white/90': props.invert,
      }]"
    class="text-base leading-none"
    @click="(e: Event) => emit('click', e)"
  />
</template>
