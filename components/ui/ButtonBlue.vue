<script setup lang="ts">
const props = defineProps<{
  maxWidth?: boolean
}>()

const emit = defineEmits(['click'])

const classes = computed(() => {
  const cls = []
  if (props.maxWidth)
    cls.push('max-w-[320px]')

  return cls
})
</script>

<template lang="pug">
button(
  :class="classes"
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
