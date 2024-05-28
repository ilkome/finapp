<script setup lang="ts">
import dayjs from 'dayjs'
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '../categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import type { MoneyTypeSlugSum } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useSimpleTabs } from '~/components/tabs/useUtils'
import type { ChartType } from '~/components/chart/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { TotalReturns } from '~/components/amount/getTotal'
import {
  type PeriodNameWithAll,
  type PeriodNameWithoutAll,
  useFilter,
} from '~/components/filter/useFilter'

const props = defineProps<{
  trnsIds: TrnId[]
  type: MoneyTypeSlugSum
}>()

const { t } = useI18n()
const trnsStore = useTrnsStore()
const categoriesStore = useCategoriesStore()
// const currenciesStore = useCurrenciesStore()
// const walletsStore = useWalletsStore()
const { getTotalOfTrnsIds } = useAmount()
const filter = useFilter()

const isGroupCategoriesByParent = useStorage<boolean>(
  'isGroupCategoriesByParent',
  false,
)
const isShowLinesChart = useStorage<boolean>('isShowLinesChart', false)
const chartPeriodsShown = ref(18)
const chartType = ref<ChartType>('bar')
const period = useStorage<PeriodNameWithoutAll>('miniItemPeriod', 'day')
const date = useStorage<number>(
  'miniItemDate',
  dayjs().startOf(period.value).valueOf(),
)

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

const statTabs = useSimpleTabs(`mini-item${props.type}`, [
  {
    localeKey: 'stat.tabs.chart',
    slug: 'chart',
  },
  {
    localeKey: 'stat.tabs.lines',
    slug: 'lines',
  },
  {
    localeKey: 'stat.tabs.linesChart',
    slug: 'linesChart',
  },
  {
    localeKey: 'stat.tabs.linesTrns',
    slug: 'linesTrns',
  },
  // {
  //   localeKey: 'stat.tabs.gLines',
  //   slug: 'gLines',
  // },
  // {
  //   localeKey: 'stat.tabs.round',
  //   slug: 'round',
  // },
  {
    localeKey: 'stat.tabs.trns',
    slug: 'trns',
  },
])

const chartTabs = useSimpleTabs(`mini-item-sub${props.type}`, [
  {
    localeKey: 'stat.tabs.empty',
    slug: 'empty',
  },
  // {
  //   localeKey: 'stat.tabs.lines',
  //   slug: 'lines',
  // },
  // {
  //   localeKey: 'stat.tabs.gLines',
  //   slug: 'gLines',
  // },
  // {
  //   localeKey: 'stat.tabs.round',
  //   slug: 'round',
  // },
  {
    localeKey: 'stat.tabs.trns',
    slug: 'trns',
  },
  // {
  //   localeKey: 'stat.tabs.periods',
  //   slug: 'periods',
  // },
])

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
          maxValueSpan: chartPeriodsShown.value,
          minValueSpan: chartPeriodsShown.value,
          start: 100,
          type: 'inside',
        },
      ],
    }
  }

  return {
    dataZoom: false,
  }
})

