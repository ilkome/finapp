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
        'flex-center text-icon-primary aspect-square overflow-hidden rounded-full p-1.5 leading-none': props.invert,
      }]"
    class="text-icon-primary leading-none"
    @click="(e: Event) => emit('click', e)"
  />
</template>
