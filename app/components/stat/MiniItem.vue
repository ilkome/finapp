<script setup lang="ts">
import _sortby from 'lodash.sortby'
import dayjs from 'dayjs'
import defu from 'defu'
import { useStorage } from '@vueuse/core'
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { ChartType } from '~/components/stat/chart/types'
import type { DeepPartial } from '~~/utils/types'
import type { FilterProvider } from '~/components/filter/types'
import type { MoneyTypeSlugSum, TotalCategory, ViewOptions } from '~/components/stat/types'
import { ViewOptionsSchema, defaultViewOptions } from '~/components/stat/config'
import type { Range } from '~/components/date/types'
import type { TotalReturns } from '~/components/amount/getTotal'
import type { TrnId } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import { getStyles } from '~/components/ui/getStyles'
import { markArea } from '~/components/stat/chart/utils'
import { seriesOptions } from '~/components/stat/chart/config2'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useIntervalRange } from '~/components/date/useIntervalRange'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { getTrnsIds } from '~/components/trns/getTrns'

const props = defineProps<{
  isQuickModal?: boolean
  preCategoriesIds?: CategoryId[]
  quickModalCategoryId?: CategoryId
  storageKey?: string
  trnsIds: TrnId[]
  type: MoneyTypeSlugSum
}>()

const filter = inject('filter') as FilterProvider
const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()
const categoriesStore = useCategoriesStore()

const maxRange = computed(() => trnsStore.getRange(props.trnsIds))

const intervalRange = useIntervalRange({
  key: `finapp-${props.quickModalCategoryId}-${props.type}${props.storageKey}-${JSON.stringify(filter?.catsIds?.value)}`,
  maxRange,
})

const newBaseStorageKey = computed(() => `finapp-${intervalRange.grouped.value.period}-${props.storageKey}-${JSON.stringify(filter?.catsIds?.value)}`)

const groupedPeriods = computed(() => intervalRange.getPeriodsWithEmptyTrnsIds({
  duration: intervalRange.grouped.value.duration || 1,
  period: intervalRange.grouped.value.period,
  range: intervalRange.range.value,
}))

const selectedType = ref<MoneyTypeSlugSum>('sum')
const onSelectType = (type: MoneyTypeSlugSum) => selectedType.value = type === selectedType.value ? 'sum' : type

// TODO: create function for this
const filteredTrnsIds = computed(() => {
  if (selectedType.value === 'income') {
    return getTrnsIds({
      trnTypes: [1, 2],
      trnsIds: props.trnsIds,
      trnsItems: trnsStore.items,
    })
  }

  if (selectedType.value === 'expense') {
    return getTrnsIds({
      trnTypes: [0, 2],
      trnsIds: props.trnsIds,
      trnsItems: trnsStore.items,
    })
  }

  return props.trnsIds
})

const isShowChart = useStorage<boolean>(`${newBaseStorageKey.value}-isShowChart`, true)
const isDayToday = computed(() => intervalRange.interval.value.period === 'day' && intervalRange.interval.value.duration === 1 && intervalRange.range.value.end < dayjs().endOf('day').valueOf())

/**
 * View Options
 */
const viewOptions = useStorage<ViewOptions>(`${newBaseStorageKey.value}-viewOptions`, { ...defaultViewOptions })
function changeViewOptions(newViewOptions: DeepPartial<ViewOptions>) {
  viewOptions.value = defu(newViewOptions, viewOptions.value)
}

onBeforeMount(() => {
  if (!ViewOptionsSchema.safeParse(viewOptions.value).success) {
    viewOptions.value = { ...defaultViewOptions }
  }
})

function sortCategoriesByAmount(a: TotalCategory, b: TotalCategory) {
  if (!a || !b)
    return 0

  // Sort positive values from biggest to smallest
  if (a.value >= 0 && b.value >= 0) {
    return b.value - a.value
  }
  // Sort negative values from smallest to biggest
  else if (a.value < 0 && b.value < 0) {
    return a.value - b.value
  }
  // Keep positive values before negative values
  else if (a.value >= 0 && b.value < 0) {
    return -1
  }
  // Keep negative values after positive values
  else {
    return 1
  }
}

