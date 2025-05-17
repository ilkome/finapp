<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'

import { getPreparedFormData } from '~/components/categories/utils'

const { t } = useI18n()
const router = useRouter()
const categoryForm = ref(getPreparedFormData())

useHead({
  title: `${t('base.add')}: ${categoryForm.value.name ? categoryForm.value.name : t('categories.form.name.label')}`,
})
</script>

<template>
  <UiPage class="flex h-full flex-col">
    <UiHeader>
      <UiHeaderTitle>{{ t('categories.createNewTitle') }}</UiHeaderTitle>
    </UiHeader>

    <CategoriesForm
      :categoryForm="categoryForm"
      @updateValue="(key: CategoryId, value: keyof CategoryItem) => categoryForm[key] = value"
      @afterSave="() => router.replace('/categories')"
    />
  </UiPage>
</template>
