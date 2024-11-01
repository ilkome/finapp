<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import type { CategoryId } from '~/components/categories/types'

const { t } = useI18n()
useHead({
  title: t('categories.title'),
})
const router = useRouter()
const categoriesStore = useCategoriesStore()
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t('categories.name') }}</UiHeaderTitle>
      <template #actions>
        <UiHeaderLink @click="router.push('/categories/new')">
          <UiIconAdd class="size-5" />
        </UiHeaderLink>
      </template>
    </UiHeader>

    <div class="pageWrapper">
      <CategoriesList
        :ids="categoriesStore.categoriesRootIds"
        @click="(categoryId: CategoryId) => router.push(`/categories/${categoryId}`)"
      />

      <div
        v-if="categoriesStore.categoriesRootIds.length === 0"
        class="max-w-xs"
      >
        <UiButtonBlue
          @click="router.push('/categories/new')"
        >
          {{ t("categories.new") }}
        </UiButtonBlue>
      </div>
    </div>
  </UiPage>
</template>
