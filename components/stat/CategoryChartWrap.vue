<script setup lang="ts">
import dayjs from 'dayjs'
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useCategoriesStore } from '~/components/categories/useCategories'
import type { ChartType } from '~/components/chart/types'
import type {
  PeriodNameWithAll,
  PeriodNameWithoutAll,
} from '~/components/filter/useFilter'
import type { MoneyTypeSlugSum } from '~/components/stat/types'
import type { TotalReturns } from '~/components/amount/getTotal'
import useAmount from '~/components/amount/useAmount'

const props = defineProps<{
  categoryId: CategoryId
  trnsIds: TrnId[]
}>()

const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()
const categoriesStore = useCategoriesStore()

const category = computed(() => categoriesStore.items[props.categoryId])

const selectedTrnsIds = computed(() =>
  props.trnsIds.filter((trnId) => {
    if (category.value.childIds?.includes(trnsStore.items[trnId]?.categoryId))
      return true
    if (trnsStore.items[trnId]?.categoryId === props.categoryId)
      return true
    return false
  }),
)

const isShowLinesChart = useStorage<boolean>('isShowLinesChart', false)
const chartPeriodsShown = useStorage<number>('chartPeriodsShown2', 12)
const chartType = ref<ChartType>('bar')
const period = useStorage<PeriodNameWithoutAll>(`period3`, 'month')
const date = useStorage<number>(
  `date`,
  dayjs().startOf(period.value).valueOf(),
)

const sortedTrnsIds = computed(() =>
  [...selectedTrnsIds.value].sort(
    (a, b) => trnsStore.items[b].date - trnsStore.items[a].date,
  ),
)
const datesFromTrnsIds = computed(() => ({
  from: trnsStore.items[sortedTrnsIds.value.at(-1)]?.date,
  until: trnsStore.items[sortedTrnsIds.value.at(0)]?.date,
}))

const datesGroups = computed(() =>
  getPeriodsDates({
    from: datesFromTrnsIds.value.from,
    period: period.value,
    until: datesFromTrnsIds.value.until,
  }),
)

const categories = computed(
  () => Object.keys(datesGroups.value).map(date => +date) ?? [],
)

const series = computed(() => getSeries(groupedTrnsTotals.value, 'sum'))

const periodsWithTrnsIds = computed(() =>
  getPeriodsOf(selectedTrnsIds.value, period.value),
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
    type: 'bar',
  },
} as const

function getSeries(
  total: Record<string, TotalReturns>,
  type: MoneyTypeSlugSum,
) {
  const types = type === 'sum' ? ['sum'] : [type]

  return types.map(t => ({
    color: chartSeriesOptions[t].color,
    data: Object.values(total).map(i => Math.abs(i[t])),
    name: chartSeriesOptions[t].name,
    type: chartSeriesOptions[t].type,
  }))
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
</script>

<template>
  <div class="pl-6">
    <!-- <pre>{{ selectedTrnsIds.value.length }}</pre> -->
    <!-- <pre>{{ selectedTrnsIds }}</pre> -->
    <!-- <TrnsList
      :trnsIds="selectedTrnsIds"
    /> -->

    <LazyStatChartView
      :markedArea="date"
      :categories="categories"
      :series="series"
      :chartType="chartType"
      :periodName="period"
      :config
    />
  </div>
</template>
