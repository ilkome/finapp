<script setup lang="ts">
import dayjs from 'dayjs'
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '../categories/types'
import type { MoneyTypeSlugSum } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import { useSimpleTabs } from '~/components/tabs/useUtils'
import type { ChartType } from '~/components/chart/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { TotalReturns } from '~/components/amount/getTotal'
import {
  type PeriodNameWithAll,
  type PeriodNameWithoutAll,
  useFilter,
} from '~/components/filter/useFilter'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  storageKey?: string
  trnsIds: TrnId[]
  type: MoneyTypeSlugSum
}>()

const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()
const filter = useFilter()

const isGroupCategoriesByParent = useStorage<boolean>(
  'isGroupCategoriesByParent',
  false,
)
const isOpenedAll = useStorage<boolean>(`mini-item-${props.type}-isOpenedAll`, false)
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
  {
    localeKey: 'stat.tabs.trns',
    slug: 'trns',
  },
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

export interface TotalCategories {
  expense: TotalCategory[]
  income: TotalCategory[]
}

export interface TotalCategory {
  id: CategoryId
  trnsIds: TrnId[]
  value: number
}
</script>

<template>
  <div class="grid content-start gap-3">
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

    <!-- Not empty -->
    <template v-if="statTabs.active.value !== 'empty'">
      <div class="_@3xl/main_grid-cols-[1fr,.8fr] _gap-8 grid">
        <div class="grid gap-0">
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

          <UiToggle
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
                        :checkboxValue="isShowLinesChart"
                        title="Show Lines"
                        showCheckbox
                        @onClick="isShowLinesChart = !isShowLinesChart"
                      />
                      <UiCheckbox
                        :checkboxValue="isOpenedAll"
                        title="Open all"
                        showCheckbox
                        @onClick="isOpenedAll = !isOpenedAll"
                      />
                    </div>
                  </template>
                </VDropdown>
              </div>
            </template>

            <StatPeriodsLines2
              :trnsIds="selectedTrnsIdsForTrnsList"
              :isShowLinesChart
              :isGroupCategoriesByParent
              :isOpenedAll
            />
          </UiToggle>

          <UiToggle
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
        </div>
      </div>
    </template>
  </div>
</template>
