<script setup lang="ts">
import { differenceInDays } from 'date-fns'

import type { CategoryId } from '~/components/categories/types'
import type { StatReportType } from '~/components/stat/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { isMenuableCategory, useCategoryMenuItems } from '~/components/categories/useCategoryMenuItems'
import { useFilter } from '~/components/filter/useFilter'
import { calculateBestGranularityBy } from '~/components/stat/date/params'
import { getStatNavigationSnapshot, getStatSnapshotQueryId, isStatDrilldownQuery, useStatCategoryNavigation } from '~/components/stat/navigation'
import { useStatPageHost } from '~/components/stat/page/useStatPageHost'
import { useStatPageProviders } from '~/components/stat/useStatPageProviders'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { showErrorToast, showSuccessToast } from '~/composables/useStoreSync'

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const route = useRoute()
const router = useRouter()
const trnsFormStore = useTrnsFormStore()
const trnsStore = useTrnsStore()
const filter = useFilter()
const { statHeader } = useStatPageHost()
const deleteChildId = ref<CategoryId | null>(null)

const deleteChildTrnsCount = computed(() => {
  if (!deleteChildId.value)
    return 0
  return trnsStore.getStoreTrnsIds({
    categoriesIds: categoriesStore.getChildrenIdsOrParent(deleteChildId.value),
  }).length
})

const deleteChildDescText = computed(() =>
  deleteChildTrnsCount.value > 0 ? t('categories.form.delete.alertWithTrns') : undefined,
)

const deleteChildHighlight = computed(() =>
  deleteChildTrnsCount.value > 0 ? t('trns.plural', deleteChildTrnsCount.value) : undefined,
)

function onClickDeleteChild(childCategoryId: CategoryId) {
  deleteChildId.value = childCategoryId
}

async function onDeleteChildConfirm() {
  if (!deleteChildId.value)
    return

  const childId = deleteChildId.value
  const childTrnsIds = [...trnsStore.getStoreTrnsIds({
    categoriesIds: categoriesStore.getChildrenIdsOrParent(childId),
  })]

  deleteChildId.value = null
  await categoriesStore.deleteCategory(childId, childTrnsIds)

  setTimeout(() => {
    showSuccessToast(childTrnsIds.length > 0
      ? 'categories.form.delete.okWithTrns'
      : 'categories.form.delete.okWithoutTrns', childTrnsIds.length > 0
      ? { length: childTrnsIds.length, trns: t('trns.plural', childTrnsIds.length) }
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
    [categoryMenu.delete(categoryId, onClickDeleteChild)],
  ]
}

const categoryId = computed(() => route.params.id) as ComputedRef<CategoryId>
const category = computed(() => categoriesStore.items[categoryId.value])
const categoryDetailHistoryPattern = /^\/categories\/[^/]+$/
const childrenIds = computed(() => categoriesStore.getChildrenIds(categoryId.value))
// Falls back to [self] so a leaf category still scopes its own trns query
const categoriesIdsOrParent = computed(() => categoriesStore.getChildrenIdsOrParent(categoryId.value))
const statSnapshotId = getStatSnapshotQueryId(route.query.statSnapshot)
const statSnapshot = getStatNavigationSnapshot(statSnapshotId)
const isStatDrilldown = statSnapshotId !== null || isStatDrilldownQuery(route.query.statDrilldown)

const allTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: categoriesIdsOrParent.value,
}))

const singleTrnType = computed<StatReportType | null>(() => {
  const items = trnsStore.items
  if (!items)
    return null
  let hasExpense = false
  let hasIncome = false
  for (const id of allTrnsIds.value) {
    const trn = items[id]
    if (!trn)
      continue
    if (trn.type === TrnType.Expense)
      hasExpense = true
    if (trn.type === TrnType.Income)
      hasIncome = true
    if (hasExpense && hasIncome)
      return null
  }
  if (hasExpense)
    return 'expense'
  if (hasIncome)
    return 'income'
  return null
})

const reportType = computed<StatReportType>(() => singleTrnType.value ?? statSnapshot?.reportType ?? 'combined')
const storageKey = computed(() => isStatDrilldown ? `stat-drilldown-${statSnapshotId}` : `page-${categoryId.value}`)
const legacyTab = localStorage.getItem(`page-${categoryId.value}-tab`)?.replaceAll('"', '')
const legacyStorageKey = computed(() => !isStatDrilldown && legacyTab ? `page-${categoryId.value}-${legacyTab}` : undefined)

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter.categoriesIds.value,
  trnsIds: allTrnsIds.value,
  walletsIds: filter?.walletsIds?.value ?? [],
}))

const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const { statConfig, statDate, trnsViewState } = useStatPageProviders({
  config: {
    initialConfig: statSnapshot?.config,
    legacyStorageKey,
    legacyTab,
    props: isStatDrilldown
      ? undefined
      : {
          categories: {
            bars: {
              isGrouped: false,
            },
            isShowEmpty: true,
            list: {
              isGrouped: false,
            },
            round: {
              isGrouped: false,
            },
          },
        },
    storage: isStatDrilldown ? sessionStorage : localStorage,
    storageKey,
  },
  date: {
    initParams: statSnapshot?.date ?? {
      granularityBy: calculateBestGranularityBy(maxRange.value),
      granularityDuration: 1,
      isShowMaxRange: true,
      isSkipEmpty: true,
      rangeBy: 'day',
      rangeDuration: differenceInDays(maxRange.value.end, maxRange.value.start),
    },
    key: storageKey,
    legacyKey: legacyStorageKey,
    maxRange,
    queryParams: route.query,
    storage: isStatDrilldown ? sessionStorage : localStorage,
  },
  filter,
  initialTrnsViewState: statSnapshot?.trns,
})

