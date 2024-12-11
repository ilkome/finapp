<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  category: CategoryItem
  categoryId?: CategoryId
  isEdit?: boolean
  parentCategory?: CategoryItem | false
}>()

const { t } = useI18n()
</script>

<template>
  <UiHeader>
    <UiHeaderTitle>
      <div class="text-item-2 pb-1 text-xs font-medium">
        {{ props.isEdit ? t('base.edit') : t('categories.createNewTitle') }}
        <template v-if="props.parentCategory">
          {{ t('common.in') }} {{ props.parentCategory.name }}
        </template>
      </div>

      <div class="flex items-center gap-4 pb-1">
        <UiIconBase
          :color="props.category.color"
          :name="category.icon"
          invert
        />
        <div class="text-item-1 text-2xl font-semibold">
          {{ props.category.name ? props.category.name : t("categories.form.name.label") }}
        </div>
      </div>
    </UiHeaderTitle>

    <template v-if="props.categoryId" #actions>
      <CategoriesDelete :categoryId="props.categoryId" />
    </template>
  </UiHeader>
</template>
