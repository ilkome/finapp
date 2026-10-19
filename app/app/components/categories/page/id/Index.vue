<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

import { differenceInDays } from 'date-fns'

import type { CategoryId } from '~/components/categories/types'
import type { StatReportType } from '~/components/stat/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCategoryDelete } from '~/components/categories/useCategoryDelete'
import { useCategoryMenuItems } from '~/components/categories/useCategoryMenuItems'
import { isReservedCategoryId } from '~/components/categories/utils'
import { useStatPageFilter } from '~/components/filter/useStatPageFilter'
import { calculateBestGranularityBy } from '~/components/stat/date/params'
import { resolveStatSelectionRange } from '~/components/stat/date/selectionRange'
import { useStatDrilldownPage } from '~/components/stat/page/useStatDrilldownPage'
import { useStatPageHost } from '~/components/stat/page/useStatPageHost'
import { useStatPageProviders } from '~/components/stat/useStatPageProviders'
import { useStatPageViews } from '~/components/stat/views/useStatPageViews'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { showErrorToast, showSuccessToast } from '~/composables/useStoreSync'

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const route = useRoute('categories-id')
const router = useRouter()
const trnsFormStore = useTrnsFormStore()
const trnsStore = useTrnsStore()
const { statHeader } = useStatPageHost()
const { requestDelete: onClickDeleteChild } = useCategoryDelete()

const categoryMenu = useCategoryMenuItems()

function getCategoryContextMenuItems(categoryId: CategoryId) {
  const open = categoryMenu.open(categoryId)
  return [
    [...(open ? [open] : []), categoryMenu.edit(categoryId)],
    ...[categoryMenu.delete(categoryId, onClickDeleteChild)].filter(group => group.length),
  ]
}

const categoryId = computed<CategoryId>(() => route.params.id)
const category = computed(() => categoriesStore.items[categoryId.value])
const categoryDetailHistoryPattern = /^\/categories\/[^/]+$/
const childrenIds = computed(() => categoriesStore.getChildrenIds(categoryId.value))
// Falls back to [self] so a leaf category still scopes its own trns query
const categoriesIdsOrParent = computed(() => categoriesStore.getChildrenIdsOrParent(categoryId.value))
const { isStatDrilldown, statSnapshot, storage, storageKey, storageQuery } = useStatDrilldownPage({ id: categoryId, kind: 'category' })
const contextBlockIds = computed(() => childrenIds.value.length > 0 && !isStatDrilldown
  ? ['categoryChildren'] as const
  : [])

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
    if (trn.type === 'expense')
      hasExpense = true
    if (trn.type === 'income')
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

const { filter, filterTrnsIds } = useStatPageFilter({
  canFilterCategories: false,
  storage,
  storageKey,
})

const trnsIds = computed(() => filterTrnsIds({ trnsIds: allTrnsIds.value }))

const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const { contentWidth, statConfig, statDate } = useStatPageProviders({
  config: {
    initialConfig: statSnapshot?.config,
    storage,
    storageKey,
    storageQuery,
  },
  contextBlockIds,
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
    maxRange,
    overrideStoredWithInitParams: isStatDrilldown,
    queryParams: () => route.query,
    storage,
  },
  filter,
  initialTrnsViewState: statSnapshot?.trns,
})

const contextRange = computed(() => resolveStatSelectionRange(
  statDate.range.value,
  statDate.selectedInterval.value,
  statDate.params.value.intervalSelected,
))
const { hiddenPanels } = useStatPageViews({
  categoryId,
  contentWidth,
  filter,
  range: contextRange,
  statConfig,
  trnsIds,
})

onActivated(() => {
  if (categoriesStore.isTransactible(categoryId.value))
    trnsFormStore.values.categoryId = categoryId.value
})

function onEditClick() {
  router.push(`/categories/${categoryId.value}/edit`)
}

const menuItems = computed<DropdownMenuItem[][]>(() => [[
  { icon: 'i-lucide-pencil', label: t('base.edit'), onSelect: onEditClick },
], ...(isReservedCategoryId(categoryId.value)
  ? []
  : [[{ color: 'error' as const, icon: 'i-lucide-trash-2', label: t('base.delete'), onSelect: onClickDelete }]])])

useHead({ title: category.value?.name })

const confirm = useConfirm()

async function onClickDelete() {
  for (const id of Object.keys(categoriesStore.items)) {
    if (categoriesStore.items[id]?.parentId === categoryId.value) {
      showErrorToast('categories.form.delete.errorChildren')

      return
    }
  }

  const count = trnsIds.value.length
  const confirmed = await confirm.ask({
    description: count > 0 ? t('categories.form.delete.alertWithTrns') : undefined,
    highlight: count > 0 ? t('trns.plural', count) : undefined,
    title: t('categories.form.delete.title'),
  })
  if (!confirmed)
    return

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
      :menuItems
    >
      <template #title>
        <CategoriesHeader
          :category="category"
          :parentCategory="categoriesStore.items[category.parentId]"
        />
      </template>
    </StatHeader>

    <StatLayout
      :categoryId
      :hiddenPanels
      :initialFilteredType="statSnapshot?.filteredType"
      :lockSingleTypeLayout="singleTrnType !== null"
      :preCategoriesIds="childrenIds"
      :storageKey
      :trnsIds
      :reportType
      showWallets
    >
      <template #categoryChildren>
        <div class="grow">
          <CategoriesList
            :ids="childrenIds"
            :getContextMenuItems="getCategoryContextMenuItems"
            :getTo="(categoryId: CategoryId) => `/categories/${categoryId}`"
          />
        </div>
      </template>
    </StatLayout>
  </UiPage>
</template>