const openDrilldownCategory = useStatCategoryNavigation({
  categoriesIds: filter.categoriesIds,
  snapshot: computed(() => ({
    config: statConfig.config.value,
    date: statDate.params.value,
    reportType: reportType.value,
    trns: {
      filterBy: trnsViewState.filterBy.value,
      isShowWithDesc: trnsViewState.isShowWithDesc.value,
    },
  })),
  walletsIds: filter.walletsIds,
})

onActivated(() => {
  if (!isStatDrilldown) {
    statConfig.updateConfig('categories', { list: { isGrouped: false } })
    statConfig.updateConfig('categories', { round: { isGrouped: false } })
    statConfig.updateConfig('categories', { bars: { isGrouped: false } })
  }

  if (categoriesStore.isTransactible(categoryId.value))
    trnsFormStore.values.categoryId = categoryId.value
})

function onEditClick(close: () => void) {
  close()
  setTimeout(() => {
    router.push(`/categories/${categoryId.value}/edit`)
  }, 100)
}

useHead({ title: category.value?.name })

const deleteDescText = computed(() =>
  trnsIds.value.length > 0 ? t('categories.form.delete.alertWithTrns') : undefined,
)

const deleteHighlight = computed(() =>
  trnsIds.value.length > 0 ? t('trns.plural', trnsIds.value.length) : undefined,
)

const isShowDeleteConfirm = ref(false)
function onClickDelete(close: () => void) {
  close()

  for (const id of Object.keys(categoriesStore.items)) {
    if (categoriesStore.items[id]?.parentId === categoryId.value) {
      showErrorToast('categories.form.delete.errorChildren')

      return
    }
  }

  isShowDeleteConfirm.value = true
}

async function onDeleteConfirm() {
  const deleteTrnsIds = [...trnsStore.getStoreTrnsIds({
    categoriesIds: categoriesStore.getChildrenIdsOrParent(categoryId.value),
  })]

  router.push('/categories')
  await categoriesStore.deleteCategory(categoryId.value, deleteTrnsIds)

  // Give some time to complete redirect
  setTimeout(() => {
    showSuccessToast(deleteTrnsIds.length > 0
      ? 'categories.form.delete.okWithTrns'
      : 'categories.form.delete.okWithoutTrns', deleteTrnsIds.length > 0
      ? { length: deleteTrnsIds.length, trns: t('trns.plural', deleteTrnsIds.length) }
      : undefined)
  }, 300)
}
</script>

<template>
  <UiPage v-if="category">
    <StatHeader
      ref="statHeader"
      :backSkipPattern="isStatDrilldown ? undefined : categoryDetailHistoryPattern"
      :backTo="isStatDrilldown ? '/dashboard' : category.parentId ? `/categories/${category.parentId}` : '/categories'"
      configWallets
      :hasCategoryBreakdown="childrenIds.length > 0"
      :preCategoriesIds="childrenIds"
      :trnsIds
      configCategories
    >
      <template #title>
        <CategoriesHeader
          :category="category"
          :parentCategory="categoriesStore.items[category.parentId]"
        />
      </template>

      <template
        v-if="categoryId !== 'transfer'"
        #popover="{ close }"
      >
        <UiHeaderLink
          icon="lucide:pencil"
          @click="onEditClick(close)"
        >
          {{ t('base.edit') }}
        </UiHeaderLink>

        <UiHeaderLink
          icon="lucide:trash-2"
          @click="onClickDelete(close)"
        >
          {{ t('base.delete') }}
        </UiHeaderLink>
      </template>
    </StatHeader>

    <LayoutConfirmModal
      v-if="isShowDeleteConfirm"
      :title="t('categories.form.delete.title')"
      :description="deleteDescText"
      :highlight="deleteHighlight"
      @closed="isShowDeleteConfirm = false"
      @confirm="onDeleteConfirm"
    />

    <LayoutConfirmModal
      v-if="deleteChildId"
      :title="t('categories.form.delete.title')"
      :description="deleteChildDescText"
      :highlight="deleteChildHighlight"
      @closed="deleteChildId = null"
      @confirm="onDeleteChildConfirm"
    />

    <div
      class="grow px-2 lg:px-4 2xl:px-8"
    >
      <CategoriesList
        :ids="childrenIds"
        :getContextMenuItems="getCategoryContextMenuItems"
        :getTo="isStatDrilldown ? undefined : (categoryId: CategoryId) => `/categories/${categoryId}`"
        @click="isStatDrilldown ? openDrilldownCategory($event) : undefined"
      />
    </div>

    <StatLayout
      :categoryId
      :preCategoriesIds="childrenIds"
      :storageKey
      :trnsIds
      :reportType
    />
  </UiPage>
</template>
