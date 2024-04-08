<script setup lang="ts">
import dayjs from 'dayjs'
import { type MoneyTypeSlugSum, moneyTypes } from '~/components/stat/types'
import { useAppNav } from '~/components/app/useAppNav'
import { useFilter } from '~/components/filter/useFilter'
import { useStat } from '~/components/stat/useStat'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import type { ChartType } from '~/components/chart/types'

const appNavStore = useAppNav()
const filter = useFilter()
const stat = useStat(filter)
const trnFormStore = useTrnFormStore()
filter.initChart()

provide('stat', stat)
provide('filter', filter)

const group = ref('lines')

const chartSeriesOptions = {
  income: {
    color: 'var(--c-income-1)',
  },
  expense: {
    color: 'var(--c-expense-1)',
  },
  summary: {
    color: 'grey',
    type: 'line',
  },
}

const chart = ref({
  markedArea: computed(() =>
    stat.chartCategories.value.find((i: number) => +i === +filter.date.value),
  ),
  chartType: computed(
    () => filter.periods.value[filter.periodNameWithoutAll.value].type,
  ),

  getSeries: (slugs: MoneyTypeSlugSum[]) => {
    return slugs.reduce((acc, slug) => {
      acc.push({
        data: stat.statPrepareData.value.map(i => i[slug]),
        ...chartSeriesOptions[slug],
      })
      return acc
    }, [] as {
      data: number[]
      color?: string
      type?: ChartType
    }[])
  },

  onClick: (idx: number) => {
    filter.setDate(stat.chartCategories.value[idx])

    if (filter.periodNameWithoutAll.value === 'day') {
      trnFormStore.values.date = dayjs(stat.chartCategories.value[idx])
        .startOf(filter.periodNameWithoutAll.value)
        .valueOf()
    }
  },
})

const groupedCategories = computed(() => {
  return stat.getTotalCategories(stat.getRootCategoriesWithTrnsIds(stat.trnsIds.value))
})
</script>

<template>
  <div class="grid h-full overflow-hidden xl_grid-cols-[1fr_auto]">
    <div
      class="h-full overflow-hidden overflow-y-auto px-3 pb-6 sm_px-1 lg_px-3"
    >
      <div class="lg_max-w-4xl lg_px-4 lg_px-8 lg_py-4">
        <div
          class="sm-gap-0 sticky z-50 top-[0px] flex flex-col justify-between gap-2 bg-foreground-4 py-2 backdrop-blur sm_flex-row"
        >
          <div class="sm_flex-center flex">
            <StatDateNav />
            <StatDateView />
          </div>

          <StatChartPeriods class="sm_flex-center flex" />
        </div>

        <div
          class="sticky top-[40px] z-50 flex items-center border-b border-item-5 bg-foreground-4 py-2 backdrop-blur"
        >
          <StatMenu class="flex grow items-center sm_gap-2" />
          <div class="hidden md_flex md_justify-end">
            <StatChartOptions />
          </div>
        </div>

        <div class="grid gap-3" data-scroll-ref="stat">
          <StatFilter class="grow pt-2" />

          <div class="mb-8 md_mb-4">
            <div class="_grid items-start gap-6 md_grid-cols-2 md_gap-8">
              <div
                v-if="appNavStore.activeTabStat === 'trns'"
                class="px-2 py-2 sm_px-1.5 sm_pt-3"
              >
                <TrnsListWithControl
                  :size="12"
                  :trnsIds="stat.trnsIds.value"
                  isShowFilter
                  uiHistory
                  isAutoTypes
                  defaultFilterTrnsPeriod="period"
                />
              </div>

              <div
                v-else-if="appNavStore.activeTabStat === 'periods'"
                class="py-2 sm_pt-3"
              >
                <StatPeriodsLines />
              </div>

              <div v-else class="grid gap-4">
                <div v-if="appNavStore.activeTabStat === 'summary'" class="grid gap-3">
                  <StatTotalWithAverage
                    :item="stat.averages.value.sum"
                    hasBg
                  />
                  <LazyStatChartView
                    v-if="stat.statPrepareDataAll.value.summary !== 0"
                    :categories="stat.chartCategories.value"
                    :isShowDataLabels="filter.ui.value.isShowDataLabels"
                    :markedArea="chart.markedArea"
                    :periodName="filter.periodNameWithoutAll.value"
                    :series="chart.getSeries(['income', 'expense', 'summary'])"
                    chartType="bar"
                    @click="chart.onClick"
                  />
                </div>

                <div class="grid items-start gap-4 md_grid-cols-2 md_gap-6">
                  <div
                    v-for="item in moneyTypes"
                    v-show="stat.isShowGroupByType(item.slug)"
                    :key="item.slug"
                    class="md_max-w-sm grid gap-3 lg_py-2 lg_px-2"
                  >
                    <StatTotalWithAverage
                      :item="stat.averages.value[item.slug]"
                      hasBg
                    />

                    <div>
                      <LazyStatChartView
                        v-if="stat.statPrepareDataAll.value.summary !== 0"
                        :markedArea="chart.markedArea"
                        :categories="stat.chartCategories.value"
                        :series="chart.getSeries([item.slug])"
                        :chartType="chart.chartType"
                        :periodName="filter.periodNameWithoutAll.value"
                        :isShowDataLabels="filter.ui.value.isShowDataLabels"
                        @click="chart.onClick"
                      />

                      <UiTabs2 class="gap-1">
                        <UiTabsItem2
                          :isActive="group === 'empty'"
                          @click="group = 'empty'"
                        >
                          Empty
                        </UiTabsItem2>

                        <UiTabsItem2
                          :isActive="group === 'lines'"
                          @click="group = 'lines'"
                        >
                          Lines
                        </UiTabsItem2>
                        <UiTabsItem2
                          :isActive="group === 'lines2'"
                          @click="group = 'lines2'"
                        >
                          G-Lines
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
                    </div>

                    <div v-if="group !== 'empty'" class="max-w-sm">
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
                        v-if="group === 'lines2'"
                        :categories="groupedCategories[item.slug]"
                        :moneyTypeSlug="item.slug"
                        :moneyTypeNumber="stat.getMoneyTypeNumber(item.slug)"
                      />

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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <TrnsItemModal />
  <TrnFormWrap />
</template>

<i18n lang="yaml">
en:
  lines: Lines

ru:
  lines: Lines
</i18n>
