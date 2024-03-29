<script setup lang="ts">
import dayjs from 'dayjs'
import { useMediaQuery } from '@vueuse/core'
import localforage from 'localforage'
import { moneyTypes } from '~/components/stat/types'
import type { CategoryId } from '~/components/categories/types'

import type {
  MoneyTypeNumber,
  MoneyTypeSlug,
  MoneyTypeSlugSum,
} from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import useUIView from '~/components/layout/useUIView'
import { useAppNav } from '~/components/app/useAppNav'
import { useFilter } from '~/components/filter/useFilter'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useChartStore } from '~/components/stat/chart/useChartStore'
import { type TotalReturns, getTotal } from '~/components/amount/getTotal'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { getTrnsIds } from '~/components/trns/getTrns'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const appNavStore = useAppNav()
const categoriesStore = useCategoriesStore()
const chartStore = useChartStore()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()
const filter = useFilter()

console.log(111)
async function initFilter() {
  filter.setPeriodAndDate(
    (await localforage.getItem('finapp.filter.period')) ?? 'month',
  )
  filter.setDate(
    (await localforage.getItem('finapp.filter.date')) ?? dayjs().valueOf(),
  )
}
initFilter()

const { ui } = useUIView()

const isLargeScreen = useMediaQuery('(min-width: 640px)')

function isShowGroupByType(type: MoneyTypeSlugSum) {
  const p1
    = (appNavStore.activeTabStat === 'summary'
    && statPrepareDataAverageAll.value[
      type === 'income' ? 'incomeTransactions' : 'expenseTransactions'
    ] > 0)
    || (appNavStore.activeTabStat === 'income' && type === 'income')
    || (appNavStore.activeTabStat === 'expense' && type === 'expense')

  const p2 = filter.periodNameWithAll.value === 'all'
  return p1 || p2
}

const trnsIds = computed(() => {
  const categoriesIds
    = filter.catsIds.value.length > 0
      ? categoriesStore.getTransactibleIds(filter.catsIds.value)
      : []
  const walletsIds
    = filter.walletsIds.value.length > 0 ? filter.walletsIds.value : []

  return getTrnsIds({
    categoriesIds,
    date: filter.date.value,
    periodName: filter.periodNameWithAll.value,
    trnsItems: trnsStore.items,
    walletsIds,
  })
})

const trnsItemsFiltered = computed(() => {
  const categoriesIds
    = filter.catsIds.value.length > 0
      ? categoriesStore.getTransactibleIds(filter.catsIds.value)
      : []
  const walletsIds
    = filter.walletsIds.value.length > 0 ? filter.walletsIds.value : []

  const trnsIds = getTrnsIds({
    categoriesIds,
    trnsItems: trnsStore.items,
    walletsIds,
  })

  return trnsIds.reduce((prev, trnId) => {
    prev[trnId] = trnsStore.items[trnId]
    return prev
  }, {})
})

const combinedTrnsIds = computed(() => ({
  summary: trnsIds.value,
  income: trnsIds.value.filter(
    (id: TrnId) =>
      trnsStore.items[id].type === 1 || trnsStore.items[id].type === 2,
  ),
  expense: trnsIds.value.filter(
    (id: TrnId) =>
      trnsStore.items[id].type === 0 || trnsStore.items[id].type === 2,
  ),
}))

const selectedPeriodCount = computed(() =>
  dayjs()
    .endOf(filter.periodNameWithoutAll.value)
    .diff(filter.date.value, filter.periodNameWithoutAll.value),
)

const avaDate = computed(
  () =>
    trnsItemsFiltered.value[Object.keys(trnsItemsFiltered.value).at(-1)].date,
)

const filterPeriodMaxDateCount = computed(
  () =>
    dayjs()
      .endOf(filter.periodNameWithoutAll.value)
      .diff(avaDate.value, filter.periodNameWithoutAll.value) + 1,
)

const chartConfigShowedPeriodsCount = computed(
  () => chartStore.periods[filter.periodNameWithoutAll.value].showedPeriods,
)

