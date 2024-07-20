<script setup lang="ts">
import dayjs from 'dayjs'
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '../categories/types'
import type { MoneyTypeSlugSum } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import type { ChartType } from '~/components/stat/chart/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { FilterProvider } from '~/components/filter/useFilter'
import { getStyles } from '~/components/ui/getStyles'
import { useNewStat } from '~/components/stat/useNewStat'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useDateRange } from '~/components/date/useDateRange'
import { markArea } from '~/components/stat/chart/utils'
import type { Range } from '~/components/date/types'

const props = defineProps<{
  storageKey?: string
  trnsIds: TrnId[]
  type: MoneyTypeSlugSum
}>()

const maxRange = computed(() => useTrnsStore().getRange(props.trnsIds))

const { addInterval, getPeriodsWithEmptyTrnsIds2, grouped, groupedRanges, interval, range, removeInterval, setRange, setRangeByCalendar, setRangeByPeriod } = useDateRange({
  key: `${props.type}${props.storageKey}`,
})

const filter = inject('filter') as FilterProvider
const { t } = useI18n()
const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()
const { getCats, getSeries2 } = useNewStat()
const categoriesStore = useCategoriesStore()

const groupedPeriods2 = computed(() =>
  getPeriodsWithEmptyTrnsIds2({
    duration: grouped.value.duration || 1,
    period: grouped.value.period,
    range: range.value,
  }),
)

const categories = computed(() => groupedPeriods2.value.map(r => +r.start) ?? [])

const selectedPeriod = ref<number>(-1)

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

const baseStorageKey = computed(() => `${grouped.value.period}-${props.storageKey}-${JSON.stringify(filter.catsIds.value)}`)

const chartType = useStorage<ChartType>(`${baseStorageKey.value}-chartType`, 'bar')

const groupedTrnsIds = computed(() => getPeriodsWithTrns2(props.trnsIds, groupedPeriods2.value))
const groupedTrnsTotals2 = computed(() => groupedTrnsIds.value.map(g => getTotalOfTrnsIds(g)))

function getPeriodsWithTrns2(trnsIds: TrnId[], ranges: Range[]) {
  const list = [...ranges.map(() => [])]

  trnsIds.forEach((trnId) => {
    const trnDate = trnsStore.items[trnId]?.date
    const idx = ranges.findIndex(r => trnDate! >= r.start && trnDate! <= r.end)
    list[idx]?.push(trnId)
  })

  return list
}

const series = computed(() => {
  const series = getSeries2(groupedTrnsTotals2.value, props.type, groupedPeriods2.value)

  if (selectedPeriod.value >= 0) {
    if (chartType.value !== 'bar') {
      const markAreaSeriesIdx = series.findIndex(s => s.markedArea === 'markedArea')

      if (markAreaSeriesIdx === -1) {
        series.push({
          data: [],
          markArea: markArea(groupedPeriods2.value?.[selectedPeriod.value]?.start),
          markedArea: 'markedArea',
          type: 'bar',
        })
      }
      else {
        series[markAreaSeriesIdx] = {
          data: [],
          markArea: markArea(groupedPeriods2.value?.[selectedPeriod.value]?.start),
          markedArea: 'markedArea',
          type: 'bar',
        }
      }
    }
    else {
      series[0].markArea = markArea(groupedPeriods2.value?.[selectedPeriod.value]?.start)
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
    trnsIds: props.trnsIds,
  }, { includesChildCategories: false })
})

const totals = computed(() =>
  getTotalOfTrnsIds(selectedTrnsIdsForTrnsList.value),
)

/**
 * Cats
 */
const isGroupCategoriesByParent = useStorage<boolean>(`${baseStorageKey.value}-isGroupCategoriesByParent`, false)
const isGroupCategoriesByParentRounded = useStorage<boolean>(`${baseStorageKey.value}-isGroupCategoriesByParentRounded`, true)

const cats = computed(() => getCats(selectedTrnsIdsForTrnsList.value ?? [], isGroupCategoriesByParent.value))
const catsRounded = computed(() => getCats(selectedTrnsIdsForTrnsList.value ?? [], isGroupCategoriesByParentRounded.value))

const biggestCatNumber = computed(() => cats.value.at(0)?.value ?? 0)

const isOpenedAll = useStorage<boolean>(`${baseStorageKey.value}-isOpenedAll`, false)
const openedCats = useStorage<CategoryId[]>(`${baseStorageKey.value}-openedCats`, [])
const openedTrns = useStorage<CategoryId[]>(`${baseStorageKey.value}-openedTrns`, [])
const catsView = useStorage<'list' | 'round'>(`${baseStorageKey.value}-catsView`, 'list')

watch(cats, () => {
  if (isOpenedAll.value) {
    openedCats.value = cats.value.map(d => d.id)
  }
}, { immediate: true })

function toggleCats() {
  if (openedCats.value.length === cats.value.length) {
    openedCats.value = []
  }
  else {
    openedCats.value = cats.value.map(d => d.id)
  }
}

function onClickCategory(categoryId: CategoryId) {
  const category = categoriesStore.items[categoryId]

  if (category?.childIds && category?.childIds?.length > 0) {
    openedCats.value.includes(categoryId)
      ? (openedCats.value = openedCats.value.filter(d => d !== categoryId))
      : openedCats.value.push(categoryId)
  }

  else {
    openedTrns.value.includes(categoryId)
      ? (openedTrns.value = openedTrns.value.filter(d => d !== categoryId))
      : openedTrns.value.push(categoryId)
  }
}

// function onClickCategoryIcon(categoryId: CategoryId) {
//   filter.setCategoryId(categoryId)
// }

