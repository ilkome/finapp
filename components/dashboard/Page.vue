<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { moneyTypes } from '~/components/stat/types'
import type { MoneyTypeNumber, MoneyTypeSlug, MoneyTypeSlugSum } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import useUIView from '~/components/layout/useUIView'
import { useAppNav } from '~/components/app/useAppNav'
import { useFilter } from '~/components/filter/useFilter'
import { useStat } from '~/components/stat/useStatStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const trnsStore = useTrnsStore()
const statStore = useStat()
const filterStore = useFilter()
const appNavStore = useAppNav()
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

const isShowGroupTrns = computed(() => {
  const p1
    = appNavStore.activeTabStat === 'income' || appNavStore.activeTabStat === 'expense'
  const p2 = statStore.statAverage?.sum === 0
  return p1 || p2
})

const combinedTrnsIds = computed(() => ({
  all: trnsStore.selectedTrnsIdsWithDate,
  income: trnsStore.selectedTrnsIdsWithDate.filter((id: TrnId) => trnsStore.items[id].type === 1),
  expense: trnsStore.selectedTrnsIdsWithDate.filter((id: TrnId) => trnsStore.items[id].type === 0),
}),
)

function getMoneyTypeNumber(slug: MoneyTypeSlugSum): MoneyTypeNumber {
  return moneyTypes.find(t => t.id === `${slug}`.toLowerCase())?.type || 3
}

function getAmount(slug: MoneyTypeSlugSum) {
  if (slug === 'sum')
    return statStore.statCurrentPeriod.income.total - statStore.statCurrentPeriod.expense.total

  return statStore.statCurrentPeriod[slug].total
}

function getColorizeType(slug: MoneyTypeSlugSum) {
  if (slug === 'sum') {
    return statStore.statCurrentPeriod.income.total - statStore.statCurrentPeriod.expense.total > 0
      ? 'income'
      : 'expense'
  }
  return slug
}

function isItShownAverage(slug: MoneyTypeSlugSum) {
  if (slug === 'sum')
    return statStore.statAverage?.sum !== 0
  return statStore.statAverage[slug] !== 0
}

function getAverageAmount(slug: MoneyTypeSlugSum) {
  if (slug === 'sum')
    return statStore.statAverage?.sum
  return statStore.statAverage[slug]
}

function getBiggestAmount(slug: MoneyTypeSlug) {
  return statStore.statCurrentPeriod[slug].biggest
}

function getCategoriesIds(slug: MoneyTypeSlug) {
  return statStore.statCurrentPeriod[slug].categoriesIds
}

function getAverageItem(slug: MoneyTypeSlugSum) {
  return {
    amount: getAmount(slug),
    averageAmount: getAverageAmount(slug),
    colorizeType: getColorizeType(slug),
    isShownAverage: isItShownAverage(slug),
    moneyTypeNumber: getMoneyTypeNumber(slug),
    moneyTypeSlugSum: slug,
  }
}

const averages = computed(() => {
  const averageSlugs = ['income', 'expense', 'sum'] as const

  return averageSlugs.reduce((acc, slug) => {
    acc[slug] = getAverageItem(slug)
    return acc
  }, {} as Record<MoneyTypeSlugSum, ReturnType<typeof getAverageItem>>)
})

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
        class="flex flex-wrap items-center gap-3 gap-x-6 rounded-lg bg-item-4 p-2 sm_justify-start sm_bg-transparent sm_p-3 sm_pt-4"
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

              <StatGroupVertical :moneyTypeSlug="item.slug" />
              <StatGroupRound :moneyTypeSlug="item.slug" />
              <StatHorizontal
                v-if="ui.showCatsHorizontalList"
                :categoriesIds="getCategoriesIds(item.slug)"
                :biggest="getBiggestAmount(item.slug)"
                :moneyTypeSlug="item.slug"
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
            :trnsIds="statStore.statCurrentPeriod.trnsIds"
            isFilterByDay
            defaultFilterTrnsPeriod="period"
          />
        </div>
      </template>
    </div>
  </div>
</template>
