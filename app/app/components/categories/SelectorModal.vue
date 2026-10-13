<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'

import { useCategoriesExpanded } from '~/components/categories/useCategoriesExpanded'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCategoryDelete } from '~/components/categories/useCategoryDelete'
import { useCategoryMenuItems } from '~/components/categories/useCategoryMenuItems'
import { compareCategoryIds } from '~/components/categories/utils'
import { useCategoriesViewSettings } from '~/composables/useCategoriesViewSettings'

const props = defineProps<{
  activeItemId?: CategoryId
  autofocus?: boolean
  hide?: () => void
  hideCreate?: boolean
  hideHeader?: boolean
  hideSearch?: boolean
  // Budgets aggregate a category's whole subtree, so they need to pick a parent itself - not just
  // a leaf. When set, each expanded parent offers an explicit "whole category" row.
  searchQuery?: string
  selectableParents?: boolean
  selectedIds?: CategoryId[]
}>()

const emit = defineEmits<{
  selected: [id: CategoryId]
}>()

const { t } = useI18n()
const router = useRouter()
const categoriesStore = useCategoriesStore()

const isLaptop = useIsLaptop()

const search = ref('')
const searchInput = useTemplateRef<HTMLInputElement>('searchInput')

const { childrenView: view, isRoundIcon, isShowChildrenCount, layout } = useCategoriesViewSettings()
const isColumns = computed(() => layout.value === 'columns')
// Favorites and recent come first in the sheet; their toggles hide them.
const blocksOpen = useStorage<Record<string, boolean>>('finapp.categoriesBlocksOpen', { all: true, favorites: true, recent: true, system: true }, localStorage, { mergeDefaults: true })

const editingCategoryId = ref<CategoryId | null>(null)
const isCreatingNewCategory = ref(false)

