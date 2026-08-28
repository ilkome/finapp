<script setup lang="ts">
const { size = 'md' } = defineProps<{
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <div
    :class="cn(
      'font-tertiary leading-none font-semibold text-muted',
      size === 'md' && 'text-base',
    )"
  >
    <slot />
  </div>
</template>