function getSeries(
  total: Record<string, TotalReturns>,
  type: MoneyTypeSlugSum,
) {
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

  const types = type === 'sum' ? ['expense', 'income', 'sum'] : [type]

  return types.map(t => ({
    color: chartSeriesOptions[t].color,
    data: Object.values(total).map(i => i[t]),
    name: chartSeriesOptions[t].name,
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

const cats = computed(() =>
  selectedTrnsIdsForTrnsList.value?.reduce(
    (prev, trnId) => {
      const categoryId = trnsStore.items[trnId]?.categoryId
      prev[categoryId] ??= []
      prev[categoryId].push(trnId)
      return prev
    },
    {} as Record<CategoryId, TrnId[]>,
  ),
)

const catsRoots = computed(() =>
  selectedTrnsIdsForTrnsList.value?.reduce(
    (prev, trnId) => {
      const categoryId = trnsStore.items[trnId]?.categoryId
      const trnBaseCategory = categoriesStore.items[categoryId]

      const newCategoryId
        = trnBaseCategory.parentId === 0
          ? trnsStore.items[trnId]?.categoryId
          : trnBaseCategory.parentId

      prev[newCategoryId] ??= []
      prev[newCategoryId].push(trnId)
      return prev
    },
    {} as Record<CategoryId, TrnId[]>,
  ),
)

const cats2 = computed(() => getTotalCategories(cats.value ?? []))
const cats3 = computed(() => getTotalCategories(catsRoots.value ?? []))

export interface TotalCategories {
  expense: TotalCategory[]
  income: TotalCategory[]
}

export interface TotalCategory {
  id: CategoryId
  trnsIds: TrnId[]
  value: number
}

function getTotalCategories(categoriesWithTrns: TotalCategories) {
  const categories = Object.keys(categoriesWithTrns).reduce(
    (acc, categoryId) => {
      const totalInCategory = getTotalOfTrnsIds(categoriesWithTrns[categoryId])

      if (totalInCategory.income > 0) {
        acc.income.push({
          id: categoryId,
          trnsIds: categoriesWithTrns[categoryId].filter(
            trnId => trnsStore.items[trnId].type === 1,
          ),
          value: totalInCategory.income,
        })
      }

      if (totalInCategory.expense > 0) {
        acc.expense.push({
          id: categoryId,
          trnsIds: categoriesWithTrns[categoryId].filter(
            trnId => trnsStore.items[trnId].type === 0,
          ),
          value: totalInCategory.expense,
        })
      }

      return acc
    },
    {
      expense: [],
      income: [],
    } as TotalCategories,
  )

  return Object.keys(categories).reduce(
    (prev, type) => {
      prev[type] = categories[type].sort((a, b) => b?.value - a?.value)
      return prev
    },
    {
      expense: [],
      income: [],
    } as TotalCategories,
  )
}
</script>

<template>
  <!-- @4xl/main_bg-red-200 -->
  <div class="grid content-start gap-3">
    <!-- <pre>{{ statPrepareData }}</pre> -->
    <!-- <pre>{{ cats getTotal
      }}</pre> -->
    <!-- <pre>{{ cats2 }}</pre> -->

    <div class="grid gap-3">
      <StatSum :amount="totals[props.type]" :type="props.type" />

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

    <UiTabs2 class="-mt-2 gap-1 border-b border-item-6 pb-1">
      <UiTabsItem2
        v-for="tabItem in statTabs.items"
        :key="tabItem.slug"
        :isActive="statTabs.active.value === tabItem.slug"
        @click="statTabs.set(tabItem.slug)"
      >
        {{ t(tabItem.localeKey) }}
      </UiTabsItem2>
    </UiTabs2>

    <!-- Not empty -->
    <template v-if="statTabs.active.value !== 'empty'">
      <div class="_@3xl/main_grid-cols-[1fr,.8fr] _gap-8 grid">
        <div class="grid gap-8">
          <LazyStatChartView
            v-if="
              statTabs.active.value === 'chart'
                || statTabs.active.value === 'linesTrns'
                || statTabs.active.value === 'linesChart'
            "
            :markedArea="date"
            :categories="categories"
            :series="series"
            :chartType="chartType"
            :periodName="period"
            :config
            @click="onClickChart"
          />

          <StatPeriodsLines2
            v-if="
              statTabs.active.value === 'lines'
                || statTabs.active.value === 'linesChart'
            "
            :cats="
              (isGroupCategoriesByParent
                ? cats3[props.type]
                : cats2[props.type]) ?? []
            "
            :date
            :period
            :isShowLinesChart
            :biggest="
              (isGroupCategoriesByParent
                ? cats3[props.type]?.at(0)?.value
                : cats2[props.type]?.at(0)?.value) ?? 0
            "
            :type="props.type"
          >
            <!-- <template #contentBefore>
              <div>
                <UiCheckbox
                  :checkboxValue="isGroupCategoriesByParent"
                  title="Group by parent"
                  showCheckbox
                  @onClick="
                    isGroupCategoriesByParent = !isGroupCategoriesByParent
                  "
                />
                <UiCheckbox
                  :checkboxValue="isShowLinesChart"
                  title="Show Lines"
                  showCheckbox
                  @onClick="isShowLinesChart = !isShowLinesChart"
                />
              </div>
            </template> -->
          </StatPeriodsLines2>

          <div v-if="statTabs.active.value === 'linesTrns' || statTabs.active.value === 'trns'" class="max-w-md">
            <TrnsList
              :groupedBy="period"
              :initTrnType="props.type"
              :isShowGroupSum="period !== 'day'"
              :trnsIds="selectedTrnsIdsForTrnsList"
              :type="props.type"
              isShowFilter2
              isShowHeader
            />
          </div>

          <!-- <div v-if="statTabs.active.value === 'trns'" class="max-w-md">
            <TrnsList
              :groupedBy="period"
              :initTrnType="props.type"
              :isShowGroupSum="period !== 'day'"
              :trnsIds="trnsIds"
              :type="props.type"
              isShowFilter
              isShowHeader
            />
          </div> -->
        </div>
      </div>
    </template>
  </div>
</template>
