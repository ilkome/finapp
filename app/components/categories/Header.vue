<script setup lang="ts">
import type { CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  category: CategoryItem
  parentCategory?: CategoryItem
}>()
</script>

<template>
  <UiHeaderTitle class="grid min-h-[30px] gap-2 !py-0 pl-1 pr-2">
    <div class="flex items-center gap-2">
      <div class="text-lg font-semibold">
        {{ props.category.name }}
      </div>

      <div
        v-if="props.parentCategory"
        class="text-item-2 flex items-center gap-2 pt-[2px] text-xs font-medium leading-none"
      >
        <div class="text-2xs text-4">
          •
        </div>
        {{ props.parentCategory.name }}
      </div>
    </div>
  </UiHeaderTitle>
</template>
