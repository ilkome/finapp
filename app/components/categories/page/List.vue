<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

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
        <UiItem3 @click="router.push('/categories/new')">
          <Icon name="lucide:plus" size="24" />
        </UiItem3>
      </template>
    </UiHeader>

    <!-- Empty -->
    <div
      v-if="categoriesStore.categoriesRootIds.length === 0"
      class="pageWrapper"
    >
      <div class="md:max-w-xs">
        <UiButtonBlue
          @click="router.push('/categories/new')"
        >
          {{ t("categories.new") }}
        </UiButtonBlue>
      </div>
    </div>

    <!-- List -->
    <div
      v-else
      class="pageWrapper"
    >
      <CategoriesList
        :ids="categoriesStore.categoriesRootIds"
        :categoriesItemProps="{
          class: 'group',
        }"
        @click="(categoryId: CategoryId) => router.push(`/categories/${categoryId}`)"
      />
    </div>
  </UiPage>
</template>
