<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'

defineProps<{
  categoryId: CategoryId
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
    class="flex size-8 items-center justify-center rounded-md _bg-item-5 text-xl leading-none hocus_scale-110 group-hocus_bg-item-6"
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
