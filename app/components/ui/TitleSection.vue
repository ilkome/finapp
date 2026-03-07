<script setup lang="ts">
const { size = 'md' } = defineProps<{
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <div
    :class="cn(
      'font-tertiary text-muted leading-none font-semibold',
      size === 'md' && 'text-base',
    )"
  >
    <slot />
  </div>
</template>
