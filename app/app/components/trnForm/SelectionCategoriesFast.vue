<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { isMenuableCategory, useCategoryMenuItems } from '~/components/categories/useCategoryMenuItems'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { showErrorToast, showSuccessToast } from '~/composables/useStoreSync'

const emit = defineEmits<{
  selectCategory: [id: CategoryId]
}>()

const { t } = useI18n()
const router = useRouter()
const categoriesStore = useCategoriesStore()
const trnsFormStore = useTrnsFormStore()
const trnsStore = useTrnsStore()

const { width } = useWindowSize()
const { pointerType } = usePointer()
const isLaptop = computed(() => width.value >= 766 && pointerType.value === 'mouse')

const editingCategoryId = ref<CategoryId | null>(null)
const isCreatingNewCategory = ref(false)
const deleteCategoryId = ref<CategoryId | null>(null)

function onClickNew() {
  if (isLaptop.value)
    router.push('/categories/new?returnBack=1')
  else
    isCreatingNewCategory.value = true
}

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

const categoryMenu = useCategoryMenuItems()

function getCategoryContextMenuItems(categoryId: CategoryId) {
  if (!isMenuableCategory(categoryId))
    return undefined
  const editOpts = isLaptop.value
    ? { returnBack: true }
    : { onEdit: (id: CategoryId) => { editingCategoryId.value = id } }
  const qt = categoryMenu.quickToggles(categoryId)
  return [
    [categoryMenu.edit(categoryId, editOpts)],
    ...(qt ? [qt] : []),
    [categoryMenu.delete(categoryId, onClickDelete)],
  ]
}

const hasFavorites = computed(() => categoriesStore.favoriteCategoriesIds.length > 0)
const hasRecent = computed(() => categoriesStore.recentCategoriesIds.length > 0)
const isShowAllCategoriesFallback = computed(() =>
  !hasFavorites.value
  && !hasRecent.value
  && categoriesStore.categoriesIdsForTrnValues.length > 0,
)
</script>

<template>
  <!-- Favorite categories -->
  <div v-if="hasFavorites">
    <UiTitleModal>
      {{ t('categories.favoriteCategories') }}
    </UiTitleModal>

    <CategoriesSelectorGrid
      :activeItemId="trnsFormStore.values.categoryId ?? undefined"

      :ids="categoriesStore.favoriteCategoriesIds"
      :getContextMenuItems="getCategoryContextMenuItems"
      :onNew="hasRecent ? undefined : onClickNew"

      class="px-3 pt-1"
      @selected="id => emit('selectCategory', id)"
    />
  </div>

  <!-- Recent categories -->
  <div v-if="hasRecent">
    <UiTitleModal>
      {{ t('categories.recentCategories') }}
    </UiTitleModal>

    <CategoriesSelectorGrid
      :activeItemId="trnsFormStore.values.categoryId ?? undefined"

      :ids="categoriesStore.recentCategoriesIds"
      :getContextMenuItems="getCategoryContextMenuItems"
      :onNew="onClickNew"

      class="px-3 pt-1"
      @selected="id => emit('selectCategory', id)"
    />
  </div>

  <!-- All categories fallback when no favorites and no recent -->
  <div v-if="isShowAllCategoriesFallback">
    <CategoriesSelectorGrid
      :activeItemId="trnsFormStore.values.categoryId ?? undefined"

      :ids="categoriesStore.categoriesIdsForTrnValues"
      :getContextMenuItems="getCategoryContextMenuItems"
      :onNew="onClickNew"

      class="px-3 pt-1"
      @selected="id => emit('selectCategory', id)"
    />
  </div>

  <CategoriesEditModal
    v-if="(editingCategoryId || isCreatingNewCategory) && !isLaptop"
    :categoryId="editingCategoryId ?? undefined"
    @closed="editingCategoryId = null; isCreatingNewCategory = false"
  />

  <LayoutConfirmModal
    v-if="deleteCategoryId"
    :title="t('categories.form.delete.title')"
    :description="deleteDescText"
    :highlight="deleteHighlight"
    @closed="deleteCategoryId = null"
    @confirm="onDeleteConfirm"
  />
</template>
