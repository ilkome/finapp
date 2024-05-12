<script setup lang="ts">
import type { CategoryItem } from '~/components/categories/types'

defineProps<{
  color: CategoryItem['color']
  icon: CategoryItem['icon']
  size?: 'lg' | 'xl'
}>()

const emit = defineEmits<{
  click: [event: Event]
}>()
</script>

<template>
  <div
    class="flex size-6 items-center justify-center text-xl leading-none hocus_scale-110"
    :class="{
      '!size-10 !text-2xl': size === 'lg',
      '!size-14 !text-4xl': size === 'xl',
    }"
    :style="{ color }"
    @click="event => emit('click', event)"
  >
    <div :class="icon" />
  </div>
</template>
