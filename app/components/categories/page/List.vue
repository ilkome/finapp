<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategories'
import type { CategoryId } from '~/components/categories/types'

const { t } = useI18n()
useHead({
  title: t('categories.title'),
})

const categoriesStore = useCategoriesStore()
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle2>{{ $t("categories.name") }}</UiHeaderTitle2>
      <template #actions>
        <UiHeaderLink @click="$router.push('/categories/new')">
          <UiIconAdd class="size-5" />
        </UiHeaderLink>
      </template>
    </UiHeader>

    <div class="px-2 md:px-6 grow">
      <CategoriesList
        :ids="categoriesStore.categoriesRootIds"
        class=""
        @click="(categoryId: CategoryId) => $router.push(`/categories/${categoryId}`)"
      />
    </div>
  </UiPage>
</template>
