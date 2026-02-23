<script setup lang="ts">
const { size = 'xs' } = defineProps<{
  size?: 'xs' | 'sm'
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="cn(
      'font-primary text-muted leading-none',
      size === 'xs' ? 'text-xs' : 'text-sm',
    )"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
