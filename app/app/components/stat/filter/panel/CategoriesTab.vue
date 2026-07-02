<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCategoryDelete } from '~/components/categories/useCategoryDelete'
import { isMenuableCategory, useCategoryMenuItems } from '~/components/categories/useCategoryMenuItems'

const props = defineProps<{
  selectedIds: CategoryId[]
}>()

const emit = defineEmits<{
  removeCategories: [ids: CategoryId[]]
  selected: [id: CategoryId]
  setCategories: [ids: CategoryId[]]
}>()

const { t } = useI18n()
const router = useRouter()
const categoriesStore = useCategoriesStore()

const { width } = useWindowSize()
const { pointerType } = usePointer()
const isLaptop = computed(() => width.value >= 766 && pointerType.value === 'mouse')

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
</script>

<template>
  <div class="scrollerBlock h-full overflow-y-auto pb-2">
    <div v-if="hasFavorites">
      <UiTitleModal>
        {{ t('categories.favoriteCategories') }}
      </UiTitleModal>

      <CategoriesSelectorGrid
        :getContextMenuItems="getCategoryContextMenuItems"
        :ids="categoriesStore.favoriteCategoriesIds"
        :selectedIds="props.selectedIds"
        class="px-3 pt-1"
        @selected="id => emit('selected', id)"
      />
    </div>

    <div v-if="hasRecent">
      <UiTitleModal>
        {{ t('categories.recentCategories') }}
      </UiTitleModal>

      <CategoriesSelectorGrid
        :getContextMenuItems="getCategoryContextMenuItems"
        :ids="categoriesStore.recentCategoriesIds"
        :selectedIds="props.selectedIds"
        class="px-3 pt-1"
        @selected="id => emit('selected', id)"
      />
    </div>

    <div class="flex items-center justify-between pr-2">
      <UiTitleModal>
        {{ t('categories.title') }}
      </UiTitleModal>

      <UiActionButton
        :ariaLabel="t('categories.new')"
        @click="onClickNew"
      >
        <Icon name="lucide:plus" size="20" />
      </UiActionButton>
    </div>

    <CategoriesSelectorTree
      :selectedIds="props.selectedIds"
      embedded
      hideSearch
      @removeCategories="ids => emit('removeCategories', ids)"
      @selected="id => emit('selected', id)"
      @setCategories="ids => emit('setCategories', ids)"
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
