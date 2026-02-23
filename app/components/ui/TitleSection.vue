<script setup lang="ts">
const { size = 'md' } = defineProps<{
  size?: 'sm' | 'md'
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="cn(
      'font-tertiary text-muted leading-none font-semibold',
      size === 'md' && 'text-base',
    )"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
