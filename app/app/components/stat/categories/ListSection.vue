<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryWithData, SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'

import { useCategoriesExpanded } from '~/components/categories/useCategoriesExpanded'
import { getMaxCategoryValues } from '~/components/stat/categories/barUtils'
import { statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  categoriesWithData: CategoryWithData[]
  focusedCategories?: CategoryWithData[]
  focusedChildCategoryId?: CategoryId
  groupedCategories: CategoryWithData[]
  isOneCategory?: boolean
  storageKey: string
  type: SeriesSlugSelected | StatTabSlug
  ungroupedCategories: CategoryWithData[]
}>()

const emit = defineEmits<{
  clickCategory: [categoryId: CategoryId]
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
  props.storageKey,
  computed(() => props.categoriesWithData.map(c => c.id)),
)

function onParentClick(item: CategoryWithData) {
  if (item.categories?.length)
    toggleCategory(item.id)
  else
    emit('clickCategory', item.id)
}

function onToggleListGrouping() {
  statConfig.updateConfig('categories', { list: { isGrouped: !isListGrouped.value } })
}

const isListShown = useStoredToggle(`${props.storageKey}-${props.type}-list`, true)
</script>

<template>
  <div
    v-if="isListShow || isFocused"
    class="@3xl/main:max-w-md"
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
        '@3xl/main:max-w-md': !isListGrouped,
      }"
      class="pt-2"
    >
      <template v-if="isFocused">
        <StatCategoriesLine
          v-for="item in focusedCategories"
          :key="item.id"
          :isActive="props.focusedChildCategoryId === item.id"
          :isShowParent="false"
          :item="item"
          :maxCategoryValues="childrenMaxValues"
          :lineWidth="1"
          class="group"
          @click="emit('setFocusedCategoryFilter', item.id)"
          @amountClick="emit('setFocusedCategoryFilter', item.id)"
        />
      </template>

      <template
        v-for="item in linesCategories"
        v-else
        :key="item.id"
      >
        <StatCategoriesLine
          :isShowParent="props.isOneCategory ? false : !isListGrouped"
          :stacked="!props.isOneCategory && !isListGrouped"
          :item="item"
          :isExpanded="isExpanded(item.id)"
          isShowChevron
          :maxCategoryValues="linesMaxValues"
          :lineWidth="1"
          :class="`group ${isExpanded(item.id) ? '[&_.uiElementLine]:bg-transparent' : ''}`"
          @click="onParentClick(item)"
          @amountClick="emit('clickCategory', item.id)"
        />

        <UCollapsible
          v-if="item.categories?.length"
          :open="isExpanded(item.id)"
          :ui="{ content: 'overflow-hidden' }"
        >
          <template #content>
            <div class="ml-5 pb-1 pl-3">
              <StatCategoriesLine
                v-for="itemInside in item.categories"
                :key="itemInside.id"
                :isShowParent="!isListGrouped"
                :item="itemInside"
                :maxCategoryValues="childrenMaxValues"
                :lineWidth="1"
                class="group"
                @click="emit('clickCategory', itemInside.id)"
                @amountClick="emit('clickCategory', itemInside.id)"
              />
            </div>
          </template>
        </UCollapsible>
      </template>
    </div>
  </div>
</template>
