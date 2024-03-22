<script setup lang="ts">
import dayjs from 'dayjs'
import { useWindowSize } from '@vueuse/core'
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
import { useStat } from '~/components/stat/useStatStore'
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
const statStore = useStat()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()

const { ui } = useUIView()
const { width } = useWindowSize()

const isMobileView = computed(() => width.value <= 1024)

function isShowGroupByType(type: MoneyTypeSlugSum) {
  const p1
    = appNavStore.activeTabStat === 'summary'
    || (appNavStore.activeTabStat === 'income' && type === 'income')
    || (appNavStore.activeTabStat === 'expense' && type === 'expense')

  const p2 = filterStore.period === 'all'
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
    .endOf(filterStore.periodWithoutAll)
    .diff(filterStore.date, filterStore.periodWithoutAll),
)

const periodsToShow = computed(() => {
  const chartConfigShowedPeriodsCount
    = chartStore.periods[filterStore.periodWithoutAll].showedPeriods

  const filterPeriodMaxDateCount = dayjs()
    .endOf(filterStore.periodWithoutAll)
    .diff(trnsStore.oldestTrnDate, filterStore.periodWithoutAll)

  return selectedPeriodCount.value > chartConfigShowedPeriodsCount
    ? selectedPeriodCount.value
    : chartConfigShowedPeriodsCount > filterPeriodMaxDateCount
      ? filterPeriodMaxDateCount
      : chartConfigShowedPeriodsCount
})

