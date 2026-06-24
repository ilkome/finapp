<script setup lang="ts">
import { useStorage, useWindowSize } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'

import { useCategoriesExpanded } from '~/components/categories/useCategoriesExpanded'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { isMenuableCategory, useCategoryMenuItems } from '~/components/categories/useCategoryMenuItems'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { showErrorToast, showSuccessToast } from '~/composables/useStoreSync'

type CategoryFilter = 'all' | 'favorites'

const props = defineProps<{
  activeItemId?: CategoryId
  hide?: () => void
  // Budgets aggregate a category's whole subtree, so they need to pick a parent itself - not just
  // a leaf. When set, each expanded parent offers an explicit "whole category" row.
  selectableParents?: boolean
}>()

const emit = defineEmits<{
  selected: [id: CategoryId]
}>()

const { t } = useI18n()
const router = useRouter()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

const { width } = useWindowSize()
const { pointerType } = usePointer()
const isLaptop = computed(() => width.value >= 766 && pointerType.value === 'mouse')

const search = ref('')
const searchInput = useTemplateRef<HTMLInputElement>('searchInput')

const filter = useStorage<CategoryFilter>('finapp-categories-selector-filter', 'all')
const view = useStorage<'list' | 'grid'>('finapp.categoriesSelectorView', 'list')

const editingCategoryId = ref<CategoryId | null>(null)
const isCreatingNewCategory = ref(false)
const deleteCategoryId = ref<CategoryId | null>(null)

const hasFavorites = computed(() => categoriesStore.favoriteCategoriesIds.length > 0)
const hasRecent = computed(() => categoriesStore.recentCategoriesIds.length > 0)
const hasFavoritesOrRecent = computed(() => hasFavorites.value || hasRecent.value)

watch(hasFavoritesOrRecent, (any) => {
  if (!any && filter.value !== 'all')
    filter.value = 'all'
}, { immediate: true })

function toggleFavoritesFilter() {
  filter.value = filter.value === 'favorites' ? 'all' : 'favorites'
}

const allRootIds = computed<CategoryId[]>(() => {
  const items = categoriesStore.items
  const ids = [...categoriesStore.categoriesRootIds]
  if (items.adjustment)
    ids.push('adjustment')
  return ids.sort((a, b) =>
    (items[a]?.name ?? '').localeCompare(items[b]?.name ?? ''),
  )
})

const {
  folderIcon,
  isExpanded,
  toggle,
  toggleAll,
} = useCategoriesExpanded('categoriesSelector', allRootIds)

function nameMatches(id: CategoryId, q: string) {
  const cat = categoriesStore.items[id]
  if (!cat)
    return false
  return cat.name.toLowerCase().includes(q)
}

const searchQuery = computed(() => search.value.trim().toLowerCase())

const filteredAllRootIds = computed<CategoryId[]>(() => {
  const q = searchQuery.value
  if (!q)
    return allRootIds.value
  return allRootIds.value.filter((rootId) => {
    if (nameMatches(rootId, q))
      return true
    return categoriesStore.getChildrenIds(rootId).some(cid => nameMatches(cid, q))
  })
})

function visibleChildrenIds(rootId: CategoryId): CategoryId[] {
  const all = categoriesStore.getChildrenIds(rootId)
  const q = searchQuery.value
  if (!q)
    return all
  if (nameMatches(rootId, q))
    return all
  return all.filter(cid => nameMatches(cid, q))
}

function isRootExpanded(rootId: CategoryId) {
  if (searchQuery.value)
    return visibleChildrenIds(rootId).length > 0
  return isExpanded(rootId)
}

const filteredFavorites = computed<CategoryId[]>(() => {
  const q = searchQuery.value
  if (!q)
    return categoriesStore.favoriteCategoriesIds
  return categoriesStore.favoriteCategoriesIds.filter(id => nameMatches(id, q))
})

const filteredRecent = computed<CategoryId[]>(() => {
  const q = searchQuery.value
  if (!q)
    return categoriesStore.recentCategoriesIds
  return categoriesStore.recentCategoriesIds.filter(id => nameMatches(id, q))
})

const hasNoMatches = computed(() => {
  if (!searchQuery.value)
    return false
  if (filter.value === 'all')
    return filteredAllRootIds.value.length === 0
  return filteredFavorites.value.length === 0 && filteredRecent.value.length === 0
})

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

function onSelect(id: CategoryId) {
  emit('selected', id)
  props.hide?.()
}

function onRootClick(rootId: CategoryId) {
  if (!categoriesStore.hasChildren(rootId)) {
    onSelect(rootId)
    return
  }
  toggle(rootId)
}

onMounted(async () => {
  await nextTick()
  searchInput.value?.focus()
})
</script>

