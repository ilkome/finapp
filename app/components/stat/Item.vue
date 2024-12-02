<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { FilterProvider } from '~/components/filter/types'
import type { CategoriesWithTrns, CategoryWithData, MoneyTypeSlugNew } from '~/components/stat/types'
import type { Range, StatDateProvider } from '~/components/date/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { TotalReturns } from '~/components/amount/getTotal'
import type { TrnId } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import { getTrnsIds } from '~/components/trns/getTrns'
import { markArea } from '~/components/stat/chart/utils'
import { seriesOptions } from '~/components/stat/chart/config'
import { sortCategoriesByAmount } from '~/components/stat/utils'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { WalletId } from '~/components/wallets/types'

const props = defineProps<{
  hasChildren: boolean
  isQuickModal?: boolean
  preCategoriesIds?: CategoryId[]
  storageKey: string
  trnsIds: TrnId[]
  type: MoneyTypeSlugNew
  walletId?: WalletId
}>()

const { t } = useI18n()
const route = useRoute()
const filter = inject('filter') as FilterProvider
const statDate = inject('statDate') as StatDateProvider
const statConfig = inject('statConfig') as StatConfigProvider

const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()
const categoriesStore = useCategoriesStore()

const isShowDateSelector = ref(false)
const isShowTrns = ref(false)

const maxRange = computed(() => trnsStore.getRange(props.trnsIds))
const newBaseStorageKey = computed(() => `finapp-${statDate.params.value.intervalsBy}-${props.storageKey}-${JSON.stringify(filter?.categoriesIds?.value)}`)

function getParentCategoryId(categoryId: CategoryId): CategoryId | undefined {
  const category = categoriesStore.items[categoryId]
  return category?.parentId === 0 ? categoryId : category?.parentId
}

const selectedType = ref<MoneyTypeSlugNew>('sum')

function onClickSumItem(type: MoneyTypeSlugNew) {
  if (type === 'sum') {
    isShowTrns.value = !isShowTrns.value
    return
  }

  selectedType.value = type === selectedType.value ? 'sum' : type
}

const statTypeShow = computed(() => ({
  expense: props.trnsIds.some(id => trnsStore.items?.[id]?.type === 0),
  income: props.trnsIds.some(id => trnsStore.items?.[id]?.type === 1),
}))

const trnsIdsBySelectedType = computed(() => {
  const typeMapping = {
    expense: [0, 2],
    income: [1, 2],
    sum: null,
  }

  const trnsTypes = typeMapping[selectedType.value]

  if (!trnsTypes) {
    return props.trnsIds
  }

  return getTrnsIds({
    trnsIds: props.trnsIds,
    trnsItems: trnsStore.items ?? {},
    trnsTypes,
  })
})

const isPeriodOneDay = computed(() => (statDate.params.value.rangeBy === 'day' && statDate.params.value.rangeDuration === 1) || (statDate.params.value.intervalsBy === 'day' && statDate.params.value.intervalSelected !== -1))

function getCategoriesWithTrnsIdsFromTrnsIds(trnsIds: TrnId[], isGrouped?: boolean) {
  if (!trnsIds?.length)
    return {}

  return trnsIds.reduce((acc, trnId) => {
    // Get category ID from transaction
    const categoryId = trnsStore.items?.[trnId]?.categoryId
    if (!categoryId)
      return acc

    // Skip transfer categories
    if (categoriesStore.transferCategoriesIds.includes(categoryId))
      return acc

    const finalCategoryId = isGrouped
      ? getParentCategoryId(categoryId)
      : categoryId

    if (!finalCategoryId)
      return acc

    // Add transaction to category group
    acc[finalCategoryId] ??= []
    acc[finalCategoryId].push(trnId)
    return acc
  }, {} as CategoriesWithTrns)
}

function getCategoriesWithData(categories: CategoriesWithTrns) {
  return Object.keys(categories)
    .reduce(
      (acc, categoryId) => {
        const totalInCategory = getTotalOfTrnsIds(categories[categoryId]!)
        const trnsIdsInCategory = categories[categoryId]!

        acc.push({
          id: categoryId,
          trnsIds: trnsIdsInCategory,
          value: totalInCategory.sum,
        })
        return acc
      },
      [] as CategoryWithData[],
    )
}

function getTrnsIdsInRanges(trnsIds: TrnId[], ranges: Range[]) {
  const list = [...ranges.map(() => [])]

  trnsIds.forEach((trnId) => {
    const trnDate = trnsStore.items?.[trnId]?.date
    const idx = ranges.findIndex(r => trnDate! >= r.start && trnDate! <= r.end)
    list[idx]?.push(trnId)
  })

  return list
}

