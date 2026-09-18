<script setup lang="ts">
import type { FavoritesSection } from '~/components/categories/FavoritesView.vue'
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCategoryDelete } from '~/components/categories/useCategoryDelete'
import { isMenuableCategory, useCategoryMenuItems } from '~/components/categories/useCategoryMenuItems'

const props = defineProps<{
  // Single-select highlight (trn form) or multi-select set (stat filter); the
  // grid renders whichever is passed.
  activeItemId?: CategoryId
  selectedIds?: CategoryId[]
  // Show all categories when there are no favorites and no recent (trn form,
  // which has no full tree underneath).
  showFallback?: boolean
}>()

const emit = defineEmits<{
  selected: [id: CategoryId]
}>()

const { t } = useI18n()
const router = useRouter()
const categoriesStore = useCategoriesStore()

const isLaptop = useIsLaptop()

const editingCategoryId = ref<CategoryId | null>(null)
const isCreatingNewCategory = ref(false)

const {
  cancelDelete,
  confirmDelete,
  deleteCategoryId,
  deleteInfo,
  requestDelete,
} = useCategoryDelete()

function onClickNew() {
  if (isLaptop.value)
    router.push('/categories/new?returnBack=1')
  else
    isCreatingNewCategory.value = true
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
    [categoryMenu.delete(categoryId, requestDelete)],
  ]
}

function toItems(ids: CategoryId[]) {
  return ids.map((categoryId) => {
    const category = categoriesStore.items[categoryId]!
    return {
      category,
      categoryId,
      childrenCount: categoriesStore.getChildrenIds(categoryId).length,
      contextMenuItems: getCategoryContextMenuItems(categoryId),
      parentCategory: categoriesStore.items[category?.parentId],
    }
  })
}

const sections = computed<FavoritesSection[]>(() => {
  const favorites = categoriesStore.favoriteCategoriesIds
  const recent = categoriesStore.recentCategoriesIds
  const result: FavoritesSection[] = []

  if (favorites.length) {
    result.push({
      // The new-category button lives on the last grid only.
      isShowNew: recent.length === 0,
      items: toItems(favorites),
      key: 'favorites',
      title: t('categories.favoriteCategories'),
    })
  }

  if (recent.length)
    result.push({ isShowNew: true, items: toItems(recent), key: 'recent', title: t('categories.recentCategories') })

  if (!result.length && props.showFallback && categoriesStore.categoriesIdsForTrnValues.length)
    result.push({ isShowNew: true, items: toItems(categoriesStore.categoriesIdsForTrnValues), key: 'all' })

  return result
})
</script>

<template>
  <div>
    <CategoriesFavoritesView
      :activeItemId="props.activeItemId"
      :sections
      :selectedIds="props.selectedIds"
      @new="onClickNew"
      @selected="id => emit('selected', id)"
    />

    <CategoriesEditModal
      v-if="(editingCategoryId || isCreatingNewCategory) && !isLaptop"
      :categoryId="editingCategoryId ?? undefined"
      @closed="editingCategoryId = null; isCreatingNewCategory = false"
    />

    <LayoutConfirmModal
      v-if="deleteCategoryId"
      :description="deleteInfo.descText"
      :highlight="deleteInfo.highlight"
      :title="t('categories.form.delete.title')"
      @closed="cancelDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>
