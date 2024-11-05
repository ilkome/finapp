<script setup lang="ts">
import type { CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  category: CategoryItem
  parentCategory?: CategoryItem
}>()

const { t } = useI18n()
</script>

<template>
  <UiHeaderTitle class="grid gap-2 px-3">
    <div class="text-item-2 flex items-center gap-2 pt-1 text-xs font-medium leading-none">
      {{ t('categories.title') }}

      <template v-if="props.parentCategory">
        <div class="text-2xs text-4">
          •
        </div>
        {{ props.parentCategory.name }}
      </template>
    </div>

    <div class="flex items-center gap-2 pb-1">
      <UiIconBase
        :name="props.category.icon"
        invert
        :color="props.category.color"
      />
      <div class="text-xl">
        {{ props.category.name }}
      </div>
    </div>
  </UiHeaderTitle>
</template>
