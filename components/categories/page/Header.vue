<script setup lang="ts">
import type { CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  category: CategoryItem
  parentCategory?: CategoryItem
}>()
</script>

<template>
  <UiHeaderTitle2>
    <div class="pt-1 text-xs font-medium text-item-2">
      {{ $t("categories.title") }}
      <template v-if="props.parentCategory">
        | | • {{ props.parentCategory.name }}
      </template>
    </div>
    <div class="flex items-center gap-4 pb-1">
      {{ props.category.name }}

      <div
        class="flex-center h-8 w-8 rounded-full text-xl text-icon-primary"
        :style="{ background: props.category.color }"
      >
        <div :class="props.category.icon" />
      </div>
    </div>
  </UiHeaderTitle2>
</template>
