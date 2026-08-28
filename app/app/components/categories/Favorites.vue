<script setup lang="ts">
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

const hasFavorites = computed(() => categoriesStore.favoriteCategoriesIds.length > 0)
const hasRecent = computed(() => categoriesStore.recentCategoriesIds.length > 0)
const showFallbackGrid = computed(() =>
  props.showFallback
  && !hasFavorites.value
  && !hasRecent.value
  && categoriesStore.categoriesIdsForTrnValues.length > 0,
)
</script>

<template>
  <div>
    <!-- Favorite categories -->
    <div v-if="hasFavorites">
      <UiTitleModal>
        {{ t('categories.favoriteCategories') }}
      </UiTitleModal>

      <CategoriesSelectorGrid
        :activeItemId="props.activeItemId"
        :getContextMenuItems="getCategoryContextMenuItems"
        :ids="categoriesStore.favoriteCategoriesIds"
        :onNew="hasRecent ? undefined : onClickNew"
        :selectedIds="props.selectedIds"
        class="px-3 pt-1"
        @selected="id => emit('selected', id)"
      />
    </div>

    <!-- Recent categories -->
    <div v-if="hasRecent">
      <UiTitleModal>
        {{ t('categories.recentCategories') }}
      </UiTitleModal>

      <CategoriesSelectorGrid
        :activeItemId="props.activeItemId"
        :getContextMenuItems="getCategoryContextMenuItems"
        :ids="categoriesStore.recentCategoriesIds"
        :onNew="onClickNew"
        :selectedIds="props.selectedIds"
        class="px-3 pt-1"
        @selected="id => emit('selected', id)"
      />
    </div>

    <!-- All categories fallback when no favorites and no recent -->
    <div v-if="showFallbackGrid">
      <CategoriesSelectorGrid
        :activeItemId="props.activeItemId"
        :getContextMenuItems="getCategoryContextMenuItems"
        :ids="categoriesStore.categoriesIdsForTrnValues"
        :onNew="onClickNew"
        :selectedIds="props.selectedIds"
        class="px-3 pt-1"
        @selected="id => emit('selected', id)"
      />
    </div>

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