const periodsToShow = computed(() =>
  selectedPeriodCount.value >= chartConfigShowedPeriodsCount.value
    ? selectedPeriodCount.value + 1
    : chartConfigShowedPeriodsCount.value > filterPeriodMaxDateCount.value
      ? filterPeriodMaxDateCount.value
      : chartConfigShowedPeriodsCount.value,
)

const statPrepareData = computed(() =>
  Array.from({ length: periodsToShow.value }).map((_, index) => {
    const date = dayjs()
      .startOf(filter.periodNameWithoutAll.value)
      .subtract(index, filter.periodNameWithoutAll.value)
      .valueOf()

    // TODO?: Get trnsIds from all periods first, then filter them
    const trnsIds = getTrnsIds({
      trnsItems: trnsStore.items,
      walletsIds: filter.walletsIds.value,
      categoriesIds: filter.transactibleCatsIds.value,
      periodName: filter.periodNameWithoutAll.value,
      date,
    })

    const total = getTotal({
      baseCurrencyCode: currenciesStore.base,
      rates: currenciesStore.rates,
      trnsIds,
      trnsItems: trnsStore.items,
      walletsItems: walletsStore.items,
      transferCategoriesIds: categoriesStore.transferCategoriesIds,
    })

    return { date, ...total, trnsIds }
  }),
)

const statPrepareDataAverageAll = computed(() => {
  const totalPeriods = statPrepareData.value.reduce(
    (acc, cur) => {
      acc.incomeTransactions += cur.incomeTransactions
      acc.expenseTransactions += cur.expenseTransactions
      acc.sumTransactions += cur.sumTransactions
      return acc
    },
    {
      incomeTransactions: 0,
      expenseTransactions: 0,
      sumTransactions: 0,
    },
  )

  return Object.keys(totalPeriods).reduce((acc, prev) => {
    acc[prev] = totalPeriods[prev] / (periodsToShow.value - 1)
    return acc
  }, {} as TotalReturns)
})

const statPrepareDataAverage = computed(() => {
  const totalPeriods = statPrepareData.value.slice(1).reduce(
    (acc, cur) => {
      acc.incomeTransactions += cur.incomeTransactions
      acc.expenseTransactions += cur.expenseTransactions
      acc.sumTransactions += cur.sumTransactions
      return acc
    },
    {
      incomeTransactions: 0,
      expenseTransactions: 0,
      sumTransactions: 0,
    },
  )

  return Object.keys(totalPeriods).reduce((acc, prev) => {
    acc[prev] = totalPeriods[prev] / (periodsToShow.value - 1)
    return acc
  }, {} as TotalReturns)
})

const statData = computed(() => ({
  series: [
    {
      data: statPrepareData.value.map(i => i.expenseTransactions),
      color: 'var(--c-expense-1)',
    },
    {
      data: statPrepareData.value.map(i => i.incomeTransactions),
      color: 'var(--c-income-1)',
    },
  ],
  categories: statPrepareData.value.map(i => i.date),
}))

const mTypes = {
  expense: 'expenseTransactions',
  income: 'incomeTransactions',
  sum: 'sumTransactions',
} as const

const trnsIdsInCategory = computed(() =>
  trnsIds.value.reduce(
    (prev, trnId) => {
      const categoryId = trnsStore.items[trnId]?.categoryId
      prev[categoryId] ??= []
      prev[categoryId].push(trnId)
      return prev
    },
    {} as Record<CategoryId, TrnId[]>,
  ),
)

interface TotalCategory {
  id: CategoryId
  value: number
}

interface TotalCategories {
  income: TotalCategory[]
  expense: TotalCategory[]
}

const totalCategories = computed(() => {
  const categories = Object.keys(trnsIdsInCategory.value).reduce(
    (acc, categoryId) => {
      const totalInCategory = getTotal({
        baseCurrencyCode: currenciesStore.base,
        rates: currenciesStore.rates,
        trnsIds: trnsIdsInCategory.value[categoryId],
        trnsItems: trnsStore.items,
        walletsIds: filter.walletsIds.value,
        walletsItems: walletsStore.items,
      })
      if (totalInCategory.incomeTransactions > 0) {
        acc.income.push({
          id: categoryId,
          value: totalInCategory.incomeTransactions,
        })
      }

      if (totalInCategory.expenseTransactions > 0) {
        acc.expense.push({
          id: categoryId,
          value: totalInCategory.expenseTransactions,
        })
      }

      return acc
    },
    {
      income: [],
      expense: [],
    } as TotalCategories,
  )

  return Object.keys(categories).reduce(
    (prev, type) => {
      prev[type] = categories[type].sort((a, b) => b?.value - a?.value)
      return prev
    },
    {
      income: [],
      expense: [],
    } as TotalCategories,
  )
})