const statPrepareData = computed(() => {
  const periodsWithData = Array.from({ length: periodsToShow.value }).map(
    (_, index) => {
      const date = dayjs()
        .startOf(filterStore.periodWithoutAll)
        .subtract(index, filterStore.periodWithoutAll)
        .valueOf()

      // TODO?: Get trnsIds from all periods first, then filter them
      const trnsIds = getTrnsIds({
        trnsItems: trnsStore.items,
        walletsIds: filterStore.walletsIds,
        categoriesIds: filterStore.transactibleCatsIds,
        periodName: filterStore.periodWithoutAll,
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
    },
  )

  return periodsWithData
})

const statPrepareDataAverage = computed(() => {
  const fromDate = dayjs()
    .startOf(filterStore.periodWithoutAll)
    .subtract(periodsToShow.value - 1, filterStore.periodWithoutAll)
    .valueOf()

  const untilDate = dayjs()
    .startOf(filterStore.periodWithoutAll)
    .subtract(1, filterStore.periodWithoutAll)
    .valueOf()

  // TODO?: Get trnsIds from all periods first, then filter them
  const trnsIds = getTrnsIds({
    trnsItems: trnsStore.items,
    walletsIds: filterStore.walletsIds,
    categoriesIds: filterStore.transactibleCatsIds,
    periodName: filterStore.periodWithoutAll,
    fromDate,
    untilDate,
  })

  const total = getTotal({
    baseCurrencyCode: currenciesStore.base,
    rates: currenciesStore.rates,
    trnsIds,
    trnsItems: trnsStore.items,
    walletsItems: walletsStore.items,
    transferCategoriesIds: categoriesStore.transferCategoriesIds,
  })

  const totalAverage = Object.keys(total).reduce((acc, prev) => {
    acc[prev] = total[prev] / (periodsToShow.value - 1)
    return acc
  }, {} as TotalReturns)

  return {
    ...totalAverage,
    trnsIds,
  }
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

const trnsIdsInCategory = computed(() => trnsIds.value.reduce(
  (prev, trnId) => {
    const categoryId = trnsStore.items[trnId]?.categoryId
    prev[categoryId] ??= []
    prev[categoryId].push(trnId)
    return prev
  },
  {} as Record<CategoryId, TrnId[]>,
))

const categoriesTotal = computed(() => {
  const income = {}
  const expense = {}

  for (const categoryId in trnsIdsInCategory.value) {
    const totalInCategory = getTotal({
      baseCurrencyCode: currenciesStore.base,
      rates: currenciesStore.rates,
      trnsIds: trnsIdsInCategory.value[categoryId],
      trnsItems: trnsStore.items,
      walletsIds: filterStore.walletsIds,
      walletsItems: walletsStore.items,
    })

    if (totalInCategory.incomeTransactions > 0)
      income[categoryId] = totalInCategory.incomeTransactions

    if (totalInCategory.expenseTransactions > 0)
      expense[categoryId] = totalInCategory.expenseTransactions
  }

  return {
    income,
    expense,
  }
})

function getBiggestAmount(slug: MoneyTypeSlug) {
  // function getBiggestAmount2(
  //   categoriesTotal: CategoryTotal,
  //   categoriesIds: CategoryId[],
  //   moneyTypeSlug: MoneyTypeSlug,
  // ) {
  //   const biggestAmount = categoriesIds[0]
  //   return (
  //     (categoriesTotal[biggestAmount]
  //     && Math.abs(categoriesTotal[biggestAmount][moneyTypeSlug]))
  //     || 0
  //   )
  // }
  return statStore.statCurrentPeriod[slug].biggest
}

function getCategoriesIds(slug: MoneyTypeSlug): CategoryId[] {
  return Object.keys(categoriesTotal.value[slug])
}

function getColorizeType(slug: MoneyTypeSlugSum): MoneyTypeSlug {
  return statPrepareData.value[selectedPeriodCount.value][mTypes[slug]] > 0
    ? 'income'
    : 'expense'
}

function getMoneyTypeNumber(slug: MoneyTypeSlugSum): MoneyTypeNumber {
  return moneyTypes.find(t => t.slug === `${slug}`.toLowerCase())?.type ?? 3
}

function getAverageItem(slug: MoneyTypeSlugSum) {
  return {
    amount: statPrepareData.value[selectedPeriodCount.value][mTypes[slug]],
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
  'period',
  computed(() => filterStore.period),
)
provide(
  'periodWithoutAll',
  computed(() => filterStore.periodWithoutAll),
)
provide('setNextPeriodDate', filterStore.setNextPeriodDate)
provide('setPeriodAndDate', filterStore.setPeriodAndDate)
provide('setPrevPeriodDate', filterStore.setPrevPeriodDate)
</script>

<template>
  <div class="pb-6 pt-3 lg_max-w-4xl">
    <div class="sticky top-0 z-20 h-[44px] bg-foreground-4 backdrop-blur">
      <div class="flex items-center justify-between gap-2 px-2">
        <StatDateNav />
        <StatDateView />
        <CurrenciesChangeBtn />
      </div>
    </div>

    <!-- Sum All -->
    <div class="mx-2 mb-2 rounded-xl bg-item-4">
      <div
        class="flex flex-wrap sm_flex-nowrap items-center gap-4 gap-x-6 rounded-lg p-2 sm_justify-start sm_bg-transparent sm_p-3 sm_pt-4"
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

    <StatMenu class="pb-2 pt-0" />

    <div class="mx-2 flex gap-2 rounded-lg bg-item-4">
      <LazyStatFilter class="grow" />
      <StatViewConfig />
    </div>

    <!-- <div class="p-4">
      <pre class="text-sm">categoriesTotal {{ categoriesTotal }}</pre>
      <pre class="text-sm">trnsIdsInCategory {{ trnsIdsInCategory }}</pre>
    </div> -->

    <!-- <pre>statPrepareDataAverage: {{ statPrepareDataAverage }}</pre>
    <hr>

    <pre>periodsToShow: {{ periodsToShow }}</pre>
    <pre>selectedPeriodCount: {{ selectedPeriodCount }}</pre>
    <pre>{{ statPrepareData[selectedPeriodCount] }}</pre>
    <pre>getAverageItem: {{ getAverageItem("expense") }}</pre>

    <pre>{{ statPrepareData }}</pre>
 -->
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

              <StatHorizontal
                v-if="ui.showCatsHorizontalList"
                :categoriesTotal
                :categoriesIds="getCategoriesIds(item.slug)"
                :biggest="getBiggestAmount(item.slug)"
                :moneyTypeSlug="item.slug"
                :moneyTypeNumber="getMoneyTypeNumber(item.slug)"
              />

              <StatGroupVertical
                v-if="ui.showCatsVerticalChart"
                :categoriesIds="getCategoriesIds(item.slug)"
                :categoriesTotal
                :biggest="getBiggestAmount(item.slug)"
                :moneyTypeSlug="item.slug"
                :moneyTypeNumber="getMoneyTypeNumber(item.slug)"
              />

              <StatGroupRound
                v-if="ui.showRoundCats"
                :categoriesTotal
                :categoriesIds="getCategoriesIds(item.slug)"
                :moneyTypeSlug="item.slug"
                :moneyTypeNumber="getMoneyTypeNumber(item.slug)"
              />

              <template v-if="!isMobileView">
                <div
                  v-if="
                    appNavStore.activeTabStat === 'summary'
                      && statStore.statCurrentPeriod[item.slug].total !== 0
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
              <div class="pt-4 grid gap-3 rounded-lg py-2 lg_px-2 xl_max-w-[420px]">
                <StatGroupVertical
                  v-if="ui.showCatsVerticalChart"
                  :categoriesIds="getCategoriesIds(appNavStore.activeTabStat)"
                  :categoriesTotal
                  :biggest="getBiggestAmount(appNavStore.activeTabStat)"
                  :moneyTypeSlug="appNavStore.activeTabStat"
                  :moneyTypeNumber="getMoneyTypeNumber(appNavStore.activeTabStat)"
                />

                <StatGroupRound
                  v-if="ui.showRoundCats"
                  :categoriesTotal
                  :categoriesIds="getCategoriesIds(appNavStore.activeTabStat)"
                  :moneyTypeSlug="appNavStore.activeTabStat"
                  :moneyTypeNumber="getMoneyTypeNumber(appNavStore.activeTabStat)"
                />
              </div>

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
