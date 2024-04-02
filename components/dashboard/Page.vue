<script setup lang="ts">
import dayjs from 'dayjs'
import localforage from 'localforage'
import { useMediaQuery } from '@vueuse/core'
import useUIView from '~/components/layout/useUIView'
import { moneyTypes } from '~/components/stat/types'
import { useAppNav } from '~/components/app/useAppNav'
import { useFilter } from '~/components/filter/useFilter'
import { useStat } from '~/components/stat/useStat'
import { formatDateByPeriod2 } from '~/components/date/format'

const appNavStore = useAppNav()
const filter = useFilter()
const stat = useStat(filter)

const { t } = useI18n()

function getFormattedDate(date: number) {
  return formatDateByPeriod2(date, filter.periodNameWithoutAll.value, {
    current: t('dates.week.current'),
    last: t('dates.week.last'),
  })
}

const { ui } = useUIView()
const isLargeScreen = useMediaQuery('(min-width: 640px)')

async function initFilter() {
  filter.setPeriodAndDate(await localforage.getItem('finapp.filter.period') ?? 'month')
  filter.setDate(await localforage.getItem('finapp.filter.date') ?? dayjs().valueOf())
}

initFilter()

provide('periodsToShow', stat.periodsToShow)
provide('statData', stat.statData)
provide('filter', filter)
provide('filters', stat.filters)

const group = ref('lines')
</script>

