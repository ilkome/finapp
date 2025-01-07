<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'

import { getPreparedFormData } from '~/components/categories/getForm'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const categoriesStore = useCategoriesStore()

const categoryId = computed<CategoryId>(() => route.params.id)
const category = computed<CategoryItem>(() => categoriesStore.items[categoryId.value])
const categoryForm = ref(getPreparedFormData(category.value))

function updateValue(id: CategoryId, value: any) {
  categoryForm.value[id] = value
}

function afterSave() {
  return router.replace(`/categories/${categoryId.value}`)
}

useHead({
  title: `${t('base.edit')}: ${categoryForm.value?.name ? categoryForm.value?.name : t('categories.form.name.label')}`,
})
</script>

<template>
  <UiPage
    v-if="category"
    class="flex h-full flex-col"
  >
    <UiHeader>
      <UiHeaderTitle>
        {{ t('base.edit') }} : {{ category.name }}
      </UiHeaderTitle>
    </UiHeader>

    <CategoriesForm
      :categoryId="categoryId"
      :categoryForm="categoryForm"
      @updateValue="updateValue"
      @afterSave="afterSave"
    />
  </UiPage>
</template>
