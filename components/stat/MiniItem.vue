<script setup lang="ts">
import dayjs from 'dayjs'
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '../categories/types'
import type { MoneyTypeSlugSum } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import type { ChartType } from '~/components/chart/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { TotalReturns } from '~/components/amount/getTotal'
import {
  type PeriodNameWithAll,
  type PeriodNameWithoutAll,
  useFilter,
} from '~/components/filter/useFilter'
import { getStyles } from '~/components/ui/getStyles'
import { useNewStat } from '~/components/stat/useNewStat'
import { useCategoriesStore } from '~/components/categories/useCategories'

const props = defineProps<{
  storageKey?: string
  trnsIds: TrnId[]
  type: MoneyTypeSlugSum
}>()

const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()
const filter = useFilter()
const { getCats } = useNewStat()
const categoriesStore = useCategoriesStore()

const isGroupCategoriesByParent = useStorage<boolean>('isGroupCategoriesByParent', false)
const isShowLinesChart = useStorage<boolean>('isShowLinesChart', false)
const chartPeriodsShown = useStorage<number>(`${props.storageKey}-${props.type}-chartPeriodsShown`, 18)
const chartType = ref<ChartType>('bar')
const period = useStorage<PeriodNameWithoutAll>(`${props.storageKey}-${props.type}-period`, 'day')
const date = useStorage<number>(`${props.storageKey}-${props.type}-date`, dayjs().startOf(period.value).valueOf())

const sortedTrnsIds = computed(() =>
  [...props.trnsIds].sort(
    (a, b) => trnsStore.items[b].date - trnsStore.items[a].date,
  ),
)

const datesFromTrnsIds = computed(() => ({
  from: trnsStore.items[sortedTrnsIds.value.at(-1)]?.date,
  until: trnsStore.items[sortedTrnsIds.value.at(0)]?.date,
}))

onMounted(
  () =>
    (date.value = dayjs(datesFromTrnsIds.value.until)
      .startOf(period.value)
      .valueOf()),
)

const datesGroups = computed(() =>
  getPeriodsDates({
    from: datesFromTrnsIds.value.from,
    period: period.value,
    until: datesFromTrnsIds.value.until,
  }),
)

const periodsWithTrnsIds = computed(() =>
  getPeriodsOf(props.trnsIds, period.value),
)

const groupedTrnsTotals = computed(() =>
  Object.keys(periodsWithTrnsIds.value)
    .sort((a, b) => +a - +b)
    .reduce(
      (acc, date) => {
        acc[date] = getTotalOfTrnsIds(periodsWithTrnsIds.value[date])
        return acc
      },
      {} as Record<string, TotalReturns>,
    ),
)

const categories = computed(
  () => Object.keys(datesGroups.value).map(date => +date) ?? [],
)
const series = computed(() => getSeries(groupedTrnsTotals.value, props.type))
const selectedTrnsIdsForTrnsList = computed(
  () => periodsWithTrnsIds.value[date.value],
)
const totals = computed(() =>
  getTotalOfTrnsIds(selectedTrnsIdsForTrnsList.value),
)

const config = computed(() => {
  if (Object.keys(groupedTrnsTotals.value).length >= 30) {
    return {
      dataZoom: [
        {
          filterMode: 'filter',
          maxValueSpan: chartPeriodsShown.value,
          minValueSpan: chartPeriodsShown.value,
          // moveOnMouseMove: false,
          preventDefaultMouseMove: false,
          // moveOnMouseWheel: false,
          roam: false,
          start: 100,
          type: 'inside',
          zoomOnMouseWheel: false,
        },
      ],
    }
  }

  return {
    dataZoom: false,
  }
})

const chartSeriesOptions = {
  expense: {
    color: 'var(--c-expense-1)',
    localeKey: 'money.expense',
    type: 'bar',
  },
  income: {
    color: 'var(--c-income-1)',
    localeKey: 'money.expense',
    type: 'bar',
  },
  sum: {
    color: 'grey',
    localeKey: 'money.sum',
    type: 'line',
  },
} as const

function getSeries(
  total: Record<string, TotalReturns>,
  type: MoneyTypeSlugSum,
) {
  const types = type === 'sum' ? ['expense', 'income', 'sum'] : [type]

  return types.map(t => ({
    color: chartSeriesOptions[t].color,
    data: Object.values(total).map(i => i[t]),
    name: chartSeriesOptions[t].name,
    roam: 'move',
    type: chartSeriesOptions[t].type,
  }))
}

