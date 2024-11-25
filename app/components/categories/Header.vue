<script setup lang="ts">
import type { CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  category: CategoryItem
  parentCategory?: CategoryItem
}>()
</script>

<template>
  <UiHeaderTitle class="grid gap-2 px-2">
    <div class="flex items-center gap-2">
      <UiIconBase
        :name="props.category.icon"
        :color="props.category.color"
        invert
      />
      <div class="text-xl font-semibold">
        {{ props.category.name }}
      </div>

      <div
        v-if="props.parentCategory"
        class="text-item-2 flex items-center gap-2 pt-1 text-xs font-medium leading-none"
      >
        <div class="text-2xs text-4">
          •
        </div>
        {{ props.parentCategory.name }}
      </div>
    </div>
  </UiHeaderTitle>
</template>
