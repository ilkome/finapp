<script setup lang="ts">
const { size = 'xs' } = defineProps<{
  size?: 'xs' | 'sm'
}>()
</script>

<template>
  <div
    :class="cn(
      'font-primary text-muted leading-none',
      size === 'xs' ? 'text-xs' : 'text-sm',
    )"
  >
    <slot />
  </div>
</template>
