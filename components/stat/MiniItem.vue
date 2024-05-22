<script setup lang="ts">
import dayjs from 'dayjs'
import type { MoneyTypeSlugSum } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useSimpleTabs } from '~/components/tabs/useUtils'
import type { ChartType } from '~/components/chart/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { TotalReturns } from '~/components/amount/getTotal'
import { type PeriodNameWithAll, type PeriodNameWithoutAll, useFilter } from '~/components/filter/useFilter'

const props = defineProps<{
  trnsIds: TrnId[]
  type: MoneyTypeSlugSum
}>()

const { t } = useI18n()
const trnsStore = useTrnsStore()
const currenciesStore = useCurrenciesStore()
const { getTotalOfTrnsIds } = useAmount()
const filter = useFilter()

const period = ref<PeriodNameWithoutAll>('day')
const date = ref<number>(dayjs().startOf(period.value).valueOf())
const chartType = ref<ChartType>('bar')

const sortedTrnsIds = computed(() =>
  [...props.trnsIds].sort((a, b) => trnsStore.items[b].date - trnsStore.items[a].date),
)

const datesFromTrnsIds = computed(() => ({
  from: trnsStore.items[sortedTrnsIds.value.at(-1)].date,
  until: trnsStore.items[sortedTrnsIds.value.at(0)].date,
}))

onMounted(() =>
  date.value = dayjs(datesFromTrnsIds.value.until).startOf(period.value).valueOf(),
)

const allTotal = computed(() => getTotalOfTrnsIds(props.trnsIds))

const statTabs = useSimpleTabs(`mini-item${props.type}`, [
  {
    localeKey: 'stat.tabs.empty',
    slug: 'empty',
  },
  {
    localeKey: 'stat.tabs.lines',
    slug: 'lines',
  },
  {
    localeKey: 'stat.tabs.gLines',
    slug: 'gLines',
  },
  {
    localeKey: 'stat.tabs.round',
    slug: 'round',
  },
  {
    localeKey: 'stat.tabs.trns',
    slug: 'trns',
  },
  {
    localeKey: 'stat.tabs.periods',
    slug: 'periods',
  },
])

const datesGroups = computed(getDatesPeriod)

// TODO: move to store useTrnsStore
function groupByPeriod(trnsIds: TrnId[], period: PeriodNameWithAll) {
  const periodNoAll = period === 'all' ? 'year' : period
  const groups = datesGroups.value

  trnsIds.forEach((trnId) => {
    const date = dayjs(trnsStore.items[trnId]?.date).startOf(periodNoAll).valueOf()
    datesGroups.value[date]?.push(trnId)
  })

  return groups
}

function getDatesPeriod() {
  const list: Record<string, TrnId[]> = {}
  let current = dayjs(datesFromTrnsIds.value.from).startOf(period.value).valueOf()

  while (current < datesFromTrnsIds.value.until) {
    list[current] = []
    current = dayjs(current).add(1, period.value).startOf(period.value).valueOf()
  }

  return list
}

const trnsIdsGroupedByDate = computed(() => groupByPeriod(props.trnsIds, period.value))

const groupedTrnsTotals = computed(() =>
  Object.keys(trnsIdsGroupedByDate.value)
    .sort((a, b) => +a - +b)
    .reduce(
      (acc, date) => {
        acc[date] = getTotalOfTrnsIds(trnsIdsGroupedByDate.value[date])
        return acc
      },
      {} as Record<string, TotalReturns>,
    ),
)

const categories = computed(() => Object.keys(datesGroups.value).map(date => +date) ?? [])

const series = computed(() => getSeries(groupedTrnsTotals.value, props.type))

function onClickChart(idx: number) {
  date.value = categories.value[idx]
}

const selectedTrnsIds = computed(() => trnsIdsGroupedByDate.value[date.value])

function setPeriodAndDate(periodName: PeriodNameWithoutAll) {
  period.value = periodName
  date.value = dayjs(categories.value.at(-1)).startOf(periodName).valueOf()
}

const config = computed(() => {
  if (Object.keys(groupedTrnsTotals.value).length >= 30) {
    return {
      dataZoom: [{
        start: 90,
        type: 'inside',
        until: 100,
      }],
    }
  }

  return {
    dataZoom: false,
  }
})

function getSeries(total: Record<string, TotalReturns>, type: MoneyTypeSlugSum) {
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

  const types = type === 'sum'
    ? ['expense', 'income', 'sum']
    : [type]

  return types.map(t => ({
    color: chartSeriesOptions[t].color,
    data: Object.values(total).map(i => i[t]),
    name: chartSeriesOptions[t].name,
    type: chartSeriesOptions[t].type,
  }))
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
</script>

<template>
  <div class="grid content-start gap-6">
    <div class="grid gap-3">
      <UiTitle5>{{ $t(`money.${props.type}`) }}</UiTitle5>

      <Amount
        :amount="allTotal[props.type]"
        :currencyCode="currenciesStore.base"
        align="left"
        variant="3xl"
      />

      <div class="flex grow">
        <StatDateNav
          :isLastPeriod="+categories.at(0) === +date"
          :isToday="+categories.at(-1) === +date"
          :periodNameWithAll="filter.periodNameWithoutAll.value"
          @setNextPeriodDate="setPeriodDateNext"
          @setPeriodAndDate="() => date = +categories.at(-1)"
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

    <UiTabs2 class="gap-1 lg_py-3">
      <UiTabsItem2
        v-for="tabItem in statTabs.items"
        :key="tabItem.slug"
        :isActive="statTabs.active.value === tabItem.slug"
        @click="statTabs.set(tabItem.slug)"
      >
        {{ t(tabItem.localeKey) }}
      </UiTabsItem2>
    </UiTabs2>

    <div>
      <LazyStatChartView
        :markedArea="date"
        :categories="categories"
        :series="series"
        :chartType="chartType"
        :periodName="period"
        :config
        @click="onClickChart"
      />
    </div>

    <div
      v-if="statTabs.active.value === 'trns'"
      class="max-w-md"
    >
      <TrnsList
        :trnsIds="selectedTrnsIds"
        :type="props.type"
        :initTrnType="props.type"
        :groupedBy="period"
        isShowFilter
        isShowHeader
      />
    </div>
  </div>
</template>
