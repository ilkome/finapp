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
        / {{ props.parentCategory.name }}
      </template>
    </div>

    <div class="flex items-center gap-2 pb-1">
      <Icon
        :name="props.category.icon.replace('mdi mdi-', 'mdi:')"
        :color="props.category.color"
        size="22"
      />
      {{ props.category.name }}
    </div>
  </UiHeaderTitle2>
</template>
