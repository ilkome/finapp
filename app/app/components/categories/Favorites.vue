<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { FavoritesSection } from '~/components/categories/FavoritesView.vue'
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCategoryDelete } from '~/components/categories/useCategoryDelete'
import { useCategoryMenuItems } from '~/components/categories/useCategoryMenuItems'
import { useCategoriesViewSettings } from '~/composables/useCategoriesViewSettings'

const props = defineProps<{
  // Single-select highlight (trn form) or multi-select set (stat filter); the
  // grid renders whichever is passed.
  activeItemId?: CategoryId
  isCollapsible?: boolean
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
// The quick grid follows the form sheets' view settings.
const { backgroundType, isRoundIcon } = useCategoriesViewSettings('form')
// The quick grid folds its sections on its own, apart from the form sheets' blocks.
const blocksOpen = useStorage<Record<string, boolean>>('finapp.categoriesQuickOpen', {}, localStorage, { mergeDefaults: true })
const collapsedKeys = computed(() => Object.keys(blocksOpen.value).filter(key => blocksOpen.value[key] === false))

const editingCategoryId = ref<CategoryId | null>(null)
const isCreatingNewCategory = ref(false)

const { requestDelete } = useCategoryDelete()

function onClickNew() {
  if (isLaptop.value)
    router.push('/categories/new?returnBack=1')
  else
    isCreatingNewCategory.value = true
}

const categoryMenu = useCategoryMenuItems()

function getCategoryContextMenuItems(categoryId: CategoryId) {
  const editOpts = isLaptop.value
    ? { returnBack: true }
    : { onEdit: (id: CategoryId) => { editingCategoryId.value = id } }
  const qt = categoryMenu.quickToggles(categoryId)
  return [
    [categoryMenu.edit(categoryId, editOpts)],
    ...(qt ? [qt] : []),
    ...[categoryMenu.delete(categoryId, requestDelete)].filter(group => group.length),
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
      // The new-category button lives on the last grid only, and on touch: a laptop adds from the categories page.
      isShowNew: recent.length === 0 && !isLaptop.value,
      items: toItems(favorites),
      key: 'favorites',
      title: t('categories.favoriteCategories'),
    })
  }

  if (recent.length)
    result.push({ isShowNew: !isLaptop.value, items: toItems(recent), key: 'recent', title: t('categories.recentCategories') })

  if (!result.length && props.showFallback && categoriesStore.categoriesIdsForTrnValues.length)
    result.push({ isShowNew: !isLaptop.value, items: toItems(categoriesStore.categoriesIdsForTrnValues), key: 'all' })

  return result
})
</script>

<template>
  <div>
    <CategoriesFavoritesView
      :activeItemId="props.activeItemId"
      :backgroundType
      :collapsedKeys
      :isCollapsible="props.isCollapsible"
      :isRoundIcon
      :sections
      :selectedIds="props.selectedIds"
      @new="onClickNew"
      @selected="id => emit('selected', id)"
      @toggle="key => blocksOpen[key] = blocksOpen[key] === false"
    />

    <CategoriesEditModal
      v-if="(editingCategoryId || isCreatingNewCategory) && !isLaptop"
      :categoryId="editingCategoryId ?? undefined"
      @closed="editingCategoryId = null; isCreatingNewCategory = false"
    />
  </div>
</template>
