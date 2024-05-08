<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategories'
import { getStyles } from '~/components/ui/getStyles'

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
          <UiIconAdd class="h-5 w-5 group-hover_text-white" />
        </UiHeaderLink>
      </template>
    </UiHeader>

    <div class="grow px-2">
      <CategoriesList
        :ids="categoriesStore.categoriesRootIds"
        class=""
        @click="(catId) => $router.push(`/categories/${catId}`)"
      />
    </div>
  </UiPage>
</template>
