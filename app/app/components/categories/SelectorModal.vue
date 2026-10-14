<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesExpanded } from '~/components/categories/useCategoriesExpanded'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCategoryDelete } from '~/components/categories/useCategoryDelete'
import { useCategoryMenuItems } from '~/components/categories/useCategoryMenuItems'
import { compareCategoryIds } from '~/components/categories/utils'

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

const searchQuery = computed(() => props.searchQuery ?? search.value)

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
        <UiTriggerButton
          :icon="folderIcon"
          outlined
          :title="$t('base.toggleFolders')"
          @click="toggleAll"
        />

        <CategoriesViewSettings scope="form">
          <template #trigger>
            <UiTriggerButton icon="lucide:settings-2" outlined :title="$t('stat.config.menu.label')" />
          </template>
        </CategoriesViewSettings>

        <UDropdownMenu
          v-if="!props.hideCreate"
          :content="{ align: 'end' }"
          :items="[[{ label: $t('categories.new'), onSelect: onClickNew }]]"
        >
          <UiTriggerButton icon="lucide:ellipsis-vertical" outlined :title="$t('base.moreOptions')" />
        </UDropdownMenu>
      </div>
    </div>

    <div class="h-full scroller-block overflow-y-auto px-3 pt-1 pb-4">
      <CategoriesBlocks
        :activeItemId="props.activeItemId"
        :expanded="{ isExpanded, toggle }"
        :getContextMenuItems="getCategoryContextMenuItems"
        scope="form"
        :searchQuery
        :selectableParents="props.selectableParents"
        :selectedIds="props.selectedIds"
        @select="onSelect"
      />
    </div>

    <CategoriesEditModal
      v-if="(editingCategoryId || isCreatingNewCategory) && !isLaptop"
      :categoryId="editingCategoryId ?? undefined"
      @closed="editingCategoryId = null; isCreatingNewCategory = false"
    />
  </div>
</template>
