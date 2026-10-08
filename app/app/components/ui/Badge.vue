<script setup lang="ts">
const { tone = 'muted' } = defineProps<{
  tone?: 'error' | 'muted' | 'warning'
}>()

const tones = {
  error: 'bg-error/15 text-error',
  muted: 'bg-elevated/60 text-muted',
  warning: 'bg-warning/15 text-warning',
}
</script>

<template>
  <span :class="cn('shrink-0 rounded-sm px-2 py-0.5 text-2xs leading-4', tones[tone])">
    <slot />
  </span>
</template>
