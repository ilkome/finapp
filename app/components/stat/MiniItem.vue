<script setup lang="ts">
import dayjs from 'dayjs'
import { z } from 'zod'
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '../categories/types'
import type { ChartType } from '~/components/stat/chart/types'
import type { FilterProvider } from '~/components/filter/useFilter'
import type { FullDuration, Interval, Range } from '~/components/date/types'
import { type MoneyTypeSlugSum, type ViewOptions, ViewOptionsSchema, defaultViewOptions } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import { getStyles } from '~/components/ui/getStyles'
import { markArea } from '~/components/stat/chart/utils'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useDateRange } from '~/components/date/useDateRange'
import { useNewStat } from '~/components/stat/useNewStat'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  isQuickModal?: boolean
  preCategoriesIds?: CategoryId[]
  quickModalCategoryId?: CategoryId
  storageKey?: string
  trnsIds: TrnId[]
  type: MoneyTypeSlugSum
}>()

const filter = inject('filter') as FilterProvider
const { t } = useI18n()
const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()
const { getCats, getSeries } = useNewStat()
const categoriesStore = useCategoriesStore()
const { addInterval, getPeriodsWithEmptyTrnsIds, grouped, interval, range, removeInterval, setRange, setRangeByCalendar, setRangeByPeriod } = useDateRange({
  key: `finapp-${props.type}${props.storageKey}`,
})

const newBaseStorageKey = computed(() => `finapp-${grouped.value.period}-${props.storageKey}-${JSON.stringify(filter.catsIds.value)}`)

const groupedPeriods = computed(() => getPeriodsWithEmptyTrnsIds({
  duration: grouped.value.duration || 1,
  period: grouped.value.period,
  range: range.value,
}))

const maxRange = computed(() => useTrnsStore().getRange(props.trnsIds))

const selectedType = ref<MoneyTypeSlugSum>('sum')
const onSelectType = (type: MoneyTypeSlugSum) => selectedType.value = type === selectedType.value ? 'sum' : type

// TODO: create function for this
const filteredTrnsIds = computed(() => {
  if (selectedType.value === 'income') {
    return props.trnsIds
      .filter(trnId => trnsStore.items[trnId].type === 1 || trnsStore.items[trnId].type === 2)
      .sort((a, b) => trnsStore.items[b].date - trnsStore.items[a].date)
  }

  if (selectedType.value === 'expense') {
    return props.trnsIds
      .filter(trnId => trnsStore.items[trnId].type === 0 || trnsStore.items[trnId].type === 2)
      .sort((a, b) => trnsStore.items[b].date - trnsStore.items[a].date)
  }

  return props.trnsIds
})

const isShowChart = useStorage<boolean>(`${newBaseStorageKey.value}-isShowChart`, true)
const isDayToday = computed(() => interval.value.period === 'day' && interval.value.duration === 1 && range.value.end < dayjs().endOf('day').valueOf())

const viewOptions = useStorage<ViewOptions>(`${newBaseStorageKey.value}-viewOptions`, { ...defaultViewOptions })
onBeforeMount(() => {
  if (!ViewOptionsSchema.safeParse(viewOptions.value).success) {
    viewOptions.value = { ...defaultViewOptions }
  }
})

const chartType = useStorage<ChartType>(`${newBaseStorageKey.value}-chartType`, 'bar')

const xAxisLabels = computed(() => groupedPeriods.value.map(r => +r.start) ?? [])

const groupedTrnsIds = computed(() => getPeriodsWithTrns(filteredTrnsIds.value, groupedPeriods.value))
const groupedTrnsIds2 = computed(() => getPeriodsWithTrns(props.trnsIds, groupedPeriods.value))
const groupedTrnsTotals2 = computed(() => groupedTrnsIds.value.map(g => getTotalOfTrnsIds(g)))

function getPeriodsWithTrns(trnsIds: TrnId[], ranges: Range[]) {
  const list = [...ranges.map(() => [])]

  trnsIds.forEach((trnId) => {
    const trnDate = trnsStore.items[trnId]?.date
    const idx = ranges.findIndex(r => trnDate! >= r.start && trnDate! <= r.end)
    list[idx]?.push(trnId)
  })

  return list
}

const selectedPeriod = useStorage<number>(`${newBaseStorageKey.value}-selectedPeriod`, -1)

watch(range, () => {
  selectedPeriod.value = -1
})

function onClickChart(idx: number) {
  const newPeriod = idx

  if (selectedPeriod.value === newPeriod) {
    selectedPeriod.value = -1
    return
  }

  selectedPeriod.value = newPeriod
}