function setPeriodAndDate(periodName: PeriodNameWithoutAll) {
  period.value = periodName
  date.value = dayjs(categories.value.at(-1)).startOf(periodName).valueOf()
}

function setPeriodDateNext() {
  const newDate = dayjs(date.value).subtract(1, period.value).valueOf()
  if (categories.value.includes(newDate))
    date.value = newDate
}

function setPeriodDatePrev() {
  const newDate = dayjs(date.value).add(1, period.value).valueOf()

  if (categories.value.includes(newDate))
    date.value = newDate
}

function onClickChart(idx: number) {
  date.value = categories.value[idx]
}

// TODO: move to dates utils
function getPeriodsDates(params: {
  from: number
  period: PeriodNameWithoutAll
  until: number
}) {
  const list: Record<string, TrnId[]> = {}
  let current = dayjs(params.from).startOf(params.period).valueOf()

  while (current < params.until) {
    list[current] = []
    current = dayjs(current)
      .add(1, params.period)
      .startOf(params.period)
      .valueOf()
  }

  return list
}

function getPeriodsOf(trnsIds: TrnId[], period: PeriodNameWithAll) {
  const periodNoAll = period === 'all' ? 'year' : period
  const groups = datesGroups.value

  trnsIds.forEach((trnId) => {
    const date = dayjs(trnsStore.items[trnId]?.date)
      .startOf(periodNoAll)
      .valueOf()
    datesGroups.value[date]?.push(trnId)
  })

  return groups
}

/**
 * Cats
 */
const cats = computed(() => getCats(selectedTrnsIdsForTrnsList.value ?? [], isGroupCategoriesByParent.value))
const biggestCatNumber = computed(() => cats.value.at(0)?.value ?? 0)
const isOpenedAll = useStorage<boolean>(`mini-item-${props.type}-isOpenedAll`, false)
const openedCats = ref<CategoryId[]>([])
const openedTrns = ref<CategoryId[]>([])

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
</script>

