<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'

import { categoryFormSchema } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { canGoBack, navigateAfterSave } from '~/composables/useNavigationHistory'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const categoriesStore = useCategoriesStore()

const categoryId = computed<CategoryId>(() => String(route.params.id))
const category = computed(() => categoriesStore.items[categoryId.value])
const categoryForm = ref(categoryFormSchema.parse(category.value))

useHead({
  title: `${t('base.edit')}: ${categoryForm.value?.name || t('categories.form.name.label')}`,
})

function onAfterSave() {
  if (route.query.returnBack === '1' && canGoBack.value)
    router.back()
  else
    navigateAfterSave(router, `/categories/${categoryId.value}`)
}
</script>

<template>
  <UiPage
    v-if="category"
    class="flex h-full flex-col"
  >
    <UiHeader :backTo="`/categories/${categoryId}`">
      <UiHeaderTitle>{{ t('base.edit') }} : {{ category.name }}</UiHeaderTitle>
    </UiHeader>

    <CategoriesForm
      :categoryId="categoryId"
      :categoryForm="categoryForm"
      @update="(key: string, value: CategoryItem[keyof CategoryItem]) => (categoryForm as Record<string, any>)[key] = value"
      @afterSave="onAfterSave"
    />
  </UiPage>
</template>
