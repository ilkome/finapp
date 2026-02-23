<script setup lang="ts">
const { isActive = false, size = 'md', variant = 'icon' } = defineProps<{
  isActive?: boolean
  size?: 'sm' | 'md'
  variant?: 'icon' | 'text'
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="cn(
      'interactive data-[state=open]:!bg-item-4 flex min-w-[42px] items-center justify-center rounded-sm',
      size === 'md' ? 'min-h-[38px]' : 'min-h-[32px]',
      variant === 'icon' && 'text-muted text-xl',
      variant === 'text' && 'text-1 px-3 text-sm',
      isActive && 'bg-item-3',
    )"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