<template>
  <div class="relative flex h-full min-h-0 flex-col overflow-hidden">
    <div class="bg-default sticky top-0 z-20 flex items-center gap-2 px-3 py-2">
      <input
        ref="searchInput"
        v-model="search"
        type="text"
        class="bg-elevated/30 placeholder:text-muted hover:bg-elevated/50 focus:border-primary focus:bg-elevated/50 m-0 min-h-[42px] w-0 min-w-0 flex-1 rounded-md border border-transparent px-4 py-2 text-base font-normal outline-none"
        :placeholder="t('categories.search.placeholder')"
      >
      <div class="flex items-center">
        <UiActionButton
          v-if="filter === 'all'"
          :ariaLabel="$t('base.toggleView')"
          @click="view = view === 'list' ? 'grid' : 'list'"
        >
          <Icon
            :name="view === 'list' ? 'lucide:layout-grid' : 'lucide:list'"
            size="20"
          />
        </UiActionButton>

        <UiActionButton
          v-if="filter === 'all'"
          :ariaLabel="$t('base.toggleFolders')"
          @click="toggleAll"
        >
          <Icon :name="folderIcon" size="20" />
        </UiActionButton>

        <UiActionButton
          v-if="hasFavoritesOrRecent"
          :ariaLabel="$t('categories.favorite')"
          :isActive="filter === 'favorites'"
          @click="toggleFavoritesFilter"
        >
          <Icon
            name="lucide:star"
            :class="filter === 'favorites' ? 'text-primary' : ''"
            size="20"
          />
        </UiActionButton>

        <UiActionButton
          :ariaLabel="$t('categories.new')"
          @click="onClickNew"
        >
          <Icon name="lucide:plus" size="20" />
        </UiActionButton>
      </div>
    </div>

    <div class="scrollerBlock h-full overflow-y-auto px-3 pt-1 pb-4">
      <template v-if="filter === 'all'">
        <div
          v-if="hasNoMatches"
          class="text-muted p-4 text-center"
        >
          {{ t('categories.form.children.noMatches') }}
        </div>

        <template v-else>
          <template
            v-for="rootId in filteredAllRootIds"
            :key="rootId"
          >
            <CategoriesItem
              :activeItemId="props.activeItemId"
              :category="categoriesStore.items[rootId]!"
              :categoryId="rootId"
              :contextMenuItems="getCategoryContextMenuItems(rootId)"
              :isExpanded="isRootExpanded(rootId)"
              :isShowChevron="categoriesStore.hasChildren(rootId)"
              :hideLeftMenuButton="true"
              :leftMenuButton="true"
              :lineWidth="isRootExpanded(rootId) && categoriesStore.hasChildren(rootId) ? 0 : 1"
              class="group"
              @click="onRootClick(rootId)"
              @toggle="toggle(rootId)"
            />

            <div
              v-if="isRootExpanded(rootId) && categoriesStore.hasChildren(rootId)"
              :class="view === 'grid'
                ? 'ml-2 pr-2 pb-4 pl-3'
                : '-mt-px ml-5 pb-1 pl-3'"
            >
              <button
                v-if="props.selectableParents"
                type="button"
                class="hover:bg-elevated/40 mb-1 flex w-full items-center gap-2 rounded-md p-2 text-left"
                :class="props.activeItemId === rootId ? 'bg-elevated/60' : ''"
                @click="onSelect(rootId)"
              >
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-full"
                  :style="{ background: categoriesStore.items[rootId]?.color ?? 'var(--ui-bg-accented)' }"
                >
                  <Icon :name="categoriesStore.items[rootId]?.icon ?? 'lucide:folder'" size="15" class="text-white" />
                </div>
                <div class="min-w-0">
                  <div class="text-highlighted truncate text-sm">
                    {{ t('categories.selectParent', { name: categoriesStore.items[rootId]?.name }) }}
                  </div>
                  <div class="text-2xs text-muted">
                    {{ t('categories.selectParentHint') }}
                  </div>
                </div>
              </button>

              <template v-if="view === 'list'">
                <CategoriesItem
                  v-for="childId in visibleChildrenIds(rootId)"
                  :key="childId"
                  :activeItemId="props.activeItemId"
                  :category="categoriesStore.items[childId]!"
                  :categoryId="childId"
                  :contextMenuItems="getCategoryContextMenuItems(childId)"
                  :hideLeftMenuButton="true"
                  :leftMenuButton="true"
                  :lineWidth="1"
                  class="group"
                  @click="onSelect(childId)"
                />
              </template>

              <div v-else class="flex flex-wrap gap-1">
                <CategoriesRoundLink
                  v-for="childId in visibleChildrenIds(rootId)"
                  :key="childId"
                  :categoryId="childId"
                  :contextMenuItems="getCategoryContextMenuItems(childId)"
                  :isActive="props.activeItemId === childId"
                  @click="onSelect(childId)"
                />
              </div>
            </div>
          </template>
        </template>
      </template>

      <template v-else>
        <div
          v-if="hasNoMatches"
          class="text-muted p-4 text-center"
        >
          {{ t('categories.form.children.noMatches') }}
        </div>

        <template v-else>
          <CategoriesSelectorGrid
            v-if="filteredFavorites.length > 0"
            :activeItemId="props.activeItemId"
            :getContextMenuItems="getCategoryContextMenuItems"
            :ids="filteredFavorites"
            @selected="onSelect"
          />

          <div v-if="filteredRecent.length > 0">
            <div class="font-tertiary sticky top-0 z-10 pt-5 pb-4 text-lg leading-none font-semibold">
              {{ t('categories.recentCategories') }}
            </div>
            <CategoriesSelectorGrid
              :activeItemId="props.activeItemId"
              :getContextMenuItems="getCategoryContextMenuItems"
              :ids="filteredRecent"
              class="pt-px"
              @selected="onSelect"
            />
          </div>
        </template>
      </template>
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
  </div>
</template>
