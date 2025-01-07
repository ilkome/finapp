<script setup lang="ts">
import type { CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  category: CategoryItem
  parentCategory?: CategoryItem
}>()
</script>

<template>
  <UiHeaderTitle>
    <div class="flex items-center gap-2">
      <div class="@lg:text-xl text-lg font-semibold">
        {{ props.category.name }}
      </div>

      <div
        v-if="props.parentCategory"
        class="@lg:text-base flex items-center gap-2 pt-[3px] text-xs font-medium leading-none text-item-2"
      >
        <div class="text-2xs text-4">
          •
        </div>
        {{ props.parentCategory.name }}
      </div>
    </div>
  </UiHeaderTitle>
</template>
