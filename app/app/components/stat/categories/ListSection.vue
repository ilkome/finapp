<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryWithData, SeriesSlugSelected } from '~/components/stat/types'

import { useCategoriesExpanded } from '~/components/categories/useCategoriesExpanded'
import { getMaxCategoryValues } from '~/components/stat/categories/barUtils'
import { statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  categoriesWithData: CategoryWithData[]
  focusedCategories?: CategoryWithData[]
  focusedChildCategoryId?: CategoryId
  groupedCategories: CategoryWithData[]
  isOneCategory?: boolean
  isTwoColumnLayout?: boolean
  storageKey: string
  type: SeriesSlugSelected | 'summary'
  ungroupedCategories: CategoryWithData[]
}>()

const emit = defineEmits<{
  openCategory: [categoryId: CategoryId, filteredType?: SeriesSlugSelected]
  setFocusedCategoryFilter: [categoryId: CategoryId]
}>()

const { t } = useI18n()
const statConfig = inject(statConfigKey)!

const catsList = computed(() => statConfig.config.value.categories.list)
const isListShow = computed(() => catsList.value.isShow)
const isListGrouped = computed(() => catsList.value.isGrouped)
const isFocused = computed(() => props.focusedCategories !== undefined)

const linesCategories = computed<CategoryWithData[]>(() => isListGrouped.value ? props.groupedCategories : props.ungroupedCategories)
const linesMaxValues = computed(() => getMaxCategoryValues(linesCategories.value))
const childrenMaxValues = computed(() => getMaxCategoryValues(props.categoriesWithData))

const {
  folderIcon,
  isExpanded,
  toggle: toggleCategory,
  toggleAll: toggleAllCategories,
} = useCategoriesExpanded(
  'statCategoriesList',
  computed(() => props.categoriesWithData.map(c => c.id)),
  { persistDefault: true },
)

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
  return isListGrouped.value && !!item.categories?.length && isExpanded(item.id)
}

function onToggleListGrouping() {
  statConfig.updateConfig('categories', { list: { isGrouped: !isListGrouped.value } })
}

const isListShown = useStoredToggle(`${props.storageKey}-${props.type}-list`, true)
</script>

<template>
  <div
    v-if="isListShow || isFocused"
    class="w-full @3xl/main:max-w-md"
  >
    <div v-if="!isFocused" class="flex items-center justify-between">
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
          v-if="statConfig.config.value.categories.view === 'list' && !props.isOneCategory && isListGrouped"
          :ariaLabel="$t('base.toggleFolders')"
          @click="toggleAllCategories"
        >
          <Icon
            :name="folderIcon"
            size="20"
          />
        </UiActionButton>

        <StatCategoriesGroupingToggle
          v-if="!props.isOneCategory"
          :isGrouped="isListGrouped"
          @toggle="onToggleListGrouping"
        />
      </div>
    </div>

    <div
      v-if="isFocused || isListShown"
      :class="{
        'w-full': !isListGrouped,
        '@3xl/main:max-w-md': !isListGrouped,
      }"
      class="pt-2"
    >
      <template v-if="isFocused">
        <StatCategoriesLine
          v-for="(item, index) in focusedCategories"
          :key="item.id"
          :isActive="props.focusedChildCategoryId === item.id"
          :isShowParent="false"
          :item="item"
          :maxCategoryValues="childrenMaxValues"
          :lineWidth="index === (focusedCategories?.length ?? 0) - 1 ? 0 : 1"
          class="group"
          @click="props.isTwoColumnLayout ? emit('setFocusedCategoryFilter', item.id) : emit('openCategory', item.id)"
          @amountClick="props.isTwoColumnLayout ? emit('setFocusedCategoryFilter', item.id) : emit('openCategory', item.id)"
        />
      </template>

      <template
        v-for="(item, index) in linesCategories"
        v-else
        :key="item.id"
      >
        <StatCategoriesLine
          :isShowParent="props.isOneCategory ? false : !isListGrouped"
          :stacked="!props.isOneCategory && !isListGrouped"
          :item="item"
          :isExpanded="isItemExpanded(item)"
          isShowChevron
          :maxCategoryValues="linesMaxValues"
          :lineWidth="index === linesCategories.length - 1 && !isItemExpanded(item) ? 0 : 1"
          :class="`group ${isItemExpanded(item) ? '[&_.uiElementLine]:bg-transparent' : ''}`"
          @click="onParentClick(item)"
          @amountClick="onAmountOpen(item)"
        />

        <UCollapsible
          v-if="item.categories?.length"
          :open="isItemExpanded(item)"
          :ui="{ content: 'overflow-hidden data-[state=open]:animate-none! data-[state=closed]:animate-none!' }"
        >
          <template #content>
            <div class="ml-5 pb-1 pl-3">
              <StatCategoriesLine
                v-for="(itemInside, childIndex) in item.categories"
                :key="itemInside.id"
                :isShowParent="!isListGrouped"
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
