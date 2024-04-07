<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategories'

const { t } = useI18n()
useHead({
  title: t('categories.title'),
})

const categoriesStore = useCategoriesStore()
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ $t("categories.name") }}</UiHeaderTitle>
      <template #actions>
        <UiHeaderLink @click="$router.push('/categories/new')">
          <UiIconAdd class="h-5 w-5 group-hover_text-white" />
        </UiHeaderLink>
      </template>
    </UiHeader>

    <!-- List -->
    <div class="px-2 pb-12 pt-1 sm_max-w-xs">
      <CategoriesList
        :ids="categoriesStore.categoriesRootIds"
        @click="(catId) => $router.push(`/categories/${catId}`)"
      />
    </div>
  </UiPage>
</template>
