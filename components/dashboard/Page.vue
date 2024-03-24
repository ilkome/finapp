<script setup lang="ts">
import dayjs from 'dayjs'
import { useMediaQuery, useWindowSize } from '@vueuse/core'
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
const filterStore = useFilter()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()

const { ui } = useUIView()
const { width } = useWindowSize()

const isMobileView = computed(() => width.value <= 1024)
const isLargeScreen = useMediaQuery('(min-width: 640px)')

function isShowGroupByType(type: MoneyTypeSlugSum) {
  const p1
    = appNavStore.activeTabStat === 'summary'
    || (appNavStore.activeTabStat === 'income' && type === 'income')
    || (appNavStore.activeTabStat === 'expense' && type === 'expense')

  const p2 = filterStore.periodNameWithAll === 'all'
  return p1 || p2
}

const combinedTrnsIds = computed(() => ({
  all: trnsStore.selectedTrnsIdsWithDate,
  income: trnsStore.selectedTrnsIdsWithDate.filter(
    (id: TrnId) => trnsStore.items[id].type === 1,
  ),
  expense: trnsStore.selectedTrnsIdsWithDate.filter(
    (id: TrnId) => trnsStore.items[id].type === 0,
  ),
}))

const selectedPeriodCount = computed(() =>
  dayjs()
    .endOf(filterStore.periodNameWithoutAll)
    .diff(filterStore.date, filterStore.periodNameWithoutAll),
)

const filterPeriodMaxDateCount = computed(() =>
  dayjs()
    .endOf(filterStore.periodNameWithoutAll)
    .diff(trnsStore.oldestTrnDate, filterStore.periodNameWithoutAll),
)