function getCats(trnsIds: TrnId[], isGroupedByParent?: boolean, preCategoriesIds?: CategoryId[]) {
  const categoriesWithTrns = trnsIds?.reduce(
    (acc, trnId) => {
      let newCategoryId = trnsStore.items[trnId]?.categoryId
      if (!newCategoryId)
        return acc

      if (categoriesStore.transferCategoriesIds.includes(newCategoryId))
        return acc

      if (isGroupedByParent) {
        const trnBaseCategory: CategoryItem = categoriesStore.items[newCategoryId]

        newCategoryId = trnBaseCategory?.parentId === 0
          ? trnsStore.items[trnId]?.categoryId
          : trnBaseCategory?.parentId
      }

      acc[newCategoryId] ??= []
      acc[newCategoryId].push(trnId)
      return acc
    },
    {} as Record<CategoryId, TrnId[]>,
  )

  const categories = Object.keys(categoriesWithTrns)
    .reduce(
      (acc, categoryId) => {
        const totalInCategory = getTotalOfTrnsIds(categoriesWithTrns[categoryId]!)
        const trnsIdsInCategory = categoriesWithTrns[categoryId]!

        acc.push({
          id: categoryId,
          trnsIds: trnsIdsInCategory,
          value: totalInCategory.sum,
        })
        return acc
      },
      [] as TotalCategory[],
    )
    .sort((a, b) => sortCategoriesByAmount(a, b))

  if (preCategoriesIds && preCategoriesIds.length > 0) {
    preCategoriesIds.forEach((id) => {
      if (!categoriesWithTrns[id]) {
        categories.push({
          id,
          trnsIds: [],
          value: 0,
        })
      }
    })
  }
  return categories
}

function getSeries(
  total: TotalReturns[],
  type: MoneyTypeSlugSum,
  ranges: Range[],
) {
  // const types = type === 'sum' ? ['income', 'expense', 'sum'] : [type]
  const types = type === 'sum' ? ['expense', 'income'] : [type]

  return types.map((t, idx) => ({
    color: seriesOptions[t].color,
    cursor: 'default',
    data: total.map(i => t !== 'sum' ? Math.abs(i[t]) : i[t]),
    name: ranges[idx]?.start,
    type: seriesOptions[t].type,
  }))
}
/**
 * Chart
 */
const chartType = useStorage<ChartType>(`${newBaseStorageKey.value}-chartType`, 'bar')

const xAxisLabels = computed(() => groupedPeriods.value.map(r => +r.start) ?? [])

const groupedTrnsIds = computed(() => getPeriodsWithTrns(filteredTrnsIds.value, groupedPeriods.value))
const groupedTrnsIds2 = computed(() => getPeriodsWithTrns(props.trnsIds, groupedPeriods.value))
const groupedTrnsTotals = computed(() => groupedTrnsIds.value.map(g => getTotalOfTrnsIds(g)))

function getPeriodsWithTrns(trnsIds: TrnId[], ranges: Range[]) {
  const list = [...ranges.map(() => [])]

  trnsIds.forEach((trnId) => {
    const trnDate = trnsStore.items[trnId]?.date
    const idx = ranges.findIndex(r => trnDate! >= r.start && trnDate! <= r.end)
    list[idx]?.push(trnId)
  })

  return list
}

function onClickChart(idx: number) {
  const newPeriod = idx

  if (intervalRange.interval.value.selected === newPeriod) {
    intervalRange.interval.value.selected = -1
    return
  }

  intervalRange.interval.value.selected = newPeriod
}

const series = computed(() => {
  const series = getSeries(groupedTrnsTotals.value, props.type, groupedPeriods.value)

  if (intervalRange.interval.value.selected >= 0) {
    if (chartType.value !== 'bar') {
      const markAreaSeriesIdx = series.findIndex(s => s.markedArea === 'markedArea')

      if (markAreaSeriesIdx === -1) {
        series.push({
          data: [],
          markArea: markArea(groupedPeriods.value?.[intervalRange.interval.value.selected]?.start),
          markedArea: 'markedArea',
          type: 'bar',
        })
      }
      else {
        series[markAreaSeriesIdx] = {
          data: [],
          markArea: markArea(groupedPeriods.value?.[intervalRange.interval.value.selected]?.start),
          markedArea: 'markedArea',
          type: 'bar',
        }
      }
    }
    else {
      series[0].markArea = markArea(groupedPeriods.value?.[intervalRange.interval.value.selected]?.start)
    }
  }

  return series
})