const groupedTrnsIds = computed(() => getTrnsIdsInRanges(trnsIdsBySelectedType.value, statDate.intervalsInRange.value))

const selectedTrnsIds = computed(() => {
  const baseParams = {
    categoriesIds: filter?.categoriesIds?.value,
    walletsIds: filter?.walletsIds?.value,
  }

  const params = statDate.params.value.intervalSelected >= 0
    ? {
        ...baseParams,
        trnsIds: groupedTrnsIds.value[statDate.params.value.intervalSelected],
      }
    : {
        ...baseParams,
        dates: {
          from: statDate.range.value.start,
          until: statDate.range.value.end,
        },
        trnsIds: trnsIdsBySelectedType.value,
      }

  return trnsStore.getStoreTrnsIds(params, { includesChildCategories: false })
})

const isCategoriesGrouped = computed(() => statConfig.config.value[statConfig.config.value.catsView === 'list' ? 'catsList' : 'catsRound'].isGrouped)

const categoriesWithTrnsIdsFromTrnsIds = computed(() => {
  return getCategoriesWithTrnsIdsFromTrnsIds(selectedTrnsIds.value, isCategoriesGrouped.value)
})

function getCategoriesWithDataFinal(trnsIds: TrnId[], isGrouped?: boolean, preCategoriesIds?: CategoryId[]) {
  const categoriesWithTrns = getCategoriesWithTrnsIdsFromTrnsIds(trnsIds, isGrouped)
  const categoriesWithData = getCategoriesWithData(categoriesWithTrns)

  // Add empty categories
  if (preCategoriesIds && preCategoriesIds.length > 0) {
    for (const id of preCategoriesIds) {
      if (!categoriesWithTrns[id]) {
        categoriesWithData.push({
          id,
          trnsIds: [],
          value: 0,
        })
      }
    }
  }

  return categoriesWithData.sort((a, b) => sortCategoriesByAmount(a, b))
}

const categoriesWithData = computed(() => {
  const cats: CategoryId[] = []
  if (statConfig.config.value?.isShowEmptyCategories && props.preCategoriesIds) {
    cats.push(...props.preCategoriesIds)
  }

  return getCategoriesWithDataFinal(selectedTrnsIds.value ?? [], isCategoriesGrouped.value, cats)
})

/**
 * Chart
 */
const xAxisLabels = computed(() => statDate.intervalsInRange.value.map(r => +r.start) ?? [])

function getIntervalsData(trnsIds: TrnId[], intervalsInRange: Range[]) {
  function filterTrnsInRange(trnId: TrnId) {
    const trnDate = trnsStore.items?.[trnId]?.date
    return intervalsInRange.some(r => trnDate! >= r.start && trnDate! <= r.end)
  }

  return intervalsInRange.reduce((acc, range) => {
    const trnsIdsInRange = trnsIds.filter(filterTrnsInRange)

    acc[range.start] = {
      range,
      total: getTotalOfTrnsIds(trnsIdsInRange),
      trnsIds: trnsIdsInRange,
    }

    return acc
  }, {} as Record<string, {
    range: Range
    total: TotalReturns
    trnsIds: TrnId[]
  }>)
}

const intervalsData = computed(() => getIntervalsData(trnsIdsBySelectedType.value, statDate.intervalsInRange.value))

function createSeriesItem(typeItem: 'expense' | 'income' | 'sum', data: TotalReturns[]) {
  return {
    color: seriesOptions[typeItem].color,
    cursor: 'default',
    data: data.map(i => typeItem !== 'sum' ? Math.abs(i[typeItem]) : i[typeItem]),
    name: t(`money.${typeItem}`),
    type: seriesOptions[typeItem].type,
  }
}

function getSeriesTypes(type: MoneyTypeSlugNew) {
  return type === 'sum' ? ['expense', 'income'] as const : [type] as const
}

function addMarkArea(series: any[]) {
  const selectedStartDate = statDate.intervalsInRange.value?.[statDate.params.value.intervalSelected]?.start

  if (!selectedStartDate)
    return series

  if (statConfig.config.value?.chartType === 'bar') {
    series[0].markArea = markArea(selectedStartDate)
    return series
  }

  const markAreaIdx = series.findIndex(s => s.markedArea === 'markedArea')
  const markAreaSeries = {
    data: [],
    markArea: markArea(selectedStartDate),
    markedArea: 'markedArea',
    type: 'bar',
  }

  return markAreaIdx === -1
    ? [...series, markAreaSeries]
    : series.map((s, i) => i === markAreaIdx ? markAreaSeries : s)
}

