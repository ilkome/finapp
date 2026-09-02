<script setup lang="ts">
const { size = 'md' } = defineProps<{
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <UiText
    :class="size === 'sm' && 'text-sm'"
    variant="section"
  >
    <slot />
  </UiText>
</template>