function getCategories(slug: MoneyTypeSlug): TotalCategories[MoneyTypeSlug] {
  return totalCategories.value[slug]
}

function getColorizeType(slug: MoneyTypeSlugSum): MoneyTypeSlug {
  return statPrepareData.value[selectedPeriodCount.value]?.[mTypes[slug]] > 0
    ? 'income'
    : 'expense'
}

function getMoneyTypeNumber(slug: MoneyTypeSlugSum): MoneyTypeNumber {
  return moneyTypes.find(t => t.slug === `${slug}`.toLowerCase())?.type ?? 3
}

function getAverageItem(slug: MoneyTypeSlugSum) {
  return {
    amount: statPrepareData.value[selectedPeriodCount.value]?.[mTypes[slug]],
    averageAmount: statPrepareDataAverage.value[mTypes[slug]],
    colorizeType: getColorizeType(slug),
    isShownAverage: statPrepareDataAverage.value.sumTransactions !== 0,
    moneyTypeNumber: getMoneyTypeNumber(slug),
    moneyTypeSlugSum: slug,
  }
}

const averages = computed(() => {
  // const averageSlugs = ['expense', 'income', 'sum'] as const
  const averageSlugs = ['sum', 'expense', 'income'] as const

  return averageSlugs.reduce(
    (acc, slug) => {
      acc[slug] = getAverageItem(slug)
      return acc
    },
    {} as Record<MoneyTypeSlugSum, ReturnType<typeof getAverageItem>>,
  )
})

const isToday = computed(() =>
  dayjs().isSame(filter.date.value, filter.nameWithoutAll.value),
)
const isLastPeriod = computed(() =>
  dayjs(filter.date.value).isSame(avaDate.value, filter.nameWithoutAll.value),
)

const filters = {
  filterPeriodMaxDateCount,
  avaDate,
  isToday,
  trnsIds,
  isLastPeriod,
} as const

provide('periodsToShow', periodsToShow)
provide('statData', statData)
provide('period', filter)
provide('filters', filters)

export type PeriodProvider = typeof filter
export type FiltersProvider = typeof filters

const categoriesHey = computed(() =>
  categoriesStore.favoriteCategoriesIds.map((id: CategoryId) => ({
    id,
    value:
      (totalCategories.value.income.find(c => c.id === id)?.value
      || totalCategories.value.expense.find(c => c.id === id)?.value)
      ?? 0,
  })),
)

const categoriesHey2 = computed(() =>
  categoriesStore.recentCategoriesIds.map((id: CategoryId) => ({
    id,
    value:
      (totalCategories.value.income.find(c => c.id === id)?.value
      || totalCategories.value.expense.find(c => c.id === id)?.value)
      ?? 0,
  })),
)
</script>

