<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'

defineProps<{
  categoryId: CategoryId
  color: CategoryItem['color']
  icon: CategoryItem['icon']
}>()

const emit = defineEmits<{
  click: [e: CategoryId]
}>()
</script>

<template>
  <div
    class="flex size-8 items-center justify-center rounded-full bg-item-5 text-xl leading-none hocus_scale-110 group-hocus_bg-item-6"
    :style="{ color }"
    @click.stop="() => emit('click', categoryId)"
  >
    <div :class="icon" />
  </div>
</template>