<template>
  <div class="grid h-full overflow-hidden xl_grid-cols-[1fr_auto]">
    <div class="h-full overflow-hidden overflow-y-auto px-3 pb-6">
      <div class="md_px-4 lg_px-8 lg_py-4 lg_max-w-4xl">
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
          class="mx-2 mb-0 flex flex-wrap items-center gap-2 gap-x-6 rounded-lg py-2 sm_flex-nowrap sm_justify-start sm_bg-transparent sm_py-3 sm_pt-4"
        >
          <StatTotalWithAverage
            v-for="(item, slug) in stat.averages.value"
            :key="slug"
            :item="item"
          />
        </div>

        <!-- <pre>{{ dayjs(avaDate).format() }}</pre> -->

        <LazyStatChartView
          v-if="
            ui.showMainChart && stat.statPrepareDataAverageAll.value.sumTransactions !== 0
          "
          :isShowIncome="
            stat.statPrepareDataAverageAll.value.incomeTransactions !== 0
              && appNavStore.activeTabStat !== 'expense'
          "
          :isShowExpense="
            stat.statPrepareDataAverageAll.value.expenseTransactions !== 0
              && appNavStore.activeTabStat !== 'income'
          "
        />
        <div
          class="sm-gap-0 sticky top-[-5px] justify-between gap-2 bg-foreground-4 px-2 py-2 backdrop-blur flex flex-col sm_flex-row"
        >
          <div class="sm_flex-center flex">
            <StatDateNav />
            <StatDateView />
          </div>

          <StatChartPeriods class="sm_flex-center flex" />
        </div>

        <StatMenu
          class="_mt-2 _px-2 sticky top-[35px] z-10 mx-1.5 flex items-center gap-2 border-b border-item-3 bg-foreground-4 px-1 py-2 backdrop-blur"
        />
        <!-- <div class="grid gap-2">
      <StatChartPeriods class="flex-center" />
    </div> -->

        <!-- <div class="_bg-item-4 mx-2 mb-2 flex rounded-lg">
      <StatViewConfig />
    </div> -->

        <div>
          <StatGroupRound
            v-if="ui.showRoundCats"
            :categories="stat.categoriesHey.value"
            :moneyTypeNumber="3"
            moneyTypeSlug="income"
          />
          <StatGroupRound
            v-if="ui.showRoundCats"
            :categories="stat.categoriesHey2.value"
            :moneyTypeNumber="3"
            moneyTypeSlug="income"
          />
        </div>

        <div data-scroll-ref="stat">
          <StatFilter v-if2="filter.isShow.value" class="grow pt-2 px-2" />
          <div
            v-if="appNavStore.activeTabStat !== 'trns'"
            class="mb-8 px-2 md_mb-4 lg_px-0"
          >
            <div class="grid items-start gap-6 md_grid-cols-2 md_gap-8">
              <div class="grid gap-4">
                <div
                  v-for="item in moneyTypes"
                  v-show="stat.isShowGroupByType(item.slug)"
                  :key="item.slug"
                  class="grid gap-3 rounded-lg py-2 lg_px-2 xl_max-w-[420px]"
                >
                  <StatTotalWithAverage :item="stat.averages.value[item.slug]" hasBg />

                  <UiTabs2 class="ml-1 gap-1">
                    <UiTabsItem2
                      :isActive="group === 'lines'"
                      @click="group = 'lines'"
                    >
                      Lines
                    </UiTabsItem2>

                    <UiTabsItem2
                      :isActive="group === 'round'"
                      @click="group = 'round'"
                    >
                      Round
                    </UiTabsItem2>
                    <UiTabsItem2
                      :isActive="group === 'bars'"
                      @click="group = 'bars'"
                    >
                      Bars
                    </UiTabsItem2>

                    <UiTabsItem2
                      :isActive="group === 'trns'"
                      @click="group = 'trns'"
                    >
                      Trns
                    </UiTabsItem2>
                  </UiTabs2>

                  <StatGroupRound
                    v-if="group === 'round'"
                    :categories="stat.getCategories(item.slug)"
                    :moneyTypeSlug="item.slug"
                    :moneyTypeNumber="stat.getMoneyTypeNumber(item.slug)"
                  />

                  <StatGroupVertical
                    v-if="group === 'bars'"
                    :categories="stat.getCategories(item.slug)"
                    :moneyTypeSlug="item.slug"
                    :moneyTypeNumber="stat.getMoneyTypeNumber(item.slug)"
                  />

                  <StatHorizontal
                    v-if="group === 'lines'"
                    :categories="stat.getCategories(item.slug)"
                    :moneyTypeSlug="item.slug"
                    :moneyTypeNumber="stat.getMoneyTypeNumber(item.slug)"
                  />

                  <TrnsListWithControl
                    v-if="group === 'trns'"
                    :size="12"
                    :trnsIds="stat.combinedTrnsIds.value.summary"
                    isShowFilter
                    uiHistory
                    isAutoTypes
                    defaultFilterTrnsPeriod="period"
                  />
                </div>
              </div>

              <div>
                <div class="flex justify-end">
                  <div class="grid gap-2 grow my-6 max-w-xs bg-item-4 border border-item-6 rounded-lg px-1 pt-1">
                    <div class="pt-2 px-2">
                      <UiTitle2>
                        {{ filter.periods.value[filter.nameWithoutAll.value].showedPeriods }}
                        Periods
                      </UiTitle2>
                      <div class="text-xs text-secondary font-mono">
                        {{ getFormattedDate(stat.statPrepareData.value[0].date) }} - {{ getFormattedDate(stat.statPrepareData.value.at(-1)?.date) }}
                      </div>
                    </div>

                    <div class="grid ">
                      <div
                        v-for="(item, idx) in stat.statPrepareData.value"
                        :key="item.date"
                        class="flex items-center font-mono py-1 px-2 border-b border-item-5 hocus_rounded-md px-2 py-2 text-secondary hocus_bg-item-5"
                        :class="{ 'bg-item-8 rounded-md': item.date === filter.date.value }"
                        @click="filter.setDate(item.date)"
                      >
                        <div class="grow text-xs text-secondary">
                          {{ getFormattedDate(item.date) }}
                        </div>
                        <div class="text-xs px-2">
                          {{ Math.ceil(((stat.statPrepareData.value[idx]?.expenseTransactions - stat.statPrepareData.value[idx + 1]?.expenseTransactions) / ((stat.statPrepareData.value[idx]?.expenseTransactions + stat.statPrepareData.value[idx + 1]?.expenseTransactions) / 2)) * 100) }}
                        </div>
                        <Amount :amount="item.expenseTransactions" currencyCode="RUB" />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex justify-end">
                  <StatChartOptions />
                  <StatViewConfig />
                </div>
              </div>
            </div>
          </div>

          <!-- <div class="_max-w-[420px] grid gap-2 px-1 pt-4">
            <TrnsListWithControl
              :size="12"
              :trnsIds="stat.combinedTrnsIds.value.summary"
              isShowFilter
              uiHistory
              isAutoTypes
              defaultFilterTrnsPeriod="period"
            />

            <StatChartOptions />
            <StatViewConfig />
          </div> -->
        </div>

        <div class="min-h-[calc(100vh-100px)]" />
      </div>
    </div>

    <!-- <div
      class="m-3 hidden w-[360px] rounded-xl border border-item-6 bg-foreground-5 xl_block"
    >
      <TrnFormSidebar />
    </div> -->
  </div>

  <TrnsItemModal />
  <TrnFormWrap />
</template>
