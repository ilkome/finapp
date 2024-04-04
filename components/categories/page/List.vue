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
    <div class="px-2 pb-12 pt-1 max-w-xs">
      <CategoriesList
        :ids="categoriesStore.categoriesRootIds"
        @click="(catId) => $router.push(`/categories/${catId}`)"
      />
    </div>

    <template #bottom>
      <div class="flex justify-evenly gap-6 px-2 pb-4">
        <!-- Create -->
        <div
          class="flex-center max-w-[280px] grow basis-1/2 rounded-full bg-item-4 px-5 py-3 text-sm hocus_bg-item-5"
          @click="$router.push('/categories/new')"
        >
          {{ $t("categories.new") }}
        </div>
      </div>
    </template>
  </UiPage>
</template>
