<script setup lang="ts">
const { isActive = false, variant = 'default' } = defineProps<{
  isActive?: boolean
  variant?: 'default' | 'outline'
}>()

const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <div
    :class="cn(
      'flex items-center justify-center gap-1 text-sm leading-none',
      variant === 'default' && 'min-h-[38px] grow select-none px-2 hover:bg-elevated/50',
      variant === 'outline' && 'interactive min-h-[32px] min-w-[60px] shrink-0 rounded-sm px-3',
      isActive
        ? variant === 'default' ? '!bg-elevated/30' : '!bg-elevated/30'
        : 'text-muted',
    )"
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
