<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { getPreparedFormData } from '~/components/categories/utils'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const categoriesStore = useCategoriesStore()

const categoryId = computed<CategoryId>(() => route.params.id)
const category = computed<CategoryItem>(() => categoriesStore.items[categoryId.value])
const categoryForm = ref(getPreparedFormData(category.value))

useHead({
  title: `${t('base.edit')}: ${categoryForm.value?.name || t('categories.form.name.label')}`,
})
</script>

<template>
  <UiPage
    v-if="category"
    class="flex h-full flex-col"
  >
    <UiHeader>
      <UiHeaderTitle>{{ t('base.edit') }} : {{ category.name }}</UiHeaderTitle>
    </UiHeader>

    <CategoriesForm
      :categoryId="categoryId"
      :categoryForm="categoryForm"
      @updateValue="(key: CategoryId, value: keyof CategoryItem) => categoryForm[key] = value"
      @afterSave="() => router.replace(`/categories/${categoryId}`)"
    />
  </UiPage>
</template>
