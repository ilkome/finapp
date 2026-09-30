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
      'flex min-w-10.5 cursor-default items-center justify-center rounded-md interactive data-[state=open]:bg-accented!',
      size === 'md' ? 'min-h-10.5' : 'min-h-8',
      variant === 'icon' && 'rounded-full text-xl text-muted',
      variant === 'text' && 'px-3 text-sm text-highlighted',
      disabled && 'pointer-events-none opacity-30',
    )"
    @click="(e: Event) => emit('click', e)"
  >
    <!-- Filled at icon-button scale so it reads as the same size as its unfilled neighbours. -->
    <span v-if="isActive" class="grid size-8 place-items-center rounded-full bg-primary text-inverted">
      <slot />
    </span>
    <slot v-else />
  </button>
</template>
