<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import _sortby from 'lodash.sortby'
import dayjs from 'dayjs'
import defu from 'defu'
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { DeepPartial } from '~~/utils/types'
import type { FilterProvider } from '~/components/filter/types'
import type { MiniItemConfig, MoneyTypeSlugSum, TotalCategory, ViewOptions } from '~/components/stat/types'
import type { Range } from '~/components/date/types'
import type { TotalReturns } from '~/components/amount/getTotal'
import type { TrnId } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import { ViewOptionsSchema, defaultViewOptions } from '~/components/stat/config'
import { getTrnsIds } from '~/components/trns/getTrns'
import { markArea } from '~/components/stat/chart/utils'
import { seriesOptions } from '~/components/stat/chart/config2'
import { sortCategoriesByAmount } from '~/components/stat/utils'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useIntervalRange } from '~/components/date/useIntervalRange'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const props = defineProps<{
  config: MiniItemConfig
  isQuickModal?: boolean
  preCategoriesIds?: CategoryId[]
  quickModalCategoryId?: CategoryId
  storageKey?: string
  trnsIds: TrnId[]
  type: MoneyTypeSlugSum
}>()

const emit = defineEmits<{
  updateConfig: [key: keyof MiniItemConfig, value: MiniItemConfig[keyof MiniItemConfig]]
}>()

const { t } = useI18n()
const filter = inject('filter') as FilterProvider
const trnsStore = useTrnsStore()
const trnsFormStore = useTrnFormStore()
const { getTotalOfTrnsIds } = useAmount()
const categoriesStore = useCategoriesStore()

const isShowDateSelector = ref(false)
const isShowTrns = ref(false)

const maxRange = computed(() => trnsStore.getRange(props.trnsIds))

const intervalRange = useIntervalRange({
  key: `finapp-${props.quickModalCategoryId}-${props.type}${props.storageKey}-${JSON.stringify(filter?.catsIds?.value)}`,
  maxRange,
})

provide('intervalRange', intervalRange)

const newBaseStorageKey = computed(() => `finapp-${intervalRange.grouped.value.period}-${props.storageKey}-${JSON.stringify(filter?.catsIds?.value)}`)

const groupedPeriods = computed<Range[]>(() => intervalRange.getPeriodsWithEmptyTrnsIds({
  duration: intervalRange.grouped.value.duration || 1,
  period: intervalRange.grouped.value.period,
  range: intervalRange.range.value,
}))

const selectedType = ref<MoneyTypeSlugSum>('sum')
function onSelectType(type: MoneyTypeSlugSum) {
  if (type === 'sum') {
    isShowTrns.value = !isShowTrns.value
    return
  }

  selectedType.value = type === selectedType.value ? 'sum' : type
}

// TODO: create function for this
const filteredTrnsIds = computed(() => {
  if (selectedType.value === 'income') {
    return getTrnsIds({
      trnsIds: props.trnsIds,
      trnsItems: trnsStore.items,
      trnTypes: [1, 2],
    })
  }

  if (selectedType.value === 'expense') {
    return getTrnsIds({
      trnsIds: props.trnsIds,
      trnsItems: trnsStore.items,
      trnTypes: [0, 2],
    })
  }

  return props.trnsIds
})

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
    trnsFormStore.values.date = dayjs().valueOf()
  }
  else {
    intervalRange.interval.value.selected = newPeriod

    // Set date for trnForm
    const day = groupedPeriods.value?.[intervalRange.interval.value.selected]?.start
    if (intervalRange.grouped.value.period === 'day' && intervalRange.grouped.value.duration === 1 && day) {
      trnsFormStore.values.date = day
    }
  }
}