const selectedTrnsIdsForTrnsList = computed(() => {
  if (intervalRange.interval.value.selected >= 0) {
    return trnsStore.getStoreTrnsIds({
      trnsIds: groupedTrnsIds.value[intervalRange.interval.value.selected],
    }, { includesChildCategories: false })
  }

  return trnsStore.getStoreTrnsIds({
    dates: {
      from: intervalRange.range.value.start,
      until: intervalRange.range.value.end,
    },
    trnsIds: filteredTrnsIds.value,
  }, { includesChildCategories: false })
})

const trnsIdsForTotals = computed(() => {
  if (intervalRange.interval.value.selected >= 0) {
    return trnsStore.getStoreTrnsIds({
      trnsIds: groupedTrnsIds2.value[intervalRange.interval.value.selected],
    }, { includesChildCategories: false })
  }

  return trnsStore.getStoreTrnsIds({
    dates: {
      from: intervalRange.range.value.start,
      until: intervalRange.range.value.end,
    },
    trnsIds: props.trnsIds,
  }, { includesChildCategories: false })
})

const totals = computed(() => getTotalOfTrnsIds(trnsIdsForTotals.value))

/**
 * Cats
 */
const cats = computed(() => getCats(selectedTrnsIdsForTrnsList.value ?? [], viewOptions.value.catsList.isGrouped, props.preCategoriesIds))
const catsRounded = computed(() => {
  let cats = []
  if (viewOptions.value.catsRound.isShowFavorites) {
    cats.push(...categoriesStore.favoriteCategoriesIds)
  }
  if (viewOptions.value.catsRound.isShowRecent) {
    cats.push(...categoriesStore.recentCategoriesIds)
  }

  cats = _sortby(cats, id => [
    categoriesStore.items[categoriesStore.items[id]?.parentId]?.name || false,
    categoriesStore.items[id]?.name,
  ])

  return getCats(selectedTrnsIdsForTrnsList.value ?? [], viewOptions.value.catsRound.isGrouped, cats)
})

const biggestCatNumber = computed(() => cats.value.at(0)?.value ?? 0)

const openedCats = useStorage<CategoryId[]>(`${newBaseStorageKey.value}-openedCats`, [])
const openedTrns = useStorage<CategoryId[]>(`${newBaseStorageKey.value}-openedTrns`, [])

const isShowDateSelector = ref(false)
const isShowTrns = ref(false)

const quickModalCategoryId = ref<CategoryId | false>(false)

function onClickCategory(categoryId: CategoryId) {
  if (props.preCategoriesIds) {
    useRouter().push(`/categories/${categoryId}`)
    return
  }

  quickModalCategoryId.value = quickModalCategoryId.value === categoryId
    ? false
    : categoryId
}

function set7Days(close?: () => void) {
  viewOptions.value.catsView = 'list'
  viewOptions.value.catsList.isGrouped = false
  viewOptions.value.catsList.isOpened = false
  intervalRange.viewConfig.value.isShowAll = false

  intervalRange.setRangeByPeriod({
    grouped: { duration: 1, period: 'day' },
    interval: { duration: 7, period: 'day' },
  })

  if (close) {
    close()
  }
}

function set30DaysMini(close?: () => void) {
  viewOptions.value.catsView = 'round'
  viewOptions.value.catsRound.isGrouped = false
  intervalRange.viewConfig.value.isShowAll = false

  intervalRange.setRangeByPeriod({
    grouped: { duration: 1, period: 'week' },
    interval: { duration: 30, period: 'day' },
  })

  if (close) {
    close()
  }
}

function set7DaysMini(close?: () => void) {
  viewOptions.value.catsView = 'round'
  viewOptions.value.catsRound.isGrouped = false
  intervalRange.viewConfig.value.isShowAll = false

  intervalRange.setRangeByPeriod({
    grouped: { duration: 1, period: 'day' },
    interval: { duration: 7, period: 'day' },
  })

  if (close) {
    close()
  }
}

function set12Months(close?: () => void) {
  viewOptions.value.catsView = 'list'
  viewOptions.value.catsList.isGrouped = true
  viewOptions.value.catsList.isOpened = false
  intervalRange.viewConfig.value.isShowAll = false

  if (close) {
    close()
  }
}

const quickModalTrnsIds = computed(() => {
  if (quickModalCategoryId.value) {
    return trnsStore.getStoreTrnsIds({
      categoriesIds: categoriesStore.getChildsIdsOrParent(quickModalCategoryId.value),
    })
  }

  return []
})
</script>

