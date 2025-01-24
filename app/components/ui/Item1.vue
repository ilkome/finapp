<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const { isActive = false, variant = 'icon' } = defineProps<{
  isActive?: boolean
  variant?: 'icon' | 'text'
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="group-data-[headlessui-state=open]:!bg-item-4 justify-center" :class="[
      getStyles('item', ['link', 'center', 'minh2', 'minw1', 'rounded']),
      {
        'text-2 text-xl': variant === 'icon',
      },
      {
        'text-1 px-3 text-sm': variant === 'text',
      },
      {
        '!bg-item-3': isActive,
      },
    ]"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
