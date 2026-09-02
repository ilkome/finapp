<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'

import { useCategoriesExpanded } from '~/components/categories/useCategoriesExpanded'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  // Flows inside a parent scroller instead of owning height/scroll.
  embedded?: boolean
  // Hides the built-in search (a parent provides a global one).
  hideSearch?: boolean
  selectedIds?: CategoryId[]
}>()

const emit = defineEmits<{
  removeCategories: [ids: CategoryId[]]
  selected: [id: CategoryId]
  setCategories: [ids: CategoryId[]]
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()

const search = ref('')
const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
const view = useStorage<'list' | 'grid'>('finapp.categoriesFilterView', 'list')

const allRootIds = computed<CategoryId[]>(() => {
  const items = categoriesStore.items
  return [...categoriesStore.categoriesRootIds].sort((a, b) =>
    (items[a]?.name ?? '').localeCompare(items[b]?.name ?? ''),
  )
})

const {
  folderIcon,
  isExpanded,
  toggle,
  toggleAll,
} = useCategoriesExpanded('categoriesFilter', allRootIds)

function nameMatches(id: CategoryId, q: string) {
  const cat = categoriesStore.items[id]
  if (!cat)
    return false
  return cat.name.toLowerCase().includes(q)
}

const searchQuery = computed(() => search.value.trim().toLowerCase())

const filteredRootIds = computed<CategoryId[]>(() => {
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

const hasNoMatches = computed(() =>
  !!searchQuery.value && filteredRootIds.value.length === 0,
)

function rootCheckboxValue(rootId: CategoryId): boolean | 'indeterminate' {
  if (!categoriesStore.hasChildren(rootId))
    return props.selectedIds?.includes(rootId) ?? false
  const children = categoriesStore.getChildrenIds(rootId)
  const count = children.filter(id => props.selectedIds?.includes(id)).length
  if (count === 0)
    return false
  if (count === children.length)
    return true
  return 'indeterminate'
}

function onRootCheckboxChange(rootId: CategoryId, value: boolean | 'indeterminate') {
  if (!categoriesStore.hasChildren(rootId)) {
    emit('selected', rootId)
    return
  }
  const children = categoriesStore.getChildrenIds(rootId)
  if (value === true)
    emit('setCategories', children)
  else
    emit('removeCategories', children)
}

function onRootClick(rootId: CategoryId) {
  if (categoriesStore.hasChildren(rootId)) {
    toggle(rootId)
    return
  }
  emit('selected', rootId)
}

onMounted(async () => {
  if (props.hideSearch)
    return
  await nextTick()
  searchInput.value?.focus()
})
</script>

<template>
  <div :class="props.embedded ? 'relative flex flex-col' : 'relative flex h-full min-h-0 flex-col overflow-hidden'">
    <div
      class="flex items-center gap-2 px-3 py-2"
      :class="[
        props.embedded ? '' : 'sticky top-0 z-20 bg-default',
        props.hideSearch ? 'justify-end' : '',
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
      <div class="flex items-center">
        <UiActionButton
          :ariaLabel="$t('base.toggleView')"
          @click="view = view === 'list' ? 'grid' : 'list'"
        >
          <Icon
            :name="view === 'list' ? 'lucide:layout-grid' : 'lucide:list'"
            size="20"
          />
        </UiActionButton>

        <UiActionButton
          :ariaLabel="$t('base.toggleFolders')"
          @click="toggleAll"
        >
          <Icon :name="folderIcon" size="20" />
        </UiActionButton>
      </div>
    </div>

    <div :class="props.embedded ? 'px-3 pt-1 pb-4' : 'scroller-block h-full overflow-y-auto px-3 pt-1 pb-4'">
      <div
        v-if="hasNoMatches"
        class="p-4 text-center text-muted"
      >
        {{ t('categories.form.children.noMatches') }}
      </div>

      <template v-else>
        <template
          v-for="rootId in filteredRootIds"
          :key="rootId"
        >
          <div class="group flex items-center rounded-md select-none hover:bg-elevated/50 [&_.uiElement:hover]:bg-transparent">
            <div
              class="relative flex-center w-8 shrink-0 self-stretch pl-2"
              @click.stop
            >
              <div
                class="absolute inset-0 z-10"
                @click.stop="onRootCheckboxChange(rootId, rootCheckboxValue(rootId) === true ? false : true)"
              />
              <UCheckbox
                :modelValue="rootCheckboxValue(rootId)"
                class="pointer-events-none"
              />
            </div>
            <CategoriesItem
              :activeItemId="null"
              :category="categoriesStore.items[rootId]!"
              :categoryId="rootId"
              :isExpanded="isRootExpanded(rootId)"
              :isShowChevron="categoriesStore.hasChildren(rootId)"
              :leftMenuButton="true"
              :hideLeftMenuButton="true"
              :lineWidth="isRootExpanded(rootId) && categoriesStore.hasChildren(rootId) ? 0 : 1"
              class="min-w-0 flex-1"
              @click="onRootClick(rootId)"
              @toggle="toggle(rootId)"
            />
          </div>

          <div
            v-if="isRootExpanded(rootId) && categoriesStore.hasChildren(rootId)"
            :class="view === 'grid'
              ? 'ml-2 pr-2 pb-4 pl-3'
              : '-mt-px ml-5 pb-1 pl-3'"
          >
            <template v-if="view === 'list'">
              <div
                v-for="childId in visibleChildrenIds(rootId)"
                :key="childId"
                class="group flex items-center rounded-md select-none hover:bg-elevated/50 [&_.uiElement:hover]:bg-transparent"
                @click="emit('selected', childId)"
              >
                <div
                  class="relative flex-center w-8 shrink-0 self-stretch pl-2"
                  @click.stop
                >
                  <div
                    class="absolute inset-0 z-10"
                    @click.stop="emit('selected', childId)"
                  />
                  <UCheckbox
                    :modelValue="props.selectedIds?.includes(childId) ?? false"
                    class="pointer-events-none"
                  />
                </div>
                <CategoriesItem
                  :activeItemId="null"
                  :category="categoriesStore.items[childId]!"
                  :categoryId="childId"
                  :leftMenuButton="true"
                  :hideLeftMenuButton="true"
                  :lineWidth="1"
                  class="min-w-0 flex-1"
                />
              </div>
            </template>

            <div v-else class="flex flex-wrap gap-1">
              <CategoriesRoundLink
                v-for="childId in visibleChildrenIds(rootId)"
                :key="childId"
                :categoryId="childId"
                :isActive="props.selectedIds?.includes(childId)"
                @click="emit('selected', childId)"
              />
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>
