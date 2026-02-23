<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const { t } = useI18n()
const router = useRouter()
const categoriesStore = useCategoriesStore()

useHead({ title: t('categories.title') })

const categoriesView = useStorage<'list' | 'grid'>('finapp.categoriesView', 'list', localStorage, {
  mergeDefaults: true,
})
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t('categories.name') }}</UiHeaderTitle>
      <template #actions>
        <UiActionButton @click="categoriesView = categoriesView === 'list' ? 'grid' : 'list'">
          <Icon
            :name="categoriesView === 'list' ? 'lucide:layout-grid' : 'lucide:list'"
            size="20"
          />
        </UiActionButton>

        <UiActionButton @click="router.push('/categories/new')">
          <Icon name="lucide:plus" size="24" />
        </UiActionButton>
      </template>
    </UiHeader>

    <!-- Empty -->
    <div
      v-if="categoriesStore.categoriesRootIds.length === 0"
      class="flex-center grow flex-col"
    >
      <UiTitleSection class="pb-4">
        {{ t('categories.new') }}
      </UiTitleSection>
      <UiButtonAccent
        rounded
        @click="router.push('/categories/new')"
      >
        {{ t('categories.new') }}
      </UiButtonAccent>
    </div>

    <!-- List -->
    <div
      v-else
      class="max-w-4xl grow px-2 lg:px-4 2xl:px-8"
    >
      <CategoriesList
        :ids="categoriesStore.categoriesRootIds"
        :categoriesItemProps="{
          class: 'group',
          lineWidth: categoriesView === 'list' ? 1 : 0,
        }"
        :class="{
          'grid gap-1.5 @sm:grid-cols-2 @2xl/page:grid-cols-3': categoriesView === 'grid',
        }"
        :insideClasses="categoriesView === 'grid' ? 'bg-item-2' : ''"
        @click="(categoryId: CategoryId) => router.push(`/categories/${categoryId}`)"
      />
    </div>
  </UiPage>
</template>
