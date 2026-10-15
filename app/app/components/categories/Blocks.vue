<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CategoryListRow } from '~/components/categories/ListView.vue'
import type { CategoryId } from '~/components/categories/types'
import type { CategoriesViewScope } from '~/composables/useCategoriesViewSettings'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { isReservedCategoryId } from '~/components/categories/utils'
import { useCategoriesViewSettings } from '~/composables/useCategoriesViewSettings'

// The categories page and every category-selection sheet render their lists through this, so
// blocks, backgrounds, columns and sticky headers read the same everywhere.
const props = defineProps<{
  activeItemId?: CategoryId
  expanded: { isExpanded: (id: CategoryId) => boolean, toggle: (id: CategoryId) => void }
  getContextMenuItems?: (categoryId: CategoryId) => any[][] | undefined
  /** Set on the page, where a row is a link; without it a row click is a pick. */
  getTo?: (categoryId: CategoryId) => string
  /** Favorites show drag handles and save their order. */
  isSortFavorites?: boolean
  scope?: CategoriesViewScope
  searchQuery?: string
  selectableParents?: boolean
  selectedIds?: CategoryId[]
}>()

const emit = defineEmits<{
  select: [id: CategoryId]
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const { backgroundType, childrenView, isRoundIcon, isShowChildrenCount } = useCategoriesViewSettings(props.scope)

type CategoriesBlock = 'all' | 'favorites' | 'recent' | 'system'
// Each scope (page, form sheets) remembers its own open blocks, like its view settings.
const blocksOpen = useStorage<Record<CategoriesBlock, boolean>>(props.scope === 'form' ? 'finapp.categoriesBlocksOpen.form' : 'finapp.categoriesBlocksOpen', { all: true, favorites: true, recent: true, system: true }, localStorage, { mergeDefaults: true })

const query = computed(() => (props.searchQuery ?? '').trim().toLowerCase())

function nameMatches(id: CategoryId, q: string) {
  return !!categoriesStore.items[id]?.name.toLowerCase().includes(q)
}

function visibleChildrenIds(rootId: CategoryId): CategoryId[] {
  const all = categoriesStore.getChildrenIds(rootId)
  if (!query.value || nameMatches(rootId, query.value))
    return all
  return all.filter(id => nameMatches(id, query.value))
}

function matchesRoot(rootId: CategoryId) {
  return !query.value || nameMatches(rootId, query.value) || categoriesStore.getChildrenIds(rootId).some(id => nameMatches(id, query.value))
}

const userIds = computed(() => categoriesStore.categoriesRootIds.filter(id => !isReservedCategoryId(id)).filter(matchesRoot))
// Reserved categories get their own block, transfer included (pickers use the roots without it).
const systemIds = computed(() => (categoriesStore.categoriesRootIds.length
  ? [...categoriesStore.categoriesRootIds.filter(isReservedCategoryId), 'transfer']
  : []).filter(matchesRoot))

function matchingFlat(ids: CategoryId[]) {
  return query.value ? ids.filter(id => nameMatches(id, query.value)) : ids
}

// Favorites and recent come first; their block toggles hide them.
const blocks = computed(() => [
  { id: 'favorites' as const, ids: matchingFlat(categoriesStore.favoriteCategoriesIds), isFlat: true },
  { id: 'recent' as const, ids: matchingFlat(categoriesStore.recentCategoriesIds), isFlat: true },
  { id: 'all' as const, ids: userIds.value, isFlat: false },
  { id: 'system' as const, ids: systemIds.value, isFlat: false },
].filter(block => block.ids.length).map(block => ({
  ...block,
  // Parents count together with their children; the flat blocks list categories as they are.
  count: block.ids.length + (block.isFlat ? 0 : block.ids.reduce((sum, id) => sum + visibleChildrenIds(id).length, 0)),
})))

function isExpanded(rootId: CategoryId) {
  if (query.value)
    return visibleChildrenIds(rootId).length > 0
  if (categoriesStore.getChildrenIds(rootId).some(id => props.selectedIds?.includes(id)))
    return true
  return props.expanded.isExpanded(rootId)
}

function onClick(id: CategoryId, isFlat: boolean) {
  if (props.getTo)
    return
  if (!isFlat && categoriesStore.hasChildren(id))
    props.expanded.toggle(id)
  else
    emit('select', id)
}

const itemProps = computed(() => ({
  isRoundIcon: isRoundIcon.value,
  isShowChildrenCount: isShowChildrenCount.value,
  leftMenuButton: true,
  lineWidth: 1,
  selectedIds: props.selectedIds,
}))
</script>

<template>
  <div
    v-if="query && !blocks.length"
    class="p-4 text-center text-muted"
  >
    {{ t('categories.form.children.noMatches') }}
  </div>

  <UCollapsible
    v-for="(block, index) in blocks"
    :key="block.id"
    :class="index === blocks.length - 1 && !blocksOpen[block.id] && 'pb-6'"
    :open="blocksOpen[block.id]"
  >
    <div class="sticky top-(--sticky-top,0px) z-12 flex items-stretch bg-default">
      <UiTitleDropRight :isShown="blocksOpen[block.id]" @click="blocksOpen[block.id] = !blocksOpen[block.id]">
        <div class="font-tertiary text-base leading-none font-semibold text-toned!">
          {{ t(`categories.blocks.${block.id}`) }}
        </div>

        <div v-if="isShowChildrenCount" class="text-xs leading-none tracking-wide text-dimmed">
          {{ block.count }}
        </div>
      </UiTitleDropRight>
    </div>

    <template #content>
      <WalletsSortableList
        v-if="block.id === 'favorites' && isSortFavorites"
        :ids="block.ids"
        class="grid gap-1 pt-1.5 pb-6"
        @update="ids => categoriesStore.saveFavoritesOrder(ids)"
      >
        <template #default="{ id }">
          <div class="flex items-stretch overflow-hidden rounded-md bg-elevated/30 hover:bg-elevated/50">
            <WalletsSortHandle />
            <CategoriesItem
              :category="categoriesStore.items[id]!"
              :categoryId="id"
              class="min-w-0 grow"
              isShowParent
              :isRoundIcon
              :lineWidth="0"
              stacked
            />
          </div>
        </template>
      </WalletsSortableList>

      <!-- The flat blocks share the transaction form's quick grid: two columns from phone width. -->
      <CategoriesSelectorGrid
        v-else-if="block.isFlat"
        :activeItemId
        class="pt-1.5 pb-6"
        :getContextMenuItems
        :getTo
        :ids="block.ids"
        :backgroundType
        :isRoundIcon
        :isTwoColumns="scope === 'form'"
        :selectedIds
        @selected="id => onClick(id, true)"
      />

      <CategoriesList
        v-else
        :activeItemId
        :backgroundType
        :categoriesItemProps="itemProps"
        :childrenView
        class="pb-6"
        :expanded="block.isFlat ? undefined : { isExpanded, toggle: expanded.toggle }"
        :getChildrenIds="visibleChildrenIds"
        :getContextMenuItems
        :getTo
        :ids="block.ids"
        :isFlat="block.isFlat"
        :isStickyParents="!block.isFlat"
        layout="columns"
        @click="id => onClick(id, block.isFlat)"
      >
        <template v-if="selectableParents" #childrenPrepend="{ row }: { row: CategoryListRow }">
          <button
            type="button"
            class="mb-1 flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-elevated/40"
            :class="activeItemId === row.categoryId ? 'bg-elevated/60' : ''"
            @click="emit('select', row.categoryId)"
          >
            <div
              class="flex size-7 shrink-0 items-center justify-center rounded-full"
              :style="{ background: row.category.color ?? 'var(--ui-bg-accented)' }"
            >
              <Icon :name="row.category.icon ?? 'lucide:folder'" size="15" class="text-white" />
            </div>
            <div class="min-w-0">
              <div class="truncate text-sm text-highlighted">
                {{ t('categories.selectParent', { name: row.category.name }) }}
              </div>
              <div class="text-2xs text-muted">
                {{ t('categories.selectParentHint') }}
              </div>
            </div>
          </button>
        </template>
      </CategoriesList>
    </template>
  </UCollapsible>
</template>
