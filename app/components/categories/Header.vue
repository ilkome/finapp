<script setup lang="ts">
import type { CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  category: CategoryItem
  parentCategory?: CategoryItem
}>()

const { t } = useI18n()
</script>

<template>
  <UiHeaderTitle class="px-3">
    <div class="text-item-2 pt-1 text-xs font-medium">
      {{ t('categories.title') }}
      <template v-if="props.parentCategory">
        / {{ props.parentCategory.name }}
      </template>
    </div>

    <div class="flex items-center gap-2 pb-1">
      <UiIconBase
        :name="props.category.icon"
        :color="props.category.color"
      />
      {{ props.category.name }}
    </div>
  </UiHeaderTitle>
</template>
