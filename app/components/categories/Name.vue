<script setup lang="ts">
import { cn } from '~~/lib/cn'
import type { CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  alt?: boolean
  category: CategoryItem
  hasChildren?: boolean
  isHideDots?: boolean
  isHideParent?: boolean
  parentCategory?: CategoryItem
}>()
</script>

<template>
  <div
    :class="cn('flex gap-3 items-baseline pt-0', { 'flex-col !gap-0.5': props.alt })"
  >
    <!-- Parent category name -->
    <template v-if="alt && !isHideParent && !props.hasChildren && props.category?.parentId">
      <div class="leading-none text-2xs text-4">
        {{ props.parentCategory?.name }}
      </div>
    </template>

    <!-- Base name -->
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
    <template v-if="!alt && !isHideParent && !props.hasChildren && props.category?.parentId">
      <div class="leading-none text-2xs text-4">
        •
      </div>

      <div class="leading-none text-2xs text-4">
        {{ props.parentCategory?.name }}
      </div>
    </template>
  </div>
</template>
