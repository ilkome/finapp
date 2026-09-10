<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'

import { useCategoriesExpanded } from '~/components/categories/useCategoriesExpanded'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { isMenuableCategory, useCategoryMenuItems } from '~/components/categories/useCategoryMenuItems'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { showErrorToast, showSuccessToast } from '~/composables/useStoreSync'

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

const { folderIcon, isExpanded, toggle, toggleAll } = useCategoriesExpanded(
  'categoriesPage',
  computed(() => categoriesStore.categoriesRootIds),
)

useHead({ title: t('categories.title') })

const categoriesView = useStorage<'list' | 'grid'>('finapp.categoriesView', 'list', localStorage, {
  mergeDefaults: true,
})

const backgroundType = useStorage<'category' | 'none' | 'standard'>('finapp.categoriesBackgroundType', 'none', localStorage, {
  mergeDefaults: true,
})

const isShowChildrenCount = useStorage<boolean>('finapp.categoriesShowChildrenCount', false, localStorage, {
  mergeDefaults: true,
})

const isViewSettingsOpen = ref(false)
const backgroundTypeItems = computed(() => ['none', 'category', 'standard'].map(value => ({
  label: t(`stat.config.categories.list.backgroundTypes.${value}`),
  value,
})))
const childrenViewItems = computed(() => ['list', 'grid'].map(value => ({
  label: t(`categories.view.childrenViews.${value}`),
  value,
})))

const deleteCategoryId = ref<CategoryId | null>(null)

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
  const open = categoryMenu.open(categoryId)
  return [
    [...(open ? [open] : []), categoryMenu.edit(categoryId)],
    [categoryMenu.delete(categoryId, onClickDelete)],
  ]
}
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t('categories.name') }}</UiHeaderTitle>
      <template #actions>
        <UiActionButton
          :ariaLabel="$t('base.toggleFolders')"
          @click="toggleAll"
        >
          <Icon :name="folderIcon" size="20" />
        </UiActionButton>

        <BottomSheetOrDropdown
          :isOpen="isViewSettingsOpen"
          popoverBodyClass="md:pb-0"
          popoverContentClass="w-80 max-w-[calc(100vw-1rem)]"
          :title="t('stat.config.menu.label')"
          @closeModal="isViewSettingsOpen = false"
          @openModal="isViewSettingsOpen = true"
        >
          <template #trigger>
            <UiActionButton :ariaLabel="t('stat.config.menu.label')">
              <Icon name="lucide:settings-2" size="20" />
            </UiActionButton>
          </template>

          <template #content>
            <div class="pb-2">
              <StatConfigFieldRow :title="t('stat.config.categories.list.backgroundType')">
                <USelect
                  class="w-40 shrink-0"
                  :aria-label="t('stat.config.categories.list.backgroundType')"
                  :content="{ position: 'item-aligned' }"
                  :items="backgroundTypeItems"
                  :modelValue="backgroundType"
                  :ui="{ content: 'z-[60]' }"
                  @update:modelValue="value => backgroundType = value as 'category' | 'none' | 'standard'"
                />
              </StatConfigFieldRow>

              <StatConfigFieldRow :title="t('categories.view.childrenView')">
                <USelect
                  class="w-40 shrink-0"
                  :aria-label="t('categories.view.childrenView')"
                  :content="{ position: 'item-aligned' }"
                  :items="childrenViewItems"
                  :modelValue="categoriesView"
                  :ui="{ content: 'z-[60]' }"
                  @update:modelValue="value => categoriesView = value as 'grid' | 'list'"
                />
              </StatConfigFieldRow>

              <UiSwitchItem
                :checkboxValue="isShowChildrenCount"
                :title="t('categories.view.showChildrenCount')"
                trailing
                @click="isShowChildrenCount = !isShowChildrenCount"
              />
            </div>
          </template>
        </BottomSheetOrDropdown>

        <NuxtLink to="/categories/new">
          <UiActionButton :ariaLabel="$t('categories.new')">
            <Icon name="lucide:plus" size="24" />
          </UiActionButton>
        </NuxtLink>
      </template>
    </UiHeader>

    <!-- Empty -->
    <div
      v-if="categoriesStore.categoriesRootIds.length === 0"
      class="flex-center grow flex-col"
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
      class="max-w-4xl grow px-2 lg:px-4 2xl:px-8"
    >
      <CategoriesList
        :backgroundType
        :ids="categoriesStore.categoriesRootIds"
        :categoriesItemProps="{
          isShowChildrenCount,
          leftMenuButton: true,
          lineWidth: 1,
        }"
        :childrenView="categoriesView"
        :expanded="{ isExpanded, toggle }"
        :getContextMenuItems="getCategoryContextMenuItems"
        :getTo="(categoryId: CategoryId) => `/categories/${categoryId}`"
      />
    </div>

    <LayoutConfirmModal
      v-if="deleteCategoryId"
      :title="t('categories.form.delete.title')"
      :description="deleteDescText"
      :highlight="deleteHighlight"
      @closed="deleteCategoryId = null"
      @confirm="onDeleteConfirm"
    />
  </UiPage>
</template>