const series = computed(() => {
  const series = getSeries(groupedTrnsTotals2.value, props.type, groupedPeriods.value)

  if (selectedPeriod.value >= 0) {
    if (chartType.value !== 'bar') {
      const markAreaSeriesIdx = series.findIndex(s => s.markedArea === 'markedArea')

      if (markAreaSeriesIdx === -1) {
        series.push({
          data: [],
          markArea: markArea(groupedPeriods.value?.[selectedPeriod.value]?.start),
          markedArea: 'markedArea',
          type: 'bar',
        })
      }
      else {
        series[markAreaSeriesIdx] = {
          data: [],
          markArea: markArea(groupedPeriods.value?.[selectedPeriod.value]?.start),
          markedArea: 'markedArea',
          type: 'bar',
        }
      }
    }
    else {
      series[0].markArea = markArea(groupedPeriods.value?.[selectedPeriod.value]?.start)
    }
  }

  return series
})

const selectedTrnsIdsForTrnsList = computed(() => {
  if (selectedPeriod.value >= 0) {
    return trnsStore.getStoreTrnsIds({
      trnsIds: groupedTrnsIds.value[selectedPeriod.value],
    }, { includesChildCategories: false })
  }

  return trnsStore.getStoreTrnsIds({
    dates: {
      from: range.value.start,
      until: range.value.end,
    },
    trnsIds: filteredTrnsIds.value,
  }, { includesChildCategories: false })
})

const trnsIdsForTotals = computed(() => {
  if (selectedPeriod.value >= 0) {
    return trnsStore.getStoreTrnsIds({
      trnsIds: groupedTrnsIds2.value[selectedPeriod.value],
    }, { includesChildCategories: false })
  }

  return trnsStore.getStoreTrnsIds({
    dates: {
      from: range.value.start,
      until: range.value.end,
    },
    trnsIds: props.trnsIds,
  }, { includesChildCategories: false })
})

const totals = computed(() =>
  getTotalOfTrnsIds(trnsIdsForTotals.value),
)

/**
 * Cats
 */
const cats = computed(() => getCats(selectedTrnsIdsForTrnsList.value ?? [], viewOptions.value.catsList.isGrouped, props.preCategoriesIds))
const catsRounded = computed(() => getCats(selectedTrnsIdsForTrnsList.value ?? [], viewOptions.value.catsRound.isGrouped))

const biggestCatNumber = computed(() => cats.value.at(0)?.value ?? 0)

const openedCats = useStorage<CategoryId[]>(`${newBaseStorageKey.value}-openedCats`, [])
const openedTrns = useStorage<CategoryId[]>(`${newBaseStorageKey.value}-openedTrns`, [])

