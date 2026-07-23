<script setup lang="ts">
const { ariaLabel, disabled = false, isActive = false, size = 'md', variant = 'icon' } = defineProps<{
  ariaLabel?: string
  disabled?: boolean
  isActive?: boolean
  size?: 'sm' | 'md'
  variant?: 'icon' | 'text'
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <button
    type="button"
    :aria-label="ariaLabel"
    :disabled="disabled"
    :class="cn(
      'interactive data-[state=open]:bg-accented! flex min-w-10.5 cursor-default items-center justify-center rounded-md',
      size === 'md' ? 'min-h-10.5' : 'min-h-8',
      variant === 'icon' && 'text-muted text-xl',
      variant === 'text' && 'text-highlighted px-3 text-sm',
      isActive && 'bg-elevated/30',
      disabled && 'pointer-events-none opacity-30',
    )"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </button>
</template>
