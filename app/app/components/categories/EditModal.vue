<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'

import { categoryFormSchema } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  categoryId?: CategoryId
}>()

const emit = defineEmits<{
  closed: []
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()

const category = computed(() =>
  props.categoryId ? categoriesStore.items[props.categoryId] : undefined,
)
const categoryForm = ref(categoryFormSchema.parse(category.value ?? {}))
</script>

<template>
  <BottomSheetModal @closed="emit('closed')">
    <template #default="{ close }">
      <UiTitleModal>
        {{ category?.name || t('categories.createNewTitle') }}
      </UiTitleModal>

      <CategoriesForm
        :categoryId="props.categoryId"
        :categoryForm="categoryForm"
        @update="(key: string, value: CategoryItem[keyof CategoryItem]) => (categoryForm as Record<string, any>)[key] = value"
        @afterSave="close"
      />
    </template>
  </BottomSheetModal>
</template>