<template>
  <div>
    <!-- Stat -->
    <div class="@container/stat -max-w-4xl px-2 pt-2">
      <div class="">
        <div class="@2xl/stat:-max-w-md -xl:p-2 -xl:bg-item-9 md:max-w-md xl:rounded-xl">
          <!-- Chart -->
          <div
            v-if="isShowChart && (intervalRange.interval.value.duration !== 1 || intervalRange.interval.value.period !== 'day')"
            class="pb-2"
          >
            <div class="flex justify-between">
              <LazyStatChartTypeSelector v-model:chartType="chartType" />
              <LazyStatChartIntervals
                v-model:period="intervalRange.grouped.value.period"
                :range="intervalRange.range.value"
              />
            </div>

            <StatChartView2
              :xAxisLabels
              :chartType
              :period="intervalRange.grouped.value.period"
              :series
              @click="onClickChart"
            />
          </div>

          <div class="flex items-end justify-between gap-2">
            <UiTitle10 @click="isShowDateSelector = !isShowDateSelector">
              <DateViewRange
                :range="intervalRange.interval.value.selected !== -1 ? (groupedPeriods[intervalRange.interval.value.selected] ? groupedPeriods[intervalRange.interval.value.selected] : intervalRange.range.value) : intervalRange.range.value"
                :interval="intervalRange.interval.value"
              />
            </UiTitle10>

            <div class="flex gap-1">
              <DateNavHome
                v-if="intervalRange.interval.value.selected !== -1 || (intervalRange.range.value.start !== dayjs().subtract(intervalRange.interval.value.duration - 1, intervalRange.interval.value.period).startOf(intervalRange.interval.value.period).valueOf() && intervalRange.range.value.end !== dayjs().endOf(intervalRange.interval.value.period).valueOf() && !intervalRange.viewConfig.value.isShowAll)"
                :intervalRange
              />

              <DateNav
                v-if="intervalRange.range.value.start !== maxRange.start && intervalRange.range.value.end !== maxRange.end"
                :maxRange
                :intervalRange
              />

              <div
                v-if="intervalRange.interval.value.duration !== 1 || intervalRange.interval.value.period !== 'day'"
                :class="getStyles('item', ['link', 'bg', 'center', 'minh2', 'minw1', 'rounded'])"
                class="justify-center text-xl"
                @click="isShowChart = !isShowChart"
              >
                <Icon name="lucide:bar-chart-3" />
              </div>
            </div>
          </div>
        </div>

        <!-- Stat sum -->
        <div class="pt-3">
          <div
            v-if="props.type === 'sum'"
            class="flex flex-wrap justify-stretch gap-1 md:max-w-md"
          >
            <StatSum
              :amount="-totals.expense"
              :isActive="selectedType === 'expense'"
              :class="[getStyles('item', ['link', 'bg', 'padding3', 'center', 'minh', 'minw1', 'rounded'])]"
              class="grow"
              type="expense"
              @click="onSelectType('expense')"
            />
            <StatSum
              :amount="totals.income"
              :isActive="selectedType === 'income'"
              :class="[getStyles('item', ['link', 'bg', 'padding3', 'center', 'minh', 'minw1', 'rounded'])]"
              class="grow"
              type="income"
              @click="onSelectType('income')"
            />
            <StatSum
              :amount="totals.sum"
              :class="[getStyles('item', ['link', 'bg', 'padding3', 'center', 'minh', 'minw1', 'rounded'])]"
              class="grow"
              type="sum"
              @click="isShowTrns = true"
            />
          </div>

          <StatSum
            v-else
            :amount="props.type === 'income' ? totals[props.type] : -totals[props.type]"
            :class="[getStyles('item', ['-link', '-bg', 'padding3', 'center', 'minh', 'minw1', 'rounded'])]"
            :type="props.type"
          />
        </div>

        <!-- Content -->
        <div class="@3xl/stat:grid-cols-[2fr,1fr] grid gap-2 pt-3">
          <!-- Categories first level -->
          <UiToggle
            :storageKey="`${newBaseStorageKey}-cats-root`"
            :initStatus="true"
            openPadding="!pb-3"
          >
            <template #header="{ toggle, isShown }">
              <div class="flex items-center justify-between md:max-w-md">
                <UiTitle8 :isShown @click="toggle">
                  <!-- TODO: fix length -->
                  {{ $t('categories.title') }} {{ !isShown ? viewOptions.catsView === 'list' ? cats.length : catsRounded.length : '' }}
                </UiTitle8>

                <div
                  class="flex gap-1"
                >
                  <StatCategoriesButtons
                    v-if="isShown && viewOptions.catsView !== 'round'"
                    :viewOptions
                    class="-pr-1"
                    @changeViewOptions="changeViewOptions"
                  />

                  <!-- Round -->
                  <template v-if="viewOptions.catsView === 'round' && !viewOptions.catsRound.isGrouped">
                    <!-- Favorite -->
                    <UiItem1
                      @click="changeViewOptions({
                        catsRound: {
                          isShowFavorites: !viewOptions.catsRound.isShowFavorites,
                        },
                      })"
                    >
                      <Icon
                        name="material-symbols:favorite-outline-rounded"
                        :class="{ 'opacity-50': !viewOptions.catsRound.isShowFavorites }"
                      />
                    </UiItem1>

                    <!-- Recent -->
                    <UiItem1
                      @click="changeViewOptions({
                        catsRound: {
                          isShowRecent: !viewOptions.catsRound.isShowRecent,
                        },
                      })"
                    >
                      <Icon
                        name="material-symbols:history-rounded"
                        :class="{ 'opacity-50': !viewOptions.catsRound.isShowRecent }"
                      />
                    </UiItem1>
                  </template>

                  <!-- Folder -->
                  <UiItem1
                    v-if="viewOptions.catsList.isGrouped"
                    @click="changeViewOptions({
                      catsList: {
                        isOpened: !viewOptions.catsList.isOpened,
                      },
                    })"
                  >
                    <Icon
                      :name="viewOptions.catsList.isOpened ? 'fluent:folder-open-20-regular' : 'fluent:folder-20-regular'"
                      size="24"
                    />
                  </UiItem1>

                  <!-- List -->
                  <UiItem1
                    v-if="viewOptions.catsView === 'list'"
                    @click="changeViewOptions({
                      catsList: {
                        isGrouped: !viewOptions.catsList.isGrouped,
                      },
                    })"
                  >
                    <Icon
                      :name="viewOptions.catsList.isGrouped ? 'material-symbols-light:background-dot-large-outline-sharp' : 'material-symbols-light:background-dot-small-outline-sharp'"
                      size="24"
                    />
                  </UiItem1>

                  <!-- Round -->
                  <UiItem1
                    v-if="viewOptions.catsView === 'round'"
                    @click="changeViewOptions({
                      catsRound: {
                        isGrouped: !viewOptions.catsRound.isGrouped,
                      },
                    })"
                  >
                    <Icon
                      :name="viewOptions.catsRound.isGrouped ? 'material-symbols-light:background-dot-large-outline-sharp' : 'material-symbols-light:background-dot-small-outline-sharp'"
                      size="24"
                    />
                  </UiItem1>

                  <UiItem1
                    @click="changeViewOptions({
                      catsView: viewOptions.catsView === 'list' ? 'round' : 'list',
                    })"
                  >
                    <Icon
                      :name="viewOptions.catsView === 'list' ? 'lucide:layout-grid' : 'lucide:layout-list'"
                    />
                  </UiItem1>
                </div>
              </div>
            </template>

            <!-- List -->
            <div
              v-if="cats.length > 0 && viewOptions.catsView === 'list'"
              :class="{
                'grid gap-2 px-0': viewOptions.catsList.isGrouped && viewOptions.catsList.isOpened,
                'md:max-w-md': !viewOptions.catsList.isGrouped || !viewOptions.catsList.isOpened,
                'grid gap-1': viewOptions.catsList.isItemsBg,
              }"
              class="pt-2"
            >
              <StatLinesItemLine
                v-for="item in cats"
                :key="item.id"
                :item
                :viewOptions
                :biggestCatNumber
                :isHideDots="viewOptions.catsList.isOpened"
                :lineWidth="((viewOptions.catsList.isGrouped && viewOptions.catsList.isOpened) || viewOptions.catsList.isLines) ? 0 : 1"
                :isActive="openedCats.includes(item.id) || openedTrns.includes(item.id)"
                :class="{ 'bg-item-9 -border border-item-5 overflow-hidden rounded-lg': viewOptions.catsList.isGrouped && viewOptions.catsList.isOpened }"
                @click="onClickCategory"
                @onClickIcon="filter.toggleCategoryId(item.id)"
              >
                <div
                  v-if="viewOptions.catsList.isGrouped && viewOptions.catsList.isOpened"
                  class="-border-b border-item-5 flex -grid flex-wrap gap-1 pb-3 pl-2 pt-1"
                >
                  <StatLinesItemRound
                    v-for="itemInside in getCats(item.trnsIds)"
                    :key="itemInside.id"
                    :item="itemInside"
                    :selectedRange="groupedPeriods[intervalRange.interval.value.selected]"
                    :intervalRange
                    @click="onClickCategory"
                  />
                </div>
              </StatLinesItemLine>
            </div>

            <!-- Rounded view -->
            <div
              v-if="catsRounded.length > 0 && viewOptions.catsView === 'round'"
              class="@3xl/stat:gap-2 flex flex-wrap gap-1 pl-1 pt-2"
            >
              <StatLinesItemRound
                v-for="item in catsRounded"
                :key="item.id"
                :item
                :biggestCatNumber
                :selectedRange="groupedPeriods[intervalRange.interval.value.selected]"
                :intervalRange
                :isActive="openedCats.includes(item.id) || openedTrns.includes(item.id)"
                @click="onClickCategory"
              />
            </div>
          </UiToggle>

          <UiToggle
            v-if="selectedTrnsIdsForTrnsList.length > 0"
            :storageKey="`${newBaseStorageKey}-${props.type}trns-all`"
            :initStatus="true"
            class="min-w-80 md:max-w-md"
          >
            <template #header="{ toggle, isShown }">
              <div class="flex items-center justify-between">
                <UiTitle8 :isShown @click="toggle">
                  {{ $t('trns.title') }} {{ (!isShown && selectedTrnsIdsForTrnsList.length > 0) ? selectedTrnsIdsForTrnsList.length : '' }}
                </UiTitle8>
              </div>
            </template>

            <TrnsList
              :isHideDates="isDayToday"
              :isShowGroupSum="!isDayToday"
              :trnsIds="selectedTrnsIdsForTrnsList"
              class="py-1"
              isShowFilterByDesc
              isShowFilterByType
            />
          </UiToggle>

          <TrnsNoTrns v-if="selectedTrnsIdsForTrnsList.length === 0" />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <Teleport to="#teleports">
      <StatDateSelectorModal
        v-if="isShowDateSelector"
        :intervalRange="intervalRange"
        :maxRange="maxRange"
        @set7Days="set7Days"
        @set7DaysMini="set7DaysMini"
        @set30DaysMini="set30DaysMini"
        @set12Months="set12Months"
        @onClose="isShowDateSelector = false"
      />

      <!-- Categories stat -->
      <BaseBottomSheet2
        v-if="quickModalCategoryId"
        isShow
        drugClassesCustom="bg-foreground-1 lg:w-[calc(100%-120px)] max-w-md"
        @closed="quickModalCategoryId = false"
      >
        <template #handler="{ close }">
          <div class="relative z-20">
            <BaseBottomSheetHandler />
            <BaseBottomSheetClose @onClick="close" />
          </div>
        </template>

        <template #default="">
          <div class="scrollerBlock grid h-[98dvh] content-start overflow-hidden overflow-y-auto">
            <CategoriesPageHeader
              :category="categoriesStore.items[quickModalCategoryId]"
              :parentCategory="categoriesStore.items?.[categoriesStore.items[quickModalCategoryId]?.parentId]"
              class="bg-foreground-5 sticky top-0 z-10"
            />

            <StatMiniItem
              :quickModalCategoryId
              :storageKey="`${props.storageKey}sum-in-${quickModalCategoryId}`"
              :trnsIds="quickModalTrnsIds"
              class="-max-w-2xl"
              isQuickModal
              type="sum"
            />
          </div>
        </template>
      </BaseBottomSheet2>

      <!-- Trns -->
      <BaseBottomSheet2
        v-if="selectedTrnsIdsForTrnsList && selectedTrnsIdsForTrnsList?.length > 0 && isShowTrns"
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
            :trnsIds="selectedTrnsIdsForTrnsList"
            class="p-2"
            isShowFilterByDesc
            isShowFilterByType
            isShowGroupSum
            isShowHeader
          />
        </div>
      </BaseBottomSheet2>
    </Teleport>
  </div>
</template>
