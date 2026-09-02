<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryWithData, SeriesSlugSelected } from '~/components/stat/types'

import { useCategoriesExpanded } from '~/components/categories/useCategoriesExpanded'
import { getMaxCategoryValues } from '~/components/stat/categories/barUtils'
import { statConfigKey, statViewControllerKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  categoriesWithData: CategoryWithData[]
  groupedCategories: CategoryWithData[]
  isOneCategory?: boolean
  storageKey: string
  type: SeriesSlugSelected | 'summary'
  ungroupedCategories: CategoryWithData[]
}>()

const emit = defineEmits<{
  openCategory: [categoryId: CategoryId, filteredType?: SeriesSlugSelected]
}>()

const { t } = useI18n()
const statConfig = inject(statConfigKey)!
const statViewController = inject(statViewControllerKey, null)

const catsList = computed(() => statConfig.config.value.categories.list)
const isListShow = computed(() => catsList.value.isShow)
const isShowBackground = computed(() => catsList.value.backgroundType !== 'none')
const isShowTitle = computed(() => catsList.value.isShowTitle)
const linesCategories = computed<CategoryWithData[]>(() => props.categoriesWithData)
const linesMaxValues = computed(() => getMaxCategoryValues(linesCategories.value))
const childrenMaxValues = computed(() => getMaxCategoryValues(props.categoriesWithData))
const hasGroupedCategories = computed(() => linesCategories.value.some(item => !!item.categories?.length))

const {
  folderIcon,
  isExpanded,
  reset: resetExpanded,
  toggle: toggleCategory,
  toggleAll: toggleAllCategories,
} = useCategoriesExpanded(
  'statCategoriesList',
  computed(() => props.categoriesWithData.map(c => c.id)),
  { persistDefault: true },
)

watch(() => statViewController?.activeId.value, (activeId, previousActiveId) => {
  if (previousActiveId !== undefined && activeId !== previousActiveId)
    resetExpanded(catsList.value.isAutoExpandParents)
})

watch(() => catsList.value.isAutoExpandParents, resetExpanded, { immediate: true })

function onParentClick(item: CategoryWithData) {
  if (item.categories?.length)
    toggleCategory(item.id)
  else
    emit('openCategory', item.id)
}

function onAmountOpen(item: CategoryWithData) {
  const filteredType = props.type === 'expense' || props.type === 'income'
    ? props.type
    : undefined
  emit('openCategory', item.id, filteredType)
}

function isItemExpanded(item: CategoryWithData) {
  return !!item.categories?.length && isExpanded(item.id)
}

const isListShown = useStoredToggle(`${props.storageKey}-${props.type}-list`, true)
</script>

<template>
  <div
    v-if="isListShow"
    class="w-full @3xl/main:max-w-md"
  >
    <div v-if="isShowTitle" class="flex items-center justify-between">
      <UiTitleCollapse
        class="grow"
        :isShown="isListShown"
        @click="isListShown = !isListShown"
      >
        {{ t('stat.config.categories.list.title') }} {{ (!isListShown && categoriesWithData.length > 0) ? categoriesWithData.length : '' }}
      </UiTitleCollapse>

      <div
        v-if="isListShown"
        class="flex items-center gap-1"
      >
        <UiActionButton
          v-if="!props.isOneCategory && hasGroupedCategories"
          :ariaLabel="$t('base.toggleFolders')"
          @click="toggleAllCategories"
        >
          <Icon
            :name="folderIcon"
            size="20"
          />
        </UiActionButton>
      </div>
    </div>

    <div
      v-if="!isShowTitle || isListShown"
      class="w-full @3xl/main:max-w-md"
      :class="[
        isShowTitle && 'pt-2',
        isShowBackground && 'grid gap-1',
      ]"
    >
      <template
        v-for="(item, index) in linesCategories"
        :key="item.id"
      >
        <StatCategoriesLine
          :isShowParent="!props.isOneCategory && !item.categories?.length"
          :stacked="!props.isOneCategory && !item.categories?.length"
          :item="item"
          :isExpanded="isItemExpanded(item)"
          isShowChevron
          :maxCategoryValues="linesMaxValues"
          :lineWidth="index === linesCategories.length - 1 && !isItemExpanded(item) ? 0 : 1"
          class="group"
          :class="isItemExpanded(item) && '[&_.uiElementLine]:bg-transparent'"
          @click="onParentClick(item)"
          @amountClick="onAmountOpen(item)"
        />

        <UCollapsible
          v-if="item.categories?.length"
          :open="isItemExpanded(item)"
          :class="!isItemExpanded(item) && 'hidden'"
          :ui="{ content: 'overflow-hidden data-[state=open]:animate-none! data-[state=closed]:animate-none!' }"
        >
          <template #content>
            <div
              :class="isShowBackground && 'grid gap-1'"
              class="ml-5 pb-1 pl-3"
            >
              <StatCategoriesLine
                v-for="(itemInside, childIndex) in item.categories"
                :key="itemInside.id"
                :isShowParent="false"
                :item="itemInside"
                :maxCategoryValues="childrenMaxValues"
                :lineWidth="childIndex === item.categories.length - 1 && index === linesCategories.length - 1 ? 0 : 1"
                class="group"
                @click="emit('openCategory', itemInside.id)"
                @amountClick="onAmountOpen(itemInside)"
              />
            </div>
          </template>
        </UCollapsible>
      </template>
    </div>
  </div>
</template>
