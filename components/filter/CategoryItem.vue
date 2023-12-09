<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

defineProps<{
  categoryId: CategoryId
}>()

const emit = defineEmits<{
  (e: 'click', categoryId: CategoryId): void
}>()
</script>

<template lang="pug">
FilterItemBg(
  @click="emit('click', categoryId)"
)
  .text-2xl(
    :style="{ color: $store.state.categories.items[categoryId].color }"
    :class="$store.state.categories.items[categoryId].icon"
  )
  div
    .text-2xs(v-if="$store.state.categories.items[categoryId].parentId").
      {{ $store.state.categories.items[$store.state.categories.items[categoryId].parentId].name }}
    .text-sm.leading-none.
      {{ $store.state.categories.items[categoryId].name }}
</template>
