<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryWithData, SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'

import { useCategoriesExpanded } from '~/components/categories/useCategoriesExpanded'
import { getMaxCategoryValues } from '~/components/stat/categories/barUtils'
import { statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  categoriesWithData: CategoryWithData[]
  groupedCategories: CategoryWithData[]
  isOneCategory?: boolean
  storageKey: string
  type: SeriesSlugSelected | StatTabSlug
  ungroupedCategories: CategoryWithData[]
}>()

const emit = defineEmits<{
  clickCategory: [categoryId: CategoryId]
}>()

const { t } = useI18n()
const statConfig = inject(statConfigKey)!

const catsList = computed(() => statConfig.config.value.categories.list)
const isListShow = computed(() => catsList.value.isShow)
const isListGrouped = computed(() => catsList.value.isGrouped)
const isLines = computed(() => catsList.value.isLines)

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
    v-if="isListShow"
    class="@3xl/main:max-w-md"
  >
    <div class="flex items-center justify-between">
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
      v-if="isListShown"
      :class="{
        '@3xl/main:max-w-md': !isListGrouped,
      }"
      class="pt-2"
    >
      <UCollapsible
        v-for="item in linesCategories"
        :key="item.id"
        :open="isExpanded(item.id)"
        class="group"
      >
        <div class="-mt-px flex items-stretch justify-between">
          <StatCategoriesLine
            :isShowParent="props.isOneCategory ? false : !isListGrouped"
            :stacked="!props.isOneCategory && !isListGrouped"
            :item="item"
            :isExpanded="isExpanded(item.id)"
            isShowChevron
            :maxCategoryValues="linesMaxValues"
            :lineWidth="isLines ? 0 : 1"
            class="grow"
            @click="onParentClick(item)"
            @amountClick="emit('clickCategory', item.id)"
          />
        </div>

        <template #content>
          <!-- Inside -->
          <div
            v-if="item.categories?.length"
            class="mt-[-2px] ml-5 -translate-x-px pb-3 pl-3"
          >
            <div class="grid">
              <StatCategoriesLine
                v-for="itemInside in item.categories"
                :key="itemInside.id"
                :isShowParent="!isListGrouped"
                :item="itemInside"
                :maxCategoryValues="childrenMaxValues"
                :lineWidth="isLines ? 0 : 1"
                class="grow"
                @click="emit('clickCategory', itemInside.id)"
                @amountClick="emit('clickCategory', itemInside.id)"
              />
            </div>
          </div>
        </template>
      </UCollapsible>
    </div>
  </div>
</template>