function onClickCategoryRounded(categoryId: CategoryId) {
  filter.clearFilter()
  filter.setCategoryId(categoryId)
}

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

  setRangeByPeriod({
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

  setRangeByPeriod({
    grouped: { duration: 1, period: 'month' },
    interval: { duration: 12, period: 'month' },
  })

  if (close) {
    close()
  }
}
</script>

<template>
  <div>
    <!-- Stat -->
    <div class="@container/stat px-2 pt-2 -max-w-4xl">
      <div class="">
        <div class="@2xl/stat:-max-w-md md:max-w-md -xl:p-2 -xl:bg-item-9 xl:rounded-xl">
          <!-- Chart -->
          <div
            v-if="isShowChart && (interval.duration !== 1 || interval.period !== 'day')"
            class="pb-2"
          >
            <div class="flex justify-between">
              <!-- Chart types -->
              <div class="flex gap-0">
                <DateLinkItem2 :isActive="chartType === 'bar'" @click="chartType = 'bar'">
                  {{ t('chart.types.bar') }}
                </DateLinkItem2>

                <DateLinkItem2 :isActive="chartType === 'line'" @click="chartType = 'line'">
                  {{ t('chart.types.line') }}
                </DateLinkItem2>
              </div>

              <div class="flex gap-0">
                <DateLinkItem2
                  v-if="grouped.period !== 'day'"
                  :isActive="grouped.period === 'day'"
                  @click="grouped.period = 'day'"
                >
                  {{ $t(`dates.day.simple`) }}
                </DateLinkItem2>

                <DateLinkItem2
                  v-if="dayjs(range.end).diff(range.start, 'day') >= 7"
                  :isActive="grouped.period === 'week'"
                  @click="grouped.period = 'week'"
                >
                  {{ $t(`dates.week.simple`) }}
                </DateLinkItem2>

                <DateLinkItem2
                  v-if="dayjs(range.end).diff(range.start, 'day') >= 30"
                  :isActive="grouped.period === 'month'"
                  @click="grouped.period = 'month'"
                >
                  {{ $t(`dates.month.simple`) }}
                </DateLinkItem2>
              </div>
            </div>

            <StatChartView2
              :xAxisLabels
              :chartType
              :period="grouped.period"
              :series
              class="!h-40 px-2"
              @click="onClickChart"
            />
          </div>

          <div class="flex items-end justify-between gap-2">
            <UiTitle10 @click="isShowDateSelector = !isShowDateSelector">
              <DateViewRange
                :range="selectedPeriod !== -1 ? groupedPeriods[selectedPeriod] : range"
                :interval
              />
            </UiTitle10>

            <div class="flex gap-1">
              <DateNavHome
                v-if="selectedPeriod !== -1 || range.start !== dayjs().subtract(interval.duration - 1, interval.period).startOf(interval.period).valueOf() && range.end !== dayjs().endOf(interval.period).valueOf()"
                :interval
                @setRange="setRange"
              />

              <DateNav
                v-if="range.start !== maxRange.start && range.end !== maxRange.end"
                :interval
                :maxRange
                :range
                @setRange="setRange"
              />

              <div
                v-if="interval.duration !== 1 || interval.period !== 'day'"
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
            class="flex gap-1 flex-wrap justify-stretch md:max-w-md"
          >
            <StatSum
              :amount="-totals.expense"
              :isActive="selectedType === 'expense'"
              :class="[...getStyles('item', ['link', 'bg', 'padding3', 'center', 'minh', 'minw1', 'rounded'])]"
              class="grow"
              type="expense"
              @click="onSelectType('expense')"
            />
            <StatSum
              :amount="totals.income"
              :isActive="selectedType === 'income'"
              :class="[...getStyles('item', ['link', 'bg', 'padding3', 'center', 'minh', 'minw1', 'rounded'])]"
              class="grow"
              type="income"
              @click="onSelectType('income')"
            />
            <StatSum
              :amount="totals.sum"
              :class="[...getStyles('item', ['link', 'bg', 'padding3', 'center', 'minh', 'minw1', 'rounded'])]"
              class="grow"
              type="sum"
              @click="isShowTrns = true"
            />
          </div>

          <StatSum
            v-else
            :amount="props.type === 'income' ? totals[props.type] : -totals[props.type]"
            :class="[...getStyles('item', ['-link', '-bg', 'padding3', 'center', 'minh', 'minw1', 'rounded'])]"
            :type="props.type"
          />
        </div>

        <!-- Content -->
        <div class="grid @3xl/stat:grid-cols-[2fr,1fr] gap-2 pt-3">
          <!-- Categories first level -->
          <UiToggle
            v-if="(
              isQuickModal
                ? (cats.length > 1 || (props.quickModalCategoryId && categoriesStore.hasChildren(props.quickModalCategoryId)))
                : selectedTrnsIdsForTrnsList && selectedTrnsIdsForTrnsList?.length > 0
            )"
            :storageKey="`${newBaseStorageKey}-cats-root`"
            :initStatus="true"
            openPadding="!pb-3"
          >
            <template #header="{ toggle, isShown }">
              <div class="flex items-center justify-between md:max-w-md">
                <UiTitle8 :isShown @click="toggle">
                  {{ $t('categories.title') }} {{ !isShown ? viewOptions.catsView === 'list' ? cats.length : catsRounded.length : '' }}
                </UiTitle8>

                <StatCategoriesButtons
                  v-if="isShown"
                  :viewOptions
                  class="-pr-1"
                  @changeViewOptions="(options: ViewOptions) => viewOptions = options"
                />
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
                :lineWidth="(viewOptions.catsList.isGrouped && viewOptions.catsList.isOpened) || viewOptions.catsList.isLines ? 0 : 1"
                :isActive="openedCats.includes(item.id) || openedTrns.includes(item.id)"
                :class="{ 'bg-item-9 rounded-lg -border border-item-5 overflow-hidden': viewOptions.catsList.isGrouped && viewOptions.catsList.isOpened }"
                @click="onClickCategory"
                @onClickIcon="onClickCategoryRounded"
              >
                <div
                  v-if="viewOptions.catsList.isGrouped && viewOptions.catsList.isOpened"
                  class="pl-2 pt-1 -grid flex flex-wrap gap-1 -border-b border-item-5 pb-3"
                >
                  <StatLinesItemRound2
                    v-for="itemInside in getCats(item.trnsIds)"
                    :key="itemInside.id"
                    :item="itemInside"
                    class="bg-item-3"
                    @click="onClickCategory"
                  />
                </div>
              </StatLinesItemLine>
            </div>

            <div
              v-if="cats.length > 0 && viewOptions.catsView === 'round'"
              class="flex flex-wrap gap-1 @3xl/stat:gap-2 pt-2 pl-2"
            >
              <StatLinesItemRound
                v-for="item in catsRounded"
                :key="item.id"
                :item
                :biggestCatNumber
                :isActive="openedCats.includes(item.id) || openedTrns.includes(item.id)"
                @click="onClickCategoryRounded"
              />
            </div>
          </UiToggle>

          <UiToggle
            v-if="selectedTrnsIdsForTrnsList.length > 0"
            :storageKey="`${newBaseStorageKey}-${props.type}trns-all`"
            :initStatus="true"
            class="min-w-80"
          >
            <template #header="{ toggle, isShown }">
              <div class="flex items-center justify-between">
                <UiTitle8 :isShown @click="toggle">
                  {{ $t('trns.title') }} {{ (!isShown && selectedTrnsIdsForTrnsList.length > 0) ? selectedTrnsIdsForTrnsList.length : '' }}
                </UiTitle8>
              </div>
            </template>

            <TrnsList
              :trnsIds="selectedTrnsIdsForTrnsList"
              class="px-0 py-1 md:max-w-md"
              :isHideDates="isDayToday"
              isShowFilterByDesc
              isShowFilterByType
              :isShowGroupSum="!isDayToday"
            />
          </UiToggle>

          <TrnsNoTrns v-if="selectedTrnsIdsForTrnsList.length === 0" />
        </div>
      </div>
    </div>

    <Teleport to="#teleports">
      <!-- Date Selector -->
      <BaseBottomSheet2
        v-if="isShowDateSelector"
        isShow
        drugClassesCustom="bg-foreground-1 max-w-xl grid md:mb-12 max-h-[98dvh]"
        @closed="isShowDateSelector = false"
      >
        <template #handler="{ close }">
          <BaseBottomSheetHandler />
          <BaseBottomSheetClose @onClick="close" />
        </template>

        <template #default="{ close }">
          <div class="scrollerBlock grid gap-2 p-3 overflow-hidden max-h-[98dvh] overflow-y-auto">
            <UiTitle9>{{ t('dates.select') }}</UiTitle9>

            <div class="grid items-start gap-8">
              <div class="flex gap-2">
                <DateLinkItem @click="set7Days(close)">
                  7 days
                </DateLinkItem>
                <DateLinkItem @click="set12Months(close)">
                  12 months
                </DateLinkItem>
              </div>

              <div class="grid gap-2">
                <div class="flex gap-2">
                  <DateLinkItem @click="removeInterval">
                    -
                  </DateLinkItem>

                  <DateLinkItemNoBg>{{ `Last ${interval.duration} ${interval.period}` }}</DateLinkItemNoBg>

                  <DateLinkItem @click="addInterval">
                    +
                  </DateLinkItem>
                </div>

                <div class="flex flex-wrap gap-2">
                  <DateRanges
                    :interval
                    :maxRange
                    @setRange="setRange"
                    @setRangeByPeriod="(d: FullDuration) => { setRangeByPeriod(d); close() }"
                  />
                </div>

                <div class="flex flex-wrap gap-2">
                  <DateRanges2
                    :interval
                    :maxRange
                    @setRangeByPeriod="(d: FullDuration) => { setRangeByPeriod(d); close() }"
                  />
                </div>

                <DateDaySelector
                  :groupBy="grouped.period"
                  :range
                  @setRangeByCalendar="setRangeByCalendar"
                />
              </div>

              <div class="grid gap-1">
                <div class="flex gap-2">
                  <DateLinkItem @click="--grouped.duration">
                    -
                  </DateLinkItem>

                  <DateLinkItemNoBg>{{ `Grouped by ${grouped.duration} ${grouped.period}` }}</DateLinkItemNoBg>

                  <DateLinkItem @click="++grouped.duration">
                    +
                  </DateLinkItem>
                </div>

                <div class="flex flex-wrap gap-2">
                  <DateIntervals
                    :grouped
                    @onSelect="(pd: Interval) => { grouped = pd; close() }"
                  />
                </div>
              </div>

              <UiButtonBlue @click="close">
                {{ $t('close') }}
              </UiButtonBlue>
            </div>
          </div>
        </template>
      </BaseBottomSheet2>

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
          <div class="grid h-[98dvh] content-start overflow-hidden overflow-y-auto scrollerBlock">
            <CategoriesPageHeader
              :category="categoriesStore.items[quickModalCategoryId]"
              :parentCategory="categoriesStore.items?.[categoriesStore.items[quickModalCategoryId]?.parentId]"
              class="sticky top-0 bg-foreground-5 z-10"
            />

            <StatMiniItem
              :quickModalCategoryId
              :storageKey="`${props.storageKey}sum-in-${quickModalCategoryId}`"
              :trnsIds="trnsStore.getStoreTrnsIds({
                categoriesIds: categoriesStore.getChildsIdsOrParent(quickModalCategoryId),
              })"
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

        <div class="grid h-[98dvh] content-start overflow-hidden overflow-y-auto scrollerBlock">
          <TrnsList
            :trnsIds="selectedTrnsIdsForTrnsList"
            class="px-2 py-2"
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