<template>
  <div class="grid h-full overflow-hidden xl_grid-cols-[1fr_auto]">
    <div class="h-full overflow-hidden overflow-y-auto px-3 pb-6">
      <div class="lg_max-w-4xl">
        <!-- <div class="sticky top-0 z-20 bg-foreground-4 backdrop-blur">
          <div class="_justify-between flex items-center gap-2 border-b border-item-7 px-1 py-1">
            <StatDateNav />
            <StatDateView />
          </div>
        </div> -->

        <!-- <pre>
      {{ trnsItemsFiltered[ Object.keys(trnsItemsFiltered).at(-1)].date }}
      </pre> -->

        <div
          v-if="isLargeScreen"
          class="mx-2 mb-0 flex flex-wrap items-center gap-2 gap-x-6 rounded-lg p-2 sm_flex-nowrap sm_justify-start sm_bg-transparent sm_p-3 sm_pt-4"
        >
          <StatTotalWithAverage
            v-for="(item, slug) in averages"
            :key="slug"
            :item="item"
          />
        </div>

        <StatMenu
          class="_mb-2 _bg-foreground-4 _px-2 sticky top-[0px] z-10 pt-0 backdrop-blur"
        />

        <LazyStatFilter class="grow pt-2" />
        <!-- <pre>{{ dayjs(avaDate).format() }}</pre> -->

        <LazyStatChartView
          v-if="
            ui.showMainChart && statPrepareDataAverageAll.sumTransactions !== 0
          "
          :isShowIncome="
            statPrepareDataAverageAll.incomeTransactions !== 0
              && appNavStore.activeTabStat !== 'expense'
          "
          :isShowExpense="
            statPrepareDataAverageAll.expenseTransactions !== 0
              && appNavStore.activeTabStat !== 'income'
          "
        />
        <div
          class="sticky top-[45px] sm_flex justify-between bg-foreground-4 px-2 backdrop-blur"
        >
          <div class="flex sm_flex-center">
            <StatDateNav />
            <StatDateView />
          </div>

          <StatChartPeriods class="flex sm_flex-center" />
        </div>

        <!-- <div class="grid gap-2">
      <StatChartPeriods class="flex-center" />
    </div> -->

        <!-- <div class="_bg-item-4 mx-2 mb-2 flex rounded-lg">
      <StatViewConfig />
    </div> -->

        <div>
          <StatGroupRound
            v-if="ui.showRoundCats"
            :categories="categoriesHey"
            :moneyTypeNumber="3"
            moneyTypeSlug="income"
          />
          <StatGroupRound
            v-if="ui.showRoundCats"
            :categories="categoriesHey2"
            :moneyTypeNumber="3"
            moneyTypeSlug="income"
          />
        </div>

        <div data-scroll-ref="stat">
          <div
            v-if="appNavStore.activeTabStat !== 'trns'"
            class="mb-8 px-2 md_mb-4 lg_px-0"
          >
            <div class="grid items-start gap-6 md_grid-cols-2 md_gap-8">
              <div
                v-for="item in moneyTypes"
                v-show="isShowGroupByType(item.slug)"
                :key="item.slug"
                class="grid gap-3 rounded-lg py-2 lg_px-2 xl_max-w-[420px]"
              >
                <div
                  @click="
                    appNavStore.activeTabStat
                      = appNavStore.activeTabStat === item.slug
                        ? 'summary'
                        : item.slug
                  "
                >
                  <StatTotalWithAverage :item="averages[item.slug]" hasBg />
                </div>

                <StatGroupRound
                  v-if="ui.showRoundCats"
                  :categories="getCategories(item.slug)"
                  :moneyTypeSlug="item.slug"
                  :moneyTypeNumber="getMoneyTypeNumber(item.slug)"
                />

                <StatGroupVertical
                  v-if="ui.showCatsVerticalChart"
                  :categories="getCategories(item.slug)"
                  :moneyTypeSlug="item.slug"
                  :moneyTypeNumber="getMoneyTypeNumber(item.slug)"
                />

                <StatHorizontal
                  v-if="ui.showCatsHorizontalList"
                  :categories="getCategories(item.slug)"
                  :moneyTypeSlug="item.slug"
                  :moneyTypeNumber="getMoneyTypeNumber(item.slug)"
                />
              </div>
            </div>
          </div>

          <div class="_max-w-[420px] grid gap-2 px-2 pt-4">
            <TrnsListWithControl
              :size="12"
              :trnsIds="combinedTrnsIds.summary"
              isShowFilter
              uiHistory
              isAutoTypes
            />

            <StatChartOptions />
            <StatViewConfig />
          </div>
        </div>

        <div class="min-h-[calc(100vh-100px)]" />
      </div>
    </div>

    <div
      class="m-3 hidden w-[360px] rounded-xl border border-item-6 bg-foreground-5 xl_block"
    >
      <TrnFormSidebar />
    </div>
  </div>

  <TrnsItemModal />
</template>