const allRootIds = computed<CategoryId[]>(() => {
  const items = categoriesStore.items
  return [...categoriesStore.categoriesRootIds].sort((a, b) => compareCategoryIds(a, b, items))
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

const searchQuery = computed(() => (props.searchQuery ?? search.value).trim().toLowerCase())

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
  if (categoriesStore.getChildrenIds(rootId).some(id => props.selectedIds?.includes(id)))
    return true
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

const hasNoMatches = computed(() => !!searchQuery.value
  && filteredAllRootIds.value.length === 0
  && filteredFavorites.value.length === 0
  && filteredRecent.value.length === 0)

function onClickNew() {
  if (isLaptop.value)
    router.push('/categories/new?returnBack=1')
  else
    isCreatingNewCategory.value = true
}

const { requestDelete: onClickDelete } = useCategoryDelete()

const categoryMenu = useCategoryMenuItems()

function getCategoryContextMenuItems(categoryId: CategoryId) {
  const editOpts = isLaptop.value
    ? { returnBack: true }
    : { onEdit: (id: CategoryId) => { editingCategoryId.value = id } }
  const qt = categoryMenu.quickToggles(categoryId)
  return [
    [categoryMenu.edit(categoryId, editOpts)],
    ...(qt ? [qt] : []),
    ...[categoryMenu.delete(categoryId, onClickDelete)].filter(group => group.length),
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

async function focusSearch() {
  // Autofocus is a mouse-only convenience: on touch it just pops the keyboard over the sheet.
  if (!isLaptop.value)
    return

  if (props.hideHeader || props.hideSearch || props.autofocus === false)
    return
  await nextTick()
  const focus = () => {
    if (props.autofocus !== false)
      searchInput.value?.focus()
  }
  requestAnimationFrame(focus)
  // The kept-mounted filter sheet restores focus to its trigger after opening.
  setTimeout(focus, 250)
}

onMounted(focusSearch)
watch(() => props.autofocus, focusSearch)

// Lets a host with its own toolbar (the filter sheet) drive the view controls.
defineExpose({ folderIcon, toggleAll })
</script>

<template>
  <div class="relative flex h-full min-h-0 flex-col overflow-hidden">
    <div
      v-if="!props.hideHeader"
      class="sticky top-0 z-20 flex items-center gap-2 bg-default/90 px-3 backdrop-blur"
      :class="[
        props.hideSearch ? 'justify-end py-1' : 'py-2',
      ]"
    >
      <input
        v-if="!props.hideSearch"
        ref="searchInput"
        v-model="search"
        type="text"
        class="m-0 min-h-10.5 w-0 min-w-0 flex-1 rounded-md border border-transparent bg-elevated/30 px-4 py-2 text-base font-normal outline-none placeholder:text-muted hover:bg-elevated/50 focus:border-primary focus:bg-elevated/50"
        :placeholder="t('categories.search.placeholder')"
      >
      <div class="flex items-center gap-0.5">
        <CategoriesViewSettings hideBackground>
          <template #trigger>
            <UiTriggerButton icon="lucide:settings-2" outlined :title="$t('stat.config.menu.label')" />
          </template>
        </CategoriesViewSettings>

        <UiTriggerButton
          :icon="folderIcon"
          outlined
          :title="$t('base.toggleFolders')"
          @click="toggleAll"
        />

        <UDropdownMenu
          v-if="!props.hideCreate"
          :content="{ align: 'end' }"
          :items="[[{ label: $t('categories.new'), onSelect: onClickNew }]]"
          :modal="false"
        >
          <UiTriggerButton icon="lucide:ellipsis-vertical" outlined :title="$t('base.moreOptions')" />
        </UDropdownMenu>
      </div>
    </div>

    <div
      class="h-full scroller-block overflow-y-auto px-3 pt-1 pb-4"
    >
      <div
        v-if="hasNoMatches"
        class="p-4 text-center text-muted"
      >
        {{ t('categories.form.children.noMatches') }}
      </div>

      <UCollapsible
        v-for="block in [
          { id: 'favorites', ids: filteredFavorites },
          { id: 'recent', ids: filteredRecent },
        ].filter(block => block.ids.length)"
        :key="block.id"
        :open="blocksOpen[block.id]"
      >
        <div class="sticky top-0 z-10 flex items-stretch bg-default">
          <UiTitleDropRight :isShown="blocksOpen[block.id]" @click="blocksOpen[block.id] = !blocksOpen[block.id]">
            <div class="font-tertiary text-base leading-none font-semibold text-toned!">
              {{ t(`categories.blocks.${block.id}`) }}
            </div>

            <div class="text-xs leading-none tracking-wide text-dimmed">
              {{ block.ids.length }}
            </div>
          </UiTitleDropRight>
        </div>

        <template #content>
          <CategoriesSelectorGrid
            :activeItemId="props.activeItemId"
            class="pb-4"
            :getContextMenuItems="getCategoryContextMenuItems"
            :ids="block.ids"
            :selectedIds="props.selectedIds"
            @selected="onSelect"
          />
        </template>
      </UCollapsible>

      <div>
        <div :class="isColumns && 'grid gap-1 3sm:grid-cols-2'">
          <div
            v-for="rootId in filteredAllRootIds"
            :key="rootId"
            :class="isColumns && isRootExpanded(rootId) && categoriesStore.hasChildren(rootId) && 'col-span-full'"
          >
            <CategoriesItem
              :activeItemId="props.activeItemId"
              :category="categoriesStore.items[rootId]!"
              :categoryId="rootId"
              :contextMenuItems="getCategoryContextMenuItems(rootId)"
              :isExpanded="isRootExpanded(rootId)"
              :isRoundIcon="isRoundIcon"
              :isShowChevron="categoriesStore.hasChildren(rootId)"
              :isShowChildrenCount="isShowChildrenCount"
              :hideLeftMenuButton="true"
              :leftMenuButton="true"
              :lineWidth="isColumns || (isRootExpanded(rootId) && categoriesStore.hasChildren(rootId)) ? 0 : 1"
              :selectedIds="props.selectedIds"
              :stacked="isColumns"
              :class="isColumns ? 'group rounded-md bg-elevated/30' : 'group'"
              @click="onRootClick(rootId)"
              @toggle="toggle(rootId)"
            />

            <div
              v-if="isRootExpanded(rootId) && categoriesStore.hasChildren(rootId)"
              :class="isColumns
                ? 'ml-2 pt-1 pl-3'
                : view === 'grid'
                  ? 'ml-2 pr-2 pb-4 pl-3'
                  : '-mt-px ml-5 pb-1 pl-3'"
            >
              <button
                v-if="props.selectableParents"
                type="button"
                class="mb-1 flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-elevated/40"
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
                  <div class="truncate text-sm text-highlighted">
                    {{ t('categories.selectParent', { name: categoriesStore.items[rootId]?.name }) }}
                  </div>
                  <div class="text-2xs text-muted">
                    {{ t('categories.selectParentHint') }}
                  </div>
                </div>
              </button>

              <div v-if="isColumns" class="grid gap-1 3sm:grid-cols-2">
                <CategoriesItem
                  v-for="childId in visibleChildrenIds(rootId)"
                  :key="childId"
                  :activeItemId="props.activeItemId"
                  :category="categoriesStore.items[childId]!"
                  :categoryId="childId"
                  :contextMenuItems="getCategoryContextMenuItems(childId)"
                  :hideLeftMenuButton="true"
                  :isRoundIcon="isRoundIcon"
                  :leftMenuButton="true"
                  :lineWidth="0"
                  :selectedIds="props.selectedIds"
                  class="group rounded-md bg-elevated/30"
                  stacked
                  @click="onSelect(childId)"
                />
              </div>

              <template v-else-if="view === 'list'">
                <CategoriesItem
                  v-for="childId in visibleChildrenIds(rootId)"
                  :key="childId"
                  :activeItemId="props.activeItemId"
                  :category="categoriesStore.items[childId]!"
                  :categoryId="childId"
                  :contextMenuItems="getCategoryContextMenuItems(childId)"
                  :hideLeftMenuButton="true"
                  :isRoundIcon="isRoundIcon"
                  :leftMenuButton="true"
                  :lineWidth="1"
                  :selectedIds="props.selectedIds"
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
                  :isActive="props.selectedIds?.includes(childId) || props.activeItemId === childId"
                  @click="onSelect(childId)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <CategoriesEditModal
      v-if="(editingCategoryId || isCreatingNewCategory) && !isLaptop"
      :categoryId="editingCategoryId ?? undefined"
      @closed="editingCategoryId = null; isCreatingNewCategory = false"
    />
  </div>
</template>