<template>
  <div class="grid content-start gap-3">
    <!-- Date -->
    <div class="grid gap-3">
      <StatSum
        :amount="totals[props.type]"
        :type="props.type"
      />

      <div class="flex grow">
        <StatDateNav
          :isLastPeriod="+categories.at(0) === +date"
          :isToday="+categories.at(-1) === +date"
          :periodNameWithAll="period"
          @setNextPeriodDate="setPeriodDateNext"
          @setPeriodAndDate="() => (date = +categories.at(-1))"
          @setPrevPeriodDate="setPeriodDatePrev"
        />

        <StatDateView
          :date="date"
          :periodNameWithAll="period"
          :periodsNames="filter.periodsNames.value"
          :periods="filter.periods.value"
          @setPeriodAndDate="setPeriodAndDate"
        />
      </div>
    </div>

    <!-- Stat -->
    <div class="_@3xl/main_grid-cols-[1fr,.8fr] _gap-8 grid">
      <div class="grid gap-0">
        <!-- Chart -->
        <UiToggle
          :storageKey="`${props.storageKey}${props.type}-chart`"
        >
          <template #header="{ toggle, isShown }">
            <div class="flex items-center justify-between">
              <UiTitle
                :class="getStyles('item', ['link', 'center', 'padding3', 'minh', 'minw1', 'rounded'])"
                class="grow flex items-center gap-2 pb-0"
                @click="toggle"
              >
                <Icon
                  :name="isShown ? 'mdi:chevron-down' : 'mdi:chevron-right'"
                  size="22"
                  class="-ml-1"
                />
                <div>{{ $t('chart.title') }}</div>
              </UiTitle>

              <VDropdown
                v-if="isShown"
                :overflowPadding="12"
                autoBoundaryMaxSize
                placement="bottom-start"
                class="group"
              >
                <div
                  :class="getStyles('item', ['link', 'center', 'minh', 'minw1', 'rounded'])"
                  class="justify-center text-xl"
                >
                  <UiIconConfig />
                </div>

                <template #popper>
                  <div class="p-3">
                    <input v-model="chartPeriodsShown" type="number">
                  </div>
                </template>
              </VDropdown>
            </div>
          </template>

          <LazyStatChartView
            :markedArea="date"
            :categories="categories"
            :series="series"
            :chartType="chartType"
            :periodName="period"
            :config
            @click="onClickChart"
          />
        </UiToggle>

        <pre>{{ isOpenedAll }}</pre>
        <pre>{{ openedCats }}</pre>

        <!-- Categories -->
        <UiToggle
          v-if="selectedTrnsIdsForTrnsList?.length > 0"
          :storageKey="`${props.storageKey}${props.type}-cats`"
        >
          <template #header="{ toggle, isShown }">
            <div class="flex items-center justify-between">
              <UiTitle
                :class="getStyles('item', ['link', 'center', 'padding3', 'minh', 'minw1', 'rounded'])"
                class="grow flex items-center gap-1 pb-0"
                @click="toggle"
              >
                <Icon
                  :name="isShown ? 'mdi:chevron-down' : 'mdi:chevron-right'"
                  size="22"
                  class="-ml-1"
                />
                <div>{{ $t('categories.title') }}</div>
              </UiTitle>

              <template v-if="isShown">
                <div
                  :class="getStyles('item', ['link', 'center', 'minh', 'minw1', 'rounded'])"
                  class="justify-center text-xl"
                  @click="toggleCats"
                >
                  <Icon
                    :name="isAllCatsOpened ? 'mdi:arrow-collapse' : 'mdi:arrow-expand'"
                    size="22"
                    class="-ml-1"
                  />
                </div>

                <VDropdown
                  v-if="isShown"
                  :overflowPadding="12"
                  autoBoundaryMaxSize
                  placement="bottom-start"
                  class="group"
                >
                  <div
                    :class="getStyles('item', ['link', 'center', 'minh', 'minw1', 'rounded'])"
                    class="justify-center text-xl"
                  >
                    <UiIconConfig />
                  </div>

                  <template #popper>
                    <div class="p-1">
                      <UiCheckbox
                        :checkboxValue="isGroupCategoriesByParent"
                        title="Group by parent"
                        showCheckbox
                        @onClick="isGroupCategoriesByParent = !isGroupCategoriesByParent"
                      />
                      <UiCheckbox
                        v-if="isGroupCategoriesByParent"
                        :checkboxValue="isOpenedAll"
                        title="Always open parent"
                        showCheckbox
                        @onClick="isOpenedAll = !isOpenedAll"
                      />
                      <UiCheckbox
                        :checkboxValue="isShowLinesChart"
                        title="Show Lines"
                        showCheckbox
                        @onClick="isShowLinesChart = !isShowLinesChart"
                      />
                    </div>
                  </template>
                </VDropdown>
              </template>
            </div>
          </template>

          <StatPeriodsLines2
            :cats
          >
            <StatPeriodsLinesItem
              v-for="item in cats"
              :key="item.id"
              :item
              :trnsIds="selectedTrnsIdsForTrnsList"
              :openedCats
              :openedTrns
              :allTrnsIds="props.trnsIds"
              :isShowLinesChart
              :isGroupCategoriesByParent
              :isOpenedAll
              :biggestCatNumber
              :isActive="isGroupCategoriesByParent && openedCats.includes(item.id)"
              @click="onClickCategory"
            >
              <h1>hello</h1>
            </StatPeriodsLinesItem>
          </StatPeriodsLines2>
        </UiToggle>

        <!-- Trns -->
        <UiToggle
          v-if="selectedTrnsIdsForTrnsList?.length > 0"
          :storageKey="`${props.storageKey}${props.type}-trns`"
        >
          <template #header="{ toggle, isShown }">
            <UiTitle
              :class="getStyles('item', ['link', 'center', 'padding3', 'minh', 'minw1', 'rounded'])"
              class="grow flex items-center gap-2 pb-0"
              @click="toggle"
            >
              <Icon
                :name="isShown ? 'mdi:chevron-down' : 'mdi:chevron-right'"
                size="22"
                class="-ml-1"
              />
              <div>{{ $t('trns.title') }}</div>
              <div>{{ selectedTrnsIdsForTrnsList?.length }}</div>
            </UiTitle>
          </template>

          <TrnsList
            :groupedBy="period"
            :isShowGroupSum="period !== 'day'"
            :trnsIds="selectedTrnsIdsForTrnsList"
            isShowFilterByDesc
            isShowHeader2
          />
        </UiToggle>

        <!-- Empty -->
        <div
          v-if="selectedTrnsIdsForTrnsList?.length === 0"
          class="flex-col gap-2 flex-center h-full py-3 text-center text-secondary"
        >
          <Icon name="mdi:palm-tree" size="64" />
          <div class="text-md">
            {{ $t("trns.noTrns") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