const series = computed(() => {
  const types = getSeriesTypes(props.type)
  const intervalsTotal = groupedTrnsIds.value.map(g => getTotalOfTrnsIds(g))
  const baseSeries = types.map(type => createSeriesItem(type, intervalsTotal))

  return statDate.params.value.intervalSelected >= 0
    ? addMarkArea(baseSeries)
    : baseSeries
})

const biggestCatNumber = computed(() => {
  const income = categoriesWithData.value.filter(c => c.value > 0).at(0)?.value ?? 0
  const expense = categoriesWithData.value.filter(c => c.value < 0).at(0)?.value ?? 0

  return {
    expense,
    income,
  }
})

async function onClickCategory(categoryId: CategoryId) {
  await filter.setCategoryId(categoryId)
  await nextTick()

  const baseParams = {
    filterCategories: filter?.categoriesIds?.value.join(','),
    filterWallets: props.walletId ? props.walletId : filter?.walletsIds?.value.join(','),
    storageKey: props.storageKey ?? '',
  }

  const queryParams = new URLSearchParams(
    !statConfig.config.value.isCategoryPage
      ? { ...baseParams, ...Object.fromEntries(Object.entries(statDate.params.value)) }
      : baseParams,
  ).toString()

  if (route.name === 'categories-id') {
    useRouter().push(`/categories/${categoryId}?${queryParams}`)
  }
  else {
    useRouter().push(`/stat/categories/${categoryId}?${queryParams}`)
  }
}
</script>

