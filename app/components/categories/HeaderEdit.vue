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
      {{ props.isEdit ? `${t('base.edit')}: ${props.category.name}` : t('categories.createNewTitle') }}
    </UiHeaderTitle>
  </UiHeader>
</template>
