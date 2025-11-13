<script setup lang="ts">
import { cn } from '~~/lib/cn'

import type { CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  alt?: boolean
  category: CategoryItem
  hasChildren?: boolean
  isShowDots?: boolean
  isShowParent?: boolean
  parentCategory?: CategoryItem
  showChildrenCount?: number
}>()
</script>

<template>
  <div :class="cn('flex gap-3 items-baseline pt-0', { 'flex-col !gap-0.5': props.alt })">
    <!-- Parent category name -->
    <template v-if="alt && isShowParent && !props.hasChildren && props.category?.parentId">
      <div class="text-2xs text-4 leading-none">
        {{ props.parentCategory?.name }}
      </div>
    </template>

    <!-- Base name -->
    <div class="text-toned flex items-center gap-2 text-sm leading-none font-medium tracking-wide text-nowrap">
      {{ props.category?.name }}
      <!-- Has childs -->
      <div
        v-if="props.isShowDots && props.hasChildren"
        class="text-4 text-xs leading-none"
      >
        ...
      </div>

      <div
        v-if="showChildrenCount && showChildrenCount > 0"
        class="text-4"
      >
        {{ showChildrenCount }}
      </div>
    </div>

    <!-- Parent category name -->
    <template v-if="!alt && isShowParent && !props.hasChildren && props.category?.parentId">
      <div class="text-2xs text-4 leading-none text-nowrap">
        •
      </div>

      <div class="text-2xs text-4 leading-none">
        {{ props.parentCategory?.name }}
      </div>
    </template>
  </div>
</template>
