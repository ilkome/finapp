<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryWithData, SeriesSlugSelected } from '~/components/stat/types'

import { useCategoriesExpanded } from '~/components/categories/useCategoriesExpanded'
import { getMaxCategoryValues } from '~/components/stat/categories/barUtils'
import { useStatCategoryRows } from '~/components/stat/categories/useStatCategoryRows'
import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'
import { statViewControllerKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  categoriesWithData: CategoryWithData[]
  isOneCategory?: boolean
  storageKey: string
  type: SeriesSlugSelected | 'summary'
}>()

const emit = defineEmits<{
  openCategory: [categoryId: CategoryId, filteredType?: SeriesSlugSelected]
}>()

const { t } = useI18n()
const statConfig = useStatConfigCtx()
const statViewController = inject(statViewControllerKey, null)

const catsList = computed(() => statConfig.categories.value.list)
const isListShow = computed(() => catsList.value.isShow)
const isShowTitle = computed(() => catsList.value.isShowTitle)
const { currencyCode, openFormForCategory, rows } = useStatCategoryRows(() => props.categoriesWithData)
const maxValues = computed(() => getMaxCategoryValues(props.categoriesWithData))
const hasGroupedCategories = computed(() => props.categoriesWithData.some(item => !!item.categories?.length))

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
const expandedIds = computed(() => props.categoriesWithData.map(item => item.id).filter(id => isExpanded(id)))

watch(() => statViewController?.activeId.value, (activeId, previousActiveId) => {
  if (previousActiveId !== undefined && activeId !== previousActiveId)
    resetExpanded(catsList.value.isAutoExpandParents)
})

watch(() => catsList.value.isAutoExpandParents, resetExpanded, { immediate: true })

function onAmountOpen(categoryId: CategoryId) {
  const filteredType = props.type === 'expense' || props.type === 'income'
    ? props.type
    : undefined
  emit('openCategory', categoryId, filteredType)
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
        <UTooltip
          v-if="!props.isOneCategory && hasGroupedCategories"
          :text="$t('base.toggleFolders')"
        >
          <UiActionButton
            :ariaLabel="$t('base.toggleFolders')"
            @click="toggleAllCategories"
          >
            <Icon
              :name="folderIcon"
              size="20"
            />
          </UiActionButton>
        </UTooltip>
      </div>
    </div>

    <StatCategoriesListView
      v-if="!isShowTitle || isListShown"
      class="w-full @3xl/main:max-w-md"
      :class="isShowTitle && 'pt-2'"
      :backgroundType="catsList.backgroundType"
      :currencyCode
      :expandedIds
      :isLines="catsList.isLines"
      :isRoundIcon="catsList.isRoundIcon"
      :isShowParent="!props.isOneCategory"
      :maxCategoryValues="maxValues"
      :rows
      :trendType="catsList.trendType"
      @amountClick="onAmountOpen"
      @longPress="openFormForCategory"
      @select="emit('openCategory', $event)"
      @toggleExpand="toggleCategory"
    />
  </div>
</template>
