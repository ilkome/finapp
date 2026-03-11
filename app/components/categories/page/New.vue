<script setup lang="ts">
import type { CategoryItem } from '~/components/categories/types'

import { categoryFormSchema } from '~/components/categories/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const categoryForm = ref(categoryFormSchema.parse({}))

const isOnboarding = computed(() => 'onboarding' in route.query)

useHead({
  title: `${t('base.add')}: ${categoryForm.value.name ? categoryForm.value.name : t('categories.form.name.label')}`,
})
</script>

<template>
  <UiPage class="flex h-full flex-col">
    <h1
      v-if="isOnboarding"
      class="pt-2 pb-6 text-center text-2xl font-bold"
    >
      {{ t('categories.createNewTitle') }}
    </h1>

    <UiHeader v-else>
      <UiHeaderTitle>
        {{ t('categories.createNewTitle') }}
      </UiHeaderTitle>
    </UiHeader>

    <CategoriesForm
      :categoryForm="categoryForm"
      @update="(key: string, value: CategoryItem[keyof CategoryItem]) => (categoryForm as Record<string, any>)[key] = value"
      @afterSave="() => router.replace('/dashboard')"
    />
  </UiPage>
</template>
