<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { TrnTypeWithLook } from '~/components/categories/useCategoriesStore'

import { categoryFormSchema } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { canGoBack, navigateAfterSave } from '~/composables/useNavigationHistory'

const { t } = useI18n()
const router = useRouter()
const route = useRoute('categories-id-edit')
const categoriesStore = useCategoriesStore()

const categoryId = computed<CategoryId>(() => route.params.id)
// A transfer or an adjustment has no category row: its editable look comes from the type looks.
const category = computed(() => categoriesStore.items[categoryId.value]
  ?? categoriesStore.trnTypeLooks[categoryId.value as TrnTypeWithLook])
// On a hard navigation the store hydrates from PowerSync after setup, so
// `category` is undefined initially - parse `?? {}` to avoid throwing, then
// re-seed the form once the category arrives (the template gates on `category`).
const categoryForm = ref(categoryFormSchema.parse(category.value ?? {}))

watch(category, (cat) => {
  if (cat)
    categoryForm.value = categoryFormSchema.parse(cat)
}, { immediate: true })

useHead({
  title: computed(() => `${t('base.edit')}: ${categoryForm.value?.name || t('categories.form.name.label')}`),
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
