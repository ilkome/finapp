<script setup lang="ts">
import type { CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  category: CategoryItem
  hasChildren?: boolean
  isHideDots?: boolean
  parentCategory?: CategoryItem

}>()
</script>

<template>
  <div class="flex gap-3 items-baseline pt-0">
    <div class="flex items-center gap-2 text-3 text-sm leading-none">
      {{ props.category?.name }}
      <!-- Has childs -->
      <div
        v-if="!props.isHideDots && props.hasChildren"
        class="leading-none text-sm text-4"
      >
        ...
      </div>
    </div>

    <!-- Parent category name -->
    <template v-if="!props.hasChildren && props.category?.parentId">
      <div class="leading-none text-2xs text-4">
        •
      </div>

      <div class="leading-none text-2xs text-4">
        {{ props.parentCategory?.name }}
      </div>
    </template>
  </div>
</template>
