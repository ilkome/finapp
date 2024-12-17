<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { getPreparedFormData } from '~/components/categories/getForm'

const { t } = useI18n()
const router = useRouter()

const categoryForm = ref(getPreparedFormData())

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
    <UiHeader>
      <UiHeaderTitle>
        {{ t('categories.createNewTitle') }}
      </UiHeaderTitle>
    </UiHeader>

    <CategoriesForm
      :categoryForm="categoryForm"
      @updateValue="updateValue"
      @afterSave="afterSave"
    />
  </UiPage>
</template>