<template>
  <div class="@container/stat">
    <pre class="text-2xs">categoriesWithTrnsIdsFromTrnsIds {{ categoriesWithTrnsIdsFromTrnsIds }}</pre>
    <pre class="text-2xs">groupedTrnsIds {{ groupedTrnsIds }}</pre>

    <pre class="text-2xs">statDate.intervalsInRange {{ statDate.intervalsInRange }}</pre>

    <pre class="text-2xs">intervalsData {{ intervalsData }}</pre>

    <pre>groupedTrnsIds {{ groupedTrnsIds }}</pre>

    <!-- Chart -->
    <StatChartWrap
      :isShowDateSelector
      :maxRange
      :series
      :xAxisLabels
      @update:isShowDateSelector="(value: boolean) => isShowDateSelector = value"
    />

    <!-- Stat sum -->
    <StatSumWrap
      :totals="totals"
      :isShowExpense="statTypeShow.expense"
      :isShowIncome="statTypeShow.income"
      :selectedType
      :type="props.type"
      @click="onClickSumItem"
    />

    <!-- Content -->
    <div class="grid gap-6 pt-4">
      <!-- Categories first level -->
      <UiToggle
        v-if="props.hasChildren"
        :storageKey="`${newBaseStorageKey}-${props.type}-cats`"
        :initStatus="true"
        class="min-w-80 md:max-w-lg"
      >
        <template #header="{ toggle, isShown }">
          <div class="flex items-center justify-between md:max-w-lg">
            <UiTitle8 :isShown @click="toggle">
              {{ t('categories.title') }} {{ (!isShown && categoriesWithData.length > 0) ? categoriesWithData.length : '' }}
            </UiTitle8>

            <StatCategoriesButtons
              v-if="isShown"
              :catsLength="categoriesWithData.length"
              isShowGrouping
            />
          </div>
        </template>

        <template v-if="categoriesWithData.length > 0">
          <div
            v-if="statConfig.config.value.isShowCategoriesVertical && categoriesWithData.length > 1"
            class="flex overflow-y-auto pb-2 pl-1 pt-4"
          >
            <StatCategoriesVertical
              v-for="item in categoriesWithData"
              :key="item.id"
              :biggestCatNumber
              :item
              @click="onClickCategory"
            />
          </div>

          <!-- Lines -->
          <div
            v-if="statConfig.config.value.catsView === 'list'"
            :class="{
              'grid gap-2 px-0': statConfig.config.value.catsList.isGrouped && statConfig.config.value.catsList.isOpened,
              'md:max-w-lg': !statConfig.config.value.catsList.isGrouped || !statConfig.config.value.catsList.isOpened,
              'grid gap-1': statConfig.config.value.catsList.isItemsBg,
            }"
            class="pt-2"
          >
            <UiToggle
              v-for="item in categoriesWithData"
              :key="item.id"
              :class="{
                group: !statConfig.config.value.catsList.isItemsBg,
              }"
              :storageKey="`finapp-stat-cats-${item.id}`"
              :initStatus="false"
              :lineWidth="1"
              openPadding="!pb-2"
            >
              <template #header="{ toggle, isShown }">
                <div class="flex items-stretch justify-between">
                  <UiToggleAction
                    v-if="statConfig.config.value.catsList.isGrouped"
                    :isShown="isShown"
                    class="-mr-2.5"
                    @click="toggle"
                  />

                  <StatLinesItemLine
                    :biggestCatNumber
                    :isHideDots="statConfig.config.value.catsList.isOpened"
                    :isHideParent="props.hasChildren"
                    :item
                    :lineWidth="statConfig.config.value.catsList.isLines ? 0 : 1"
                    class="grow"
                    @click="onClickCategory"
                  />
                </div>
              </template>

              <!-- Inside -->
              <div class="border-item-5 ml-5 border-l pl-3">
                <div v-if="!statConfig.config.value.catsList.isOpened">
                  <StatLinesItemLine
                    v-for="itemInside in getCategoriesWithDataFinal(item.trnsIds)"
                    :key="itemInside.id"
                    :biggestCatNumber
                    :class="{ 'bg-item-9 overflow-hidden rounded-lg': statConfig.config.value.catsList.isGrouped && statConfig.config.value.catsList.isOpened }"
                    :isHideDots="statConfig.config.value.catsList.isOpened"
                    :isHideParent="props.hasChildren"
                    :item="itemInside"
                    :lineWidth="((statConfig.config.value.catsList.isGrouped && statConfig.config.value.catsList.isOpened) || statConfig.config.value.catsList.isLines) ? 0 : 1"
                    class="group"
                    @click="onClickCategory"
                  />
                </div>

                <div
                  v-if="statConfig.config.value.catsList.isGrouped && statConfig.config.value.catsList.isOpened"
                  class="flex flex-wrap gap-1 pb-3 pl-2 pt-2"
                >
                  <StatLinesItemRound
                    v-for="itemInside in getCategoriesWithDataFinal(item.trnsIds)"
                    :key="itemInside.id"
                    :item="itemInside"
                    @click="onClickCategory"
                  />
                </div>
              </div>
            </UiToggle>
          </div>

          <!-- Rounds -->
          <div
            v-if="statConfig.config.value.catsView === 'round'"
            class="@3xl/stat:gap-2 flex flex-wrap gap-1 gap-y-2 pl-1 pt-2 md:max-w-lg"
          >
            <StatLinesItemRound
              v-for="item in categoriesWithData"
              :key="item.id"
              :item
              :biggestCatNumber
              isShowAmount
              @click="onClickCategory"
            />
          </div>
        </template>
      </UiToggle>

      <!-- Trns -->
      <UiToggle
        v-if="selectedTrnsIds.length > 0"
        :storageKey="`${newBaseStorageKey}-${props.type}trns-all`"
        :initStatus="true"
        class="min-w-80 md:max-w-lg"
      >
        <template #header="{ toggle, isShown }">
          <div class="flex items-center justify-between">
            <UiTitle8 :isShown @click="toggle">
              {{ t('trns.title') }} {{ (!isShown && selectedTrnsIds.length > 0) ? selectedTrnsIds.length : '' }}
            </UiTitle8>
          </div>
        </template>

        <TrnsList
          :isHideDates="isPeriodOneDay"
          :isShowGroupSum="!isPeriodOneDay"
          :trnsIds="selectedTrnsIds"
          class="py-1"
          isShowExpense
          isShowFilterByDesc
          isShowFilterByType
          isShowIncome
          isShowTransfers
        />
      </UiToggle>

      <TrnsNoTrns v-if="selectedTrnsIds.length === 0" />
    </div>

    <!-- Modals -->
    <Teleport to="body">
      <StatDateSelectorModal
        v-if="isShowDateSelector"
        :maxRange
        @onClose="isShowDateSelector = false"
      />

      <!-- Trns -->
      <BaseBottomSheet2
        v-if="selectedTrnsIds && selectedTrnsIds?.length > 0 && isShowTrns"
        isShow
        drugClassesCustom="bg-foreground-1 lg:w-[calc(100%-120px)] max-w-md"
        @closed="isShowTrns = false"
      >
        <template #handler="{ close }">
          <div class="relative z-20">
            <BaseBottomSheetHandler />
            <BaseBottomSheetClose @onClick="close" />
          </div>
        </template>

        <div class="scrollerBlock grid h-[98dvh] content-start overflow-hidden overflow-y-auto">
          <TrnsList
            :trnsIds="selectedTrnsIds"
            class="p-2"
            isShowFilterByDesc
            isShowFilterByType
            isShowGroupSum
            isShowHeader
            isShowIncome
            isShowExpense
          />
        </div>
      </BaseBottomSheet2>
    </Teleport>
  </div>
</template>