const chartConfigShowedPeriodsCount = computed(
  () => chartStore.periods[filterStore.periodNameWithoutAll].showedPeriods,
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
      .startOf(filterStore.periodNameWithoutAll)
      .subtract(index, filterStore.periodNameWithoutAll)
      .valueOf()

    // TODO?: Get trnsIds from all periods first, then filter them
    const trnsIds = getTrnsIds({
      trnsItems: trnsStore.items,
      walletsIds: filterStore.walletsIds,
      categoriesIds: filterStore.transactibleCatsIds,
      periodName: filterStore.periodNameWithoutAll,
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

const isShowGroupTrns = computed(() => {
  const p1
    = appNavStore.activeTabStat === 'income'
    || appNavStore.activeTabStat === 'expense'
  const p2 = statPrepareDataAverage.value.sumTransactions === 0
  return p1 || p2
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

interface CategoryTotal {
  income: Record<CategoryId, TotalReturns['incomeTransactions'][]>
  expense: Record<CategoryId, TotalReturns['expenseTransactions'][]>
}

const trnsIds = computed(() => trnsStore.filteredTrnsIds)

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
        walletsIds: filterStore.walletsIds,
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

provide('periodsToShow', periodsToShow)
provide('statData', statData)

provide(
  'date',
  computed(() => filterStore.date),
)
provide('setDate', filterStore.setDate)

provide(
  'periodNameWithAll',
  computed(() => filterStore.periodNameWithAll),
)
provide(
  'periodNameWithoutAll',
  computed(() => filterStore.periodNameWithoutAll),
)
provide('setNextPeriodDate', filterStore.setNextPeriodDate)
provide('setPeriodAndDate', filterStore.setPeriodAndDate)
provide('setPrevPeriodDate', filterStore.setPrevPeriodDate)

const selectedPeriodDate = computed(() => {
  const today = dayjs().startOf(filterStore.periodNameWithoutAll)
  const selected = dayjs(filterStore.date).startOf(filterStore.periodNameWithoutAll)
  const diff = dayjs(today).diff(selected, filterStore.periodNameWithoutAll)

  return {
    today,
    selected,
    diff,
  }
})
</script>

<template>
  <div class="pb-6 lg_max-w-4xl">
    <div class="sticky top-0 z-20 bg-foreground-4 backdrop-blur">
      <div class="flex items-center justify-between py-1 gap-2 px-1 border-b border-item-5">
        <StatDateNav />
        <StatDateView />
        <CurrenciesChangeBtn />
      </div>
    </div>

    <!-- Sum All -->
    <div class="_mt-2 _mx-2 _mb-2 rounded-lg _bg-item-4">
      <div
        v-if="isLargeScreen"
        class="mb-0 mx-2 flex flex-wrap items-center gap-2 gap-x-6 rounded-lg p-2 sm_flex-nowrap sm_justify-start sm_bg-transparent sm_p-3 sm_pt-4"
      >
        <StatTotalWithAverage
          v-for="(item, slug) in averages"
          :key="slug"
          :item="item"
        />
      </div>

      <LazyStatChartWrap
        v-if="ui.showMainChart"
        :trnsIds="Object.keys(trnsStore.items ?? {})"
      />
    </div>

    <div class="mx-2 mb-2 flex gap-2 rounded-lg bg-item-4">
      <LazyStatFilter class="grow" />
      <StatViewConfig />
    </div>

    <StatMenu class="sticky top-[41px] z-20 bg-foreground-4 px-2 mb-2 pt-0 backdrop-blur" />

    <div class="max-w-md mx-2 grid _bg-item-4 _rounded-lg overflow-hidden _border border-item-3">
      <div
        v-for="item in statPrepareData"
        :key="item.date"
        class="flex items-center gap-3 _rounded-lg _bg-item-4 py-1 _px-3 hocus_bg-item-5 border-b border-item-3"
        :class="{ '!bg-foreground-4': item.date === filterStore.date }"
        @click="filterStore.setDate(item.date)"
      >
        <div class="text-sm font-medium text-secondary2">
          {{ dayjs(item.date).format('YYYY MMMM') }}
        </div>
        <div class="_flex justify-end gap-3 grow">
          <Amount
            :amount="item.expenseTransfers"
            :currencyCode="currenciesStore.base"
            :type="0"
            colorize="expense"
            :isShowBaseRate="false"
          />
          <Amount
            :amount="item.incomeTransactions"
            :currencyCode="currenciesStore.base"
            :type="1"
            colorize="income"
            :isShowBaseRate="false"
          />
          <Amount
            :amount="item.sumTransactions"
            :currencyCode="currenciesStore.base"
            :type="3"
            :isShowBaseRate="false"
          />
        </div>
      </div>
    </div>

    <div class="min-h-[calc(100vh-130px)]" data-scroll-ref="stat">
      <template v-if="appNavStore.activeTabStat !== 'trns'">
        <div class="mb-8 px-2 md_mb-4 lg_px-0">
          <div class="grid items-start gap-6 md_grid-cols-2 md_gap-8">
            <div
              v-for="item in moneyTypes"
              v-show="isShowGroupByType(item.slug)"
              :key="item.slug"
              class="grid gap-3 rounded-lg py-2 lg_px-2 xl_max-w-[420px]"
            >
              <StatTotalWithAverage :item="averages[item.slug]" hasBg />
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

              <template v-if="!isMobileView">
                <div
                  v-if="
                    appNavStore.activeTabStat === 'summary'
                      && statPrepareData[selectedPeriodCount][mTypes[item.slug]]
                        !== 0
                      && combinedTrnsIds[item.slug].length > 0
                  "
                  class="grid max-w-[420px] gap-2 pt-4"
                >
                  <UiTitle>{{ $t("trns.inPeriodTitle") }}</UiTitle>
                  <TrnsList
                    :size="12"
                    :trnsIds="combinedTrnsIds[item.slug]"
                    isShowFilter
                    uiHistory
                  />
                </div>
              </template>
            </div>

            <!-- Trns on right -->
            <div
              v-if="
                isShowGroupTrns
                  && appNavStore.activeTabStat !== 'summary'
                  && combinedTrnsIds[appNavStore.activeTabStat].length > 0
              "
              class="max-w-[420px]"
            >
              <UiTitle2 class="pb-3">
                {{ $t("trns.inPeriodTitle") }}
              </UiTitle2>
              <TrnsList
                :size="12"
                :trnsIds="combinedTrnsIds[appNavStore.activeTabStat]"
                classes="md_grid-cols-1"
                isShowFilter
                uiHistory
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Trns -->
      <template v-else>
        <div class="mb-4 px-2">
          <TrnsListWithControl
            :trnsIds="trnsStore.filteredTrnsIds"
            isFilterByDay
            defaultFilterTrnsPeriod="period"
          />
        </div>
      </template>
    </div>
  </div>
</template>
