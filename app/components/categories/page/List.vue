<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCategoryContextMenu } from '~/components/categories/useCategoryContextMenu'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { showErrorToast, showSuccessToast } from '~/composables/useStoreSync'

const { t } = useI18n()
const router = useRouter()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

useHead({ title: t('categories.title') })

const categoriesView = useStorage<'list' | 'grid'>('finapp.categoriesView', 'list', localStorage, {
  mergeDefaults: true,
})

const deleteCategoryId = ref<CategoryId | null>(null)

const deleteTrnsCount = computed(() => {
  if (!deleteCategoryId.value)
    return 0
  return trnsStore.getStoreTrnsIds({
    categoriesIds: categoriesStore.getChildrenIdsOrParent(deleteCategoryId.value),
  }).length
})

const deleteDescText = computed(() =>
  deleteTrnsCount.value > 0 ? t('categories.form.delete.alertWithTrns') : undefined,
)

const deleteHighlight = computed(() =>
  deleteTrnsCount.value > 0 ? t('trns.plural', deleteTrnsCount.value) : undefined,
)

function onClickDelete(categoryId: CategoryId) {
  for (const id of Object.keys(categoriesStore.items)) {
    if (categoriesStore.items[id]?.parentId === categoryId) {
      showErrorToast('categories.form.delete.errorChildren')
      return
    }
  }
  deleteCategoryId.value = categoryId
}

async function onDeleteConfirm() {
  if (!deleteCategoryId.value)
    return

  const categoryId = deleteCategoryId.value
  const trnsIds = [...trnsStore.getStoreTrnsIds({
    categoriesIds: categoriesStore.getChildrenIdsOrParent(categoryId),
  })]

  deleteCategoryId.value = null
  await categoriesStore.deleteCategory(categoryId, trnsIds)

  setTimeout(() => {
    showSuccessToast(trnsIds.length > 0
      ? 'categories.form.delete.okWithTrns'
      : 'categories.form.delete.okWithoutTrns', trnsIds.length > 0
      ? { length: trnsIds.length, trns: t('trns.plural', trnsIds.length) }
      : undefined)
  }, 300)
}

const { getCategoryContextMenuItems } = useCategoryContextMenu({
  onDelete: categoryId => onClickDelete(categoryId),
})
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t('categories.name') }}</UiHeaderTitle>
      <template #actions>
        <UiActionButton :ariaLabel="$t('base.toggleView')" @click="categoriesView = categoriesView === 'list' ? 'grid' : 'list'">
          <Icon
            :name="categoriesView === 'list' ? 'lucide:layout-grid' : 'lucide:list'"
            size="20"
          />
        </UiActionButton>

        <UiActionButton :ariaLabel="$t('categories.new')" @click="router.push('/categories/new')">
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
        :getContextMenuItems="getCategoryContextMenuItems"
        :insideClasses="categoriesView === 'grid' ? 'bg-item-2' : ''"
        @click="(categoryId: CategoryId) => router.push(`/categories/${categoryId}`)"
      />
    </div>

    <LayoutConfirmModal
      v-if="deleteCategoryId"
      :title="t('categories.form.delete.title')"
      :description="deleteDescText"
      :highlight="deleteHighlight"
      @closed="deleteCategoryId = null"
      @confirm="onDeleteConfirm"
    />
  </UiPage>
</template>
