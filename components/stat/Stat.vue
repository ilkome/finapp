<script setup lang="ts">
import dayjs from 'dayjs'
import localforage from 'localforage'
import { useMediaQuery } from '@vueuse/core'
import useUIView from '~/components/layout/useUIView'
import { moneyTypes } from '~/components/stat/types'
import { useAppNav } from '~/components/app/useAppNav'
import { useFilter } from '~/components/filter/useFilter'
import { useStat } from '~/components/stat/useStat'

const appNavStore = useAppNav()
const filter = useFilter()
const stat = useStat(filter)

const { ui } = useUIView()
const isLargeScreen = useMediaQuery('(min-width: 640px)')

async function initFilter() {
  filter.initChart()
}

initFilter()

provide('stat', stat)
provide('filter', filter)

const group = ref('lines')
</script>

<template>
  <div class="grid h-full overflow-hidden xl_grid-cols-[1fr_auto]">
    <div class="h-full overflow-hidden overflow-y-auto px-3 sm_px-1 lg_px-3 pb-6">
      <div class="lg_px-4 lg_px-8 lg_py-4 lg_max-w-4xl">
        <LazyStatChartView
          v-if="
            ui.showMainChart && stat.statPrepareDataAll.value.summary !== 0
          "
          :isShowIncome="
            stat.statPrepareDataAll.value.income !== 0
              && appNavStore.activeTabStat !== 'expense'
          "
          :isShowExpense="
            stat.statPrepareDataAll.value.expense !== 0
              && appNavStore.activeTabStat !== 'income'
          "
          :isShowSummary="
            stat.statPrepareDataAll.value.summary !== 0
              && appNavStore.activeTabStat === 'summary'
          "
        />
        <div
          class="sm-gap-0 sticky top-[-5px] justify-between gap-2 bg-foreground-4 py-2 backdrop-blur flex flex-col sm_flex-row"
        >
          <div class="sm_flex-center flex">
            <StatDateNav />
            <StatDateView />
          </div>

          <StatChartPeriods class="sm_flex-center flex" />
        </div>

        <StatMenu
          class="sticky top-[35px] z-10 flex items-center sm_gap-2 border-b border-item-5 bg-foreground-4 py-2 backdrop-blur"
        />

        <!-- <pre>{{ stat }}</pre> -->
        <!-- <pre>{{ filter }}</pre> -->
        <div data-scroll-ref="stat">
          <StatFilter class="grow pt-2" />

          <!-- <div
            v-if="isLargeScreen"
            class="mx-2 mb-0 flex flex-wrap items-center gap-2 gap-x-6 rounded-lg py-2 sm_flex-nowrap sm_justify-between sm_bg-transparent sm_py-3 sm_pt-4"
          >
            <StatTotalWithAverage
              v-for="(item, slug) in stat.averages.value"
              :key="slug"
              :item="item"
            />
          </div> -->

          <div class="mb-8 md_mb-4">
            <div class="grid items-start gap-6 md_grid-cols-2 md_gap-8">
              <div v-if="appNavStore.activeTabStat === 'trns'" class="px-2 py-2 sm_px-1.5 sm_pt-3">
                <TrnsListWithControl
                  :size="12"
                  :trnsIds="stat.trnsIds.value"
                  isShowFilter
                  uiHistory
                  isAutoTypes
                  defaultFilterTrnsPeriod="period"
                />
              </div>

              <div v-else-if="appNavStore.activeTabStat === 'periods'" class="py-2 sm_pt-3">
                <StatPeriodsLines />
              </div>

              <div v-else class="grid gap-4">
                <div
                  v-for="item in moneyTypes"
                  v-show="stat.isShowGroupByType(item.slug)"
                  :key="item.slug"
                  class="grid gap-3 rounded-lg py-2 lg_px-2 xl_max-w-[420px]"
                >
                  <StatTotalWithAverage :item="stat.averages.value[item.slug]" hasBg />

                  <UiTabs2 class="gap-1">
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

                    <!-- <UiTabsItem2
                      :isActive="group === 'bars'"
                      @click="group = 'bars'"
                    >
                      Bars
                    </UiTabsItem2> -->

                    <UiTabsItem2
                      :isActive="group === 'trns'"
                      @click="group = 'trns'"
                    >
                      Trns
                    </UiTabsItem2>
                  </UiTabs2>

                  <StatGroupRound
                    v-if="group === 'round'"
                    :categories="stat.totalCategories.value[item.slug]"
                    :moneyTypeSlug="item.slug"
                    :moneyTypeNumber="stat.getMoneyTypeNumber(item.slug)"
                  />

                  <!-- <StatGroupVertical
                    v-if="group === 'bars'"
                    :categories="stat.totalCategories.value[item.slug]"
                    :moneyTypeSlug="item.slug"
                    :moneyTypeNumber="stat.getMoneyTypeNumber(item.slug)"
                  /> -->

                  <!-- <StatGroupHorizontal2
                    v-if="group === 'lines'"
                    :categories="stat.totalCategories.value[item.slug]"
                    :moneyTypeSlug="item.slug"
                    :moneyTypeNumber="stat.getMoneyTypeNumber(item.slug)"
                  /> -->

                  <StatGroupHorizontal
                    v-if="group === 'lines'"
                    :categories="stat.totalCategories.value[item.slug]"
                    :moneyTypeSlug="item.slug"
                    :moneyTypeNumber="stat.getMoneyTypeNumber(item.slug)"
                  />

                  <TrnsListWithControl
                    v-if="group === 'trns'"
                    :size="12"
                    :trnsIds="stat.trnsIds.value"
                    :initTrnType="stat.getMoneyTypeNumber(item.slug)"
                    isShowFilter
                    class="px-2"
                    uiHistory
                    isAutoTypes
                    defaultFilterTrnsPeriod="period"
                  />
                </div>
              </div>

              <div>
                <StatPeriods class="sticky top-[60px]" />
                <div class="flex md_justify-end">
                  <StatChartOptions />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="min-h-[calc(90vh)]" />
      </div>
    </div>
  </div>

  <TrnsItemModal />
  <TrnFormWrap />
</template>