const series = computed(() => {
  const series = getSeries(groupedTrnsTotals.value, props.type, groupedPeriods.value)

  if (intervalRange.interval.value.selected >= 0) {
    if (props.config?.chartType !== 'bar') {
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
      categoriesIds: filter?.catsIds?.value,
      trnsIds: groupedTrnsIds.value[intervalRange.interval.value.selected],
      walletsIds: filter?.walletsIds?.value,
    }, { includesChildCategories: false })
  }

  return trnsStore.getStoreTrnsIds({
    categoriesIds: filter?.catsIds?.value,
    dates: {
      from: intervalRange.range.value.start,
      until: intervalRange.range.value.end,
    },
    trnsIds: filteredTrnsIds.value,
    walletsIds: filter?.walletsIds?.value,
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

const totals = computed<TotalReturns>(() => getTotalOfTrnsIds(trnsIdsForTotals.value))

/**
 * Cats
 */
const cats = computed(() => {
  let cats: CategoryId[] = [...(props.preCategoriesIds ?? [])]
  if (!viewOptions.value.catsList.isGrouped && viewOptions.value.catsRound.isShowFavorites) {
    cats.push(...categoriesStore.favoriteCategoriesIds)
  }
  if (!viewOptions.value.catsList.isGrouped && viewOptions.value.catsRound.isShowRecent) {
    cats.push(...categoriesStore.recentCategoriesIds)
  }

  cats = _sortby(cats, (id: CategoryId) => [
    categoriesStore.items[categoriesStore.items[id]?.parentId]?.name || false,
    categoriesStore.items[id]?.name,
  ])

  return getCats(selectedTrnsIdsForTrnsList.value ?? [], viewOptions.value.catsList.isGrouped, cats)
})

const catsRounded = computed(() => {
  let cats: CategoryId[] = [...(props.preCategoriesIds ?? [])]
  if (!viewOptions.value.catsRound.isGrouped && viewOptions.value.catsRound.isShowFavorites) {
    cats.push(...categoriesStore.favoriteCategoriesIds)
  }
  if (!viewOptions.value.catsRound.isGrouped && viewOptions.value.catsRound.isShowRecent) {
    cats.push(...categoriesStore.recentCategoriesIds)
  }

  cats = _sortby(cats, (id: CategoryId) => [
    categoriesStore.items[categoriesStore.items[id]?.parentId]?.name || false,
    categoriesStore.items[id]?.name,
  ])

  return getCats(selectedTrnsIdsForTrnsList.value ?? [], viewOptions.value.catsRound.isGrouped, cats)
})

const biggestCatNumber = computed(() => cats.value.at(0)?.value ?? 0)

const openedCats = useStorage<CategoryId[]>(`${newBaseStorageKey.value}-openedCats`, [])
const openedTrns = useStorage<CategoryId[]>(`${newBaseStorageKey.value}-openedTrns`, [])

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
        <!-- Chart -->
        <StatChartWrap
          :config="props.config"
          :groupedPeriods
          :isShowDateSelector
          :maxRange
          :series
          :xAxisLabels
          @onClickChart="onClickChart"
          @update:isShowDateSelector="(value: boolean) => isShowDateSelector = value"
          @updateConfig="(key, value) => emit('updateConfig', key, value)"
        />

        <!-- Stat sum -->
        <StatSumWrap
          :type="props.type"
          :selectedType
          :totals
          @onClickSum="onSelectType"
          @updateConfig="(key, value) => emit('updateConfig', key, value)"
        />

        <div class="grid gap-3 py-4">
          <div
            ref="longPressRef1" class="bg-item-4 p-4"
          >
            Long press here 1
          </div>
          <div ref="longPressRef2" class="bg-item-4 p-4">
            Long press here 2
          </div>
          <div ref="longPressRef3" class="bg-item-4 p-4">
            Long press here 3
          </div>
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
                <UiTitle81 :isShown @click="toggle">
                  <!-- {{ t('categories.title') }} {{ !isShown ? viewOptions.catsView === 'list' ? cats.length : catsRounded.length : '' }} -->
                  {{ t('categories.title') }}
                  <span class="pl-1 text-sm">{{ viewOptions.catsView === 'list' ? cats.length : catsRounded.length }}</span>
                </UiTitle81>

                <div
                  v-if="isShown"
                  class="flex gap-1"
                >
                  <StatCategoriesButtons
                    :viewOptions
                    class="-pr-1"
                    @changeViewOptions="changeViewOptions"
                  />
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
                :biggestCatNumber
                :class="{ 'bg-item-9 overflow-hidden rounded-lg': viewOptions.catsList.isGrouped && viewOptions.catsList.isOpened }"
                :intervalRange
                :isActive="openedCats.includes(item.id) || openedTrns.includes(item.id)"
                :isHideDots="viewOptions.catsList.isOpened"
                :item
                :lineWidth="((viewOptions.catsList.isGrouped && viewOptions.catsList.isOpened) || viewOptions.catsList.isLines) ? 0 : 1"
                :selectedRange="groupedPeriods[intervalRange.interval.value.selected]"
                :viewOptions
                @click="filter.toggleCategoryId(item.id)"
                @onClickIcon="onClickCategory"
              >
                <div
                  v-if="viewOptions.catsList.isGrouped && viewOptions.catsList.isOpened"
                  class="flex flex-wrap gap-1 pb-3 pl-2 pt-1"
                >
                  <StatLinesItemRound
                    v-for="itemInside in getCats(item.trnsIds)"
                    :key="itemInside.id"
                    :item="itemInside"
                    :selectedRange="groupedPeriods[intervalRange.interval.value.selected]"
                    :intervalRange
                    @click="onClickCategory"
                  />

                  <StatLinesItemLine
                    v-for="itemInside in getCats(item.trnsIds)"
                    :key="itemInside.id"
                    :biggestCatNumber
                    :class="{ 'bg-item-9 overflow-hidden rounded-lg': viewOptions.catsList.isGrouped && viewOptions.catsList.isOpened }"
                    :intervalRange
                    :isActive="openedCats.includes(itemInside.id) || openedTrns.includes(itemInside.id)"
                    :isHideDots="viewOptions.catsList.isOpened"
                    :item="itemInside"
                    :lineWidth="((viewOptions.catsList.isGrouped && viewOptions.catsList.isOpened) || viewOptions.catsList.isLines) ? 0 : 1"
                    :selectedRange="groupedPeriods[intervalRange.interval.value.selected]"
                    :viewOptions
                    @click="filter.toggleCategoryId(itemInside.id)"
                    @onClickIcon="onClickCategory"
                  />
                </div>
              </StatLinesItemLine>
            </div>

            <!-- Rounded view -->
            <div
              v-if="catsRounded.length > 0 && viewOptions.catsView === 'round'"
              class="@3xl/stat:gap-2 flex flex-wrap gap-1 pl-1 pt-2 md:max-w-md"
            >
              <StatLinesItemRound2
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
                  {{ t('trns.title') }} {{ (!isShown && selectedTrnsIdsForTrnsList.length > 0) ? selectedTrnsIdsForTrnsList.length : '' }}
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
            <CategoriesHeader
              :category="categoriesStore.items[quickModalCategoryId]"
              :parentCategory="categoriesStore.items?.[categoriesStore.items[quickModalCategoryId]?.parentId]"
              class="bg-foreground-5 sticky top-0 z-10"
            />

            <StatItem
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