function onClickCategoryRounded(categoryId: CategoryId) {
  isGroupCategoriesByParentRounded.value = false
  filter.clearFilter()
  filter.setCategoryId(categoryId)
  // const category = categoriesStore.items[categoryId]

  // if (category?.childIds && category?.childIds?.length > 0) {
  //   isGroupCategoriesByParentRounded.value = false
  // }
  // else {
  //   isGroupCategoriesByParentRounded.value = true
  // }
}

const isAllCatsOpened = computed(() => arraysAreEqualUnordered(cats.value.map(d => d.id), openedCats.value))

function arraysAreEqualUnordered(arr1: CategoryId[], arr2: CategoryId[]) {
  // Check if the lengths are the same
  if (arr1.length !== arr2.length) {
    return false
  }

  // Sort both arrays
  const sortedArr1 = arr1.slice().sort()
  const sortedArr2 = arr2.slice().sort()

  // Check each element
  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return false
    }
  }

  // If all elements are the same
  return true
}

function getTrnsWithDate(categoryId: CategoryId) {
  return trnsStore.getStoreTrnsIds({
    categoriesIds: [categoryId],
    trnsIds: selectedTrnsIdsForTrnsList.value,
  }, { includesChildCategories: true })
}

const expenseTrnsIds = computed(() =>
  props.trnsIds.filter(
    trnId => trnsStore.items[trnId].type === 0 || trnsStore.items[trnId].type === 2,
  ).sort(
    (a, b) => trnsStore.items[b].date - trnsStore.items[a].date,
  ),
)

const incomeTrnsIds = computed(() =>
  props.trnsIds.filter(
    trnId => trnsStore.items[trnId].type === 1 || trnsStore.items[trnId].type === 2,
  ).sort(
    (a, b) => trnsStore.items[b].date - trnsStore.items[a].date,
  ),
)
</script>

<template>
  <div class="grid content-start gap-3">
    <div class="grid gap-3 overflow-x-auto px-3">
      <div class="">
        <div
          v-if="props.type === 'sum'"
          class="flex gap-6 md:gap-12"
        >
          <StatSum
            :amount="-totals.expense"
            type="expense"
          />
          <StatSum
            :amount="totals.income"
            type="income"
          />
          <StatSum
            :amount="totals.sum"
            type="sum"
          />
        </div>

        <StatSum
          v-else
          :amount="totals[props.type]"
          :type="props.type"
        />
      </div>

      <div class="flex overflow-y-auto gap-1">
        <DateRanges
          :range
          :interval
          :maxRange
          @setRangeByPeriod="setRangeByPeriod"
        />

        <DateDaySelector
          :groupBy="grouped.period"
          :range
          @setRangeByCalendar="setRangeByCalendar"
        />
      </div>

      <div class="flex overflow-y-auto gap-1">
        <div class="flex gap-1">
          <div
            v-for="rangeItem in groupedRanges"
            :key="rangeItem.period"
            :class="[
              getStyles('item', ['link', 'minh2']), {
                'bg-item-5 rounded': rangeItem.period === grouped.period && rangeItem.duration === grouped.duration,
              },
            ]"
            class="flex items-center px-3 py-0 text-xs bg-item-4 rounded-full leading-none font-primary text-nowrap"
            @click="() => grouped = rangeItem"
          >
            {{ rangeItem.duration }}{{ rangeItem.period }}
          </div>
        </div>
      </div>
    </div>

    <!-- Stat -->
    <div class="grid gap-2 px-2">
      <div class="grid @4xl/stat:grid-cols-[1.4fr,auto] @4xl/stat:gap-4">
        <!-- Chart first level -->
        <StatChartView2
          :key="baseStorageKey"
          :categories
          :chartType
          :period="grouped.period"
          :series
          @click="onClickChart"
        />
      </div>

      <div class="flex items-center justify-between pt-2">
        <div class="flex gap-2">
          <div
            :class="[
              getStyles('item', ['link', 'minh2']), {
                'bg-item-5 rounded': chartType === 'bar',
              },
            ]"
            class="flex items-center px-3 py-0 text-xs bg-item-4 rounded-full leading-none font-primary text-nowrap"
            @click="chartType = 'bar'"
          >
            {{ t('chart.types.bar') }}
          </div>
          <div
            :class="[
              getStyles('item', ['link', 'minh2']), {
                'bg-item-5 rounded': chartType === 'line',
              },
            ]"
            class="flex items-center px-3 py-0 text-xs bg-item-4 rounded-full leading-none font-primary text-nowrap"
            @click="chartType = 'line'"
          >
            {{ t('chart.types.line') }}
          </div>
        </div>

        <div class="flex gap-1">
          <DateNavHome
            v-if="range.start !== dayjs().subtract(interval.duration - 1, interval.period).startOf(interval.period).valueOf() && range.end !== dayjs().endOf(interval.period).valueOf()"
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
        </div>
      </div>

      <!-- Empty -->
      <div
        v-if="selectedTrnsIdsForTrnsList?.length === 0"
        class="flex-col gap-2 flex-center h-full py-3 text-center text-secondary"
      >
        <UiIconBase name="mdi mdi-palm-tree" class="!text-3xl" />
        <div class="text-md">
          {{ $t("trns.noTrns") }}
        </div>
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-24">
      <!-- Expense -->
      <StatMiniItem3
        v-if="expenseTrnsIds.length > 0"
        :trnsIds="expenseTrnsIds"
        :storageKey="props.storageKey"
        type="expense"
      />

      <!-- Income -->
      <StatMiniItem3
        v-if="incomeTrnsIds.length > 0"
        :trnsIds="incomeTrnsIds"
        :storageKey="props.storageKey"
        type="income"
      />
    </div>
  </div>
</template>
