<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesExpanded } from '~/components/categories/useCategoriesExpanded'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCategoryDelete } from '~/components/categories/useCategoryDelete'
import { useCategoryMenuItems } from '~/components/categories/useCategoryMenuItems'
import { isReservedCategoryId } from '~/components/categories/utils'

const { t } = useI18n()
const header = useTemplateRef<{ mainElement: HTMLElement | null }>('header')
const headerHeight = ref(0)
// useElementSize reads 0 for this header, so observe it directly.
useResizeObserver(() => header.value?.mainElement, ([entry]) => {
  headerHeight.value = entry?.borderBoxSize?.[0]?.blockSize ?? entry?.contentRect.height ?? 0
})
const router = useRouter()
const categoriesStore = useCategoriesStore()

const userIds = computed(() => categoriesStore.categoriesRootIds.filter(id => !isReservedCategoryId(id)))
// Reserved categories get their own section, transfer included (pickers use the roots without it).
const systemIds = computed(() => categoriesStore.categoriesRootIds.length
  ? [...categoriesStore.categoriesRootIds.filter(isReservedCategoryId), 'transfer']
  : [])
const listIds = computed(() => [...userIds.value, ...systemIds.value])

const { folderIcon, isExpanded, toggle, toggleAll } = useCategoriesExpanded('categoriesPage', listIds)

useHead({ title: t('categories.title') })

const isMenuOpen = ref(false)
function addCategory(close: () => void) {
  close()
  router.push('/categories/new')
}

const { requestDelete: onClickDelete } = useCategoryDelete()

const categoryMenu = useCategoryMenuItems()

function getCategoryContextMenuItems(categoryId: CategoryId) {
  const open = categoryMenu.open(categoryId)
  return [
    [...(open ? [open] : []), categoryMenu.edit(categoryId)],
    ...[categoryMenu.delete(categoryId, onClickDelete)].filter(group => group.length),
  ]
}
</script>

<template>
  <UiPage>
    <UiHeader ref="header" actionsAfterTitle>
      <UiHeaderTitle>{{ t('categories.name') }}</UiHeaderTitle>
      <template #actions>
        <CategoriesViewSettings />

        <UTooltip :text="$t('base.toggleFolders')">
          <UiActionButton
            :ariaLabel="$t('base.toggleFolders')"
            @click="toggleAll"
          >
            <Icon :name="folderIcon" size="20" />
          </UiActionButton>
        </UTooltip>

        <DrawerOrDropdown
          v-model:open="isMenuOpen"
          align="end"
          isShowCloseBtn
          popoverContentClass="w-64 max-w-[calc(100vw-1rem)]"
        >
          <template #trigger>
            <UTooltip :text="$t('base.moreOptions')">
              <UiActionButton :ariaLabel="$t('base.moreOptions')">
                <Icon name="lucide:ellipsis-vertical" size="20" />
              </UiActionButton>
            </UTooltip>
          </template>

          <template #content="{ close }">
            <div class="py-3 md:-mx-2 md:py-1">
              <UiHeaderLink @click="addCategory(close)">
                {{ t('categories.new') }}
              </UiHeaderLink>
            </div>
          </template>
        </DrawerOrDropdown>
      </template>
    </UiHeader>

    <!-- Empty -->
    <div
      v-if="categoriesStore.categoriesRootIds.length === 0"
      class="flex grow flex-col items-center justify-center"
    >
      <UiTitleSection class="pb-4">
        {{ t('categories.new') }}
      </UiTitleSection>
      <NuxtLink to="/categories/new">
        <UiButtonAccent>
          {{ t('categories.new') }}
        </UiButtonAccent>
      </NuxtLink>
    </div>

    <!-- List -->
    <div
      v-else
      class="grow px-2 lg:px-4 2xl:px-8"
      :style="{ '--sticky-top': `${headerHeight}px` }"
    >
      <CategoriesBlocks
        :expanded="{ isExpanded, toggle }"
        :getContextMenuItems="getCategoryContextMenuItems"
        :getTo="(categoryId: CategoryId) => `/categories/${categoryId}`"
      />
    </div>
  </UiPage>
</template>
