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
        'flex-center rounded-full aspect-square overflow-hidden p-1.5 text-white/80 leading-none': props.invert,
      }]"
    class="text-xl"
    @click="(e: Event) => emit('click', e)"
  />
</template>
