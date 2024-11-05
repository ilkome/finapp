<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { getPreparedFormData } from '~/components/categories/getForm'
import { getParentCategory } from '~/components/categories/getCategories'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const { t } = useI18n()
const router = useRouter()
const categoriesStore = useCategoriesStore()

const categoryForm = ref(getPreparedFormData())
const parentCategory = computed(() => getParentCategory(categoriesStore.items, categoryForm.value.parentId))

function updateValue(id: CategoryId, value: unknown) {
  return categoryForm.value[id] = value
}

function afterSave() {
  return router.replace('/categories/')
}

useHead({
  title: `${t('base.add')}: ${categoryForm.value.name ? categoryForm.value.name : t('categories.form.name.label')}`,
})
</script>

<template>
  <UiPage class="flex h-full flex-col">
    <CategoriesHeaderEdit
      :category="categoryForm"
      :parentCategory="parentCategory"
    />

    <CategoriesForm
      :categoryForm="categoryForm"
      @updateValue="updateValue"
      @afterSave="afterSave"
    />
  </UiPage>
</template>
