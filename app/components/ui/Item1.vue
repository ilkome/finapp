<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const { variant = 'icon' } = defineProps<{
  variant: 'icon' | 'text'
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="justify-center group-data-[headlessui-state=open]:!bg-item-4" :class="[
      getStyles('item', ['link', 'center', 'minh2', 'minw1', 'rounded']),
      {
        'text-xl': variant === 'icon',
      },
      {
        'px-3 text-sm text-1': variant === 'text',
      },
    ]"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
