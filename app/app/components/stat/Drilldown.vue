<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'
import type { CategoryId } from '~/components/categories/types'
import type { StatTabSlug } from '~/components/stat/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { isMenuableCategory, useCategoryMenuItems } from '~/components/categories/useCategoryMenuItems'
import { useStatDate } from '~/components/date/useStatDate'
import { useFilter } from '~/components/stat/filter/useFilter'
import { filterKey, statConfigKey, statDateKey } from '~/components/stat/injectionKeys'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { getTypesMapping } from '~/components/stat/utils'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

// Drill-down statistics page. With no categoryId it is the root (a tabs-free duplicate of
// the dashboard); with a categoryId it is scoped to that category. Category clicks navigate
// to `${LINK_BASE}/${id}` instead of opening the transactions modal.
const props = defineProps<{
  categoryId?: CategoryId
}>()

const LINK_BASE = '/stat'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const trnsStore = useTrnsStore()
const trnsFormStore = useTrnsFormStore()
const categoriesStore = useCategoriesStore()
const categoryMenu = useCategoryMenuItems()

const filter = useFilter()
provide(filterKey, filter)

// Fixed 'summary' view — the drill-down pages have no expense/income/split tabs.
const activeTab = ref<StatTabSlug>('summary')

const category = computed(() => props.categoryId ? categoriesStore.items[props.categoryId] : undefined)
const childrenIds = computed(() => props.categoryId ? categoriesStore.getChildrenIds(props.categoryId) : [])
const hasCategories = computed(() => props.categoryId ? childrenIds.value.length > 0 : true)
const categoriesIdsOrParent = computed(() => props.categoryId ? categoriesStore.getChildrenIdsOrParent(props.categoryId) : [])

const pageKey = computed(() => props.categoryId ? `${LINK_BASE}/${props.categoryId}` : LINK_BASE)
const storageKey = computed(() => props.categoryId ? `drilldown-${props.categoryId}-summary` : 'drilldown-summary')

const trnsIds = computed(() => {
  const categoriesIds = props.categoryId
    ? [...filter.categoriesIds.value, ...categoriesIdsOrParent.value]
    : filter.categoriesIds.value
  return trnsStore.getStoreTrnsIds({
    categoriesIds,
    trnsTypes: getTypesMapping(activeTab.value),
    walletsIds: filter?.walletsIds?.value ?? [],
  })
})

const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const statConfig = useStatConfig({
  props: props.categoryId
    ? {
        catsList: { isGrouped: false },
        catsRound: { isGrouped: false },
        isShowEmptyCategories: true,
        vertical: { isGrouped: false },
      }
    : undefined,
  storageKey: storageKey.value,
})
provide(statConfigKey, statConfig)

const statDate = useStatDate({ key: storageKey.value, maxRange, queryParams: route.query })
provide(statDateKey, statDate)

// Root page mirrors the dashboard: the empty-categories view follows the category filter.
watch(filter.categoriesIds, () => {
  if (!props.categoryId)
    statConfig.config.value.isShowEmptyCategories = filter.categoriesIds.value.length > 0
})

// Hard-reload hydration race: `items` always carries synthetic adjustment/transfer entries,
// so wait on `hasItems` before redirecting a genuinely-missing id (see categories/StatPage).
watch(
  () => categoriesStore.hasItems,
  (hasItems) => {
    if (props.categoryId && hasItems && !category.value)
      router.replace(LINK_BASE)
  },
  { immediate: true },
)

// "Open" context menu, parents only (root category that has children).
function getStatMenuItems(id: CategoryId): ContextMenuItem[][] | undefined {
  if (!isMenuableCategory(id) || categoriesStore.getChildrenIds(id).length === 0)
    return undefined
  const open = categoryMenu.open(id, { base: LINK_BASE })
  return open ? [[open]] : undefined
}

onActivated(() => {
  if (!props.categoryId)
    return
  statConfig.updateConfig('catsList', { isGrouped: false })
  statConfig.updateConfig('catsRound', { isGrouped: false })
  statConfig.updateConfig('vertical', { isGrouped: false })

  if (categoriesStore.isTransactible(props.categoryId))
    trnsFormStore.values.categoryId = props.categoryId
})

usePageScrollMemory(() => pageKey.value)

useHead({ title: computed(() => props.categoryId ? category.value?.name : t('stat.title')) })
</script>

<template>
  <UiPage v-if="!props.categoryId || category">
    <StatHeader
      :backTo="props.categoryId ? (category?.parentId ? `${LINK_BASE}/${category.parentId}` : LINK_BASE) : undefined"
      :configWallets="!props.categoryId"
      :filterCategories="!props.categoryId"
      :hasCategoryBreakdown="hasCategories"
      :preCategoriesIds="props.categoryId ? childrenIds : undefined"
      :trnsIds
      configCategories
      filterWallets
      hideTabs
    >
      <template #title>
        <CategoriesHeader
          v-if="props.categoryId && category"
          :category="category"
          :parentCategory="categoriesStore.items[category.parentId]"
        />
        <UiHeaderTitle v-else>
          {{ t('stat.title') }}
        </UiHeaderTitle>
      </template>

      <template
        v-if="props.categoryId && props.categoryId !== 'transfer'"
        #popover="{ close }"
      >
        <UiHeaderLink
          icon="lucide:pencil"
          @click="close(); router.push(`/categories/${props.categoryId}/edit`)"
        >
          {{ t('base.edit') }}
        </UiHeaderLink>
      </template>
    </StatHeader>

    <StatWrap
      :activeTab
      :categoryId="props.categoryId"
      :categoryLinkBase="LINK_BASE"
      :getContextMenuItems="getStatMenuItems"
      :hasChildren="props.categoryId ? categoriesIdsOrParent.length > 1 : true"
      :preCategoriesIds="props.categoryId ? childrenIds : undefined"
      :range="statDate.range.value"
      :storageKey
      :trnsIds
    />
  </UiPage>
</template>
