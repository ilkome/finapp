<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import { useAppNav } from '~/components/app/useAppNav'
import type { ChartType } from '~/components/chart/types'
import { useFilter } from '~/components/filter/useFilter'
import { type MoneyTypeSlugSum, moneyTypes } from '~/components/stat/types'
import { useStat } from '~/components/stat/useStat'
import { useSimpleTabs } from '~/components/tabs/useUtils'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { getTrnsIds } from '~/components/trns/getTrns'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const appNavStore = useAppNav()
const filter = useFilter()
const stat = useStat(filter)
const trnFormStore = useTrnFormStore()
// const trnsStore = useTrnsStore()
const { t } = useI18n()

filter.initChart()

provide('stat', stat)
provide('filter', filter)

const statTabs = useSimpleTabs('dashboardStats', [{
  localeKey: 'stat.tabs.empty',
  slug: 'empty',
}, {
  localeKey: 'stat.tabs.lines',
  slug: 'lines',
}, {
  localeKey: 'stat.tabs.gLines',
  slug: 'gLines',
}, {
  localeKey: 'stat.tabs.round',
  slug: 'round',
}, {
  localeKey: 'stat.tabs.trns',
  slug: 'trns',
}])

const total = useToggle({ name: 'total' })

const chartSeriesOptions = {
  expense: {
    color: 'var(--c-expense-1)',
  },
  income: {
    color: 'var(--c-income-1)',
  },
  summary: {
    color: 'grey',
    type: 'line',
  },
} as const

const chart = ref({
  chartType: computed(
    () => filter.periods.value[filter.periodNameWithoutAll.value].type,
  ),
  getSeries: (slugs: MoneyTypeSlugSum[]) => {
    return slugs.reduce(
      (acc, slug) => {
        acc.push({
          data: stat.statPrepareData.value.map(i => i[slug]),
          ...chartSeriesOptions[slug],
        })
        return acc
      },
      [] as {
        color?: string
        data: number[]
        type?: ChartType
      }[],
    )
  },

  markedArea: computed(() =>
    stat.chartCategories.value.find((i: number) => +i === +filter.date.value),
  ),

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
  return stat.getTotalCategories(
    stat.getRootCategoriesWithTrnsIds(stat.trnsIds.value),
  )
})

function useToggle({ name }: { name: string }) {
  const isShown = useStorage(name, true)
  const show = () => (isShown.value = true)
  const hide = () => (isShown.value = false)
  const toggle = () => (isShown.value ? hide() : show())

  return {
    hide,
    isShown,
    show,
    toggle,
  }
}

// const selectedTrnsIds = computed(() => getTrnsIds({
//   trnsItems: trnsStore.items,
//   categoriesIds: filter.catsIds.value,
//   walletsIds: filter.walletsIds.value,
//   dates: {
//     from: dayjs().startOf(filter.periodNameWithoutAll.value).subtract(stat.periodsToShow.value, filter.periodNameWithoutAll.value).valueOf(),
//     until: dayjs().endOf('day').subtract(1, filter.periodNameWithoutAll.value).valueOf(),
//   },
// }))

// // const categoriesWithTrnsIds = computed(() => stat.getCategoriesWithTrnsIds(selectedTrnsIds.value))
const isShow = ref(false)

const periodGrouped = ref('period')
</script>

<template>
  <Teleport to="body">
    <BaseBottomSheet3
      v-if="isShow"
      :isShow="isShow"
      drugClassesCustom="h-[50vh] bg-item-3"
      @closed="() => isShow = false"
    >
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>
    </BaseBottomSheet3>
  </Teleport>

  <!-- <div class="fixed left-0 top-0 inset-0 size-full" @click.prevent="isShow = !isShow">
    isShow
  </div> -->

  <div class="grid h-full overflow-hidden xl_grid-cols-[1fr_auto]">
    <div
      class="h-full overflow-hidden overflow-y-auto px-3 pb-6 sm_px-1 lg_px-3"
    >
      <div class="lg_max-w-6xl lg_px-8 lg_py-0">
        <div
          class="sm-gap-0 sticky top-[0px] z-50 flex flex-col justify-between gap-2 bg-foreground-4 py-2 backdrop-blur sm_flex-row"
        >
          <StatMenu class="flex grow items-center sm_gap-2" />
          <div class="hidden md_flex md_justify-end">
            <StatChartOptions />
          </div>
        </div>

        <div
          class="sticky top-[40px] z-50 flex items-center border-b border-item-5 bg-foreground-4 pb-2 backdrop-blur"
        >
          <div class="flex grow">
            <StatDateNav />
            <StatDateView />
          </div>

          <StatPeriodsSelector class="hidden md_flex" />
        </div>

        <!-- <pre>{{ categoriesWithTrnsIds }}</pre> -->

        <div class="grid gap-3" data-scroll-ref="stat">
          <Filter class="grow pt-2" />

          <div class="mb-8 md_mb-4">
            <div class="_grid items-start gap-6 md_grid-cols-2 md_gap-8">
              <div
                v-if="appNavStore.activeTabStat === 'trns'"
                class="px-2 py-2 sm_px-1.5 sm_pt-3"
              >
                <TrnsListWithControl
                  :defaultFilterTrnsPeriod="periodGrouped"
                  :size="12"
                  :trnsIds="periodGrouped === 'period' ? stat.trnsIds.value : stat.getTrnsIdsWithFilterNoDates()"
                  class="px-2"
                  isShowFilter
                  uiHistory
                  @onChangePeriod="v => periodGrouped = v"
                />
              </div>

              <div
                v-else-if="appNavStore.activeTabStat === 'periods'"
                class="py-2 sm_pt-3"
              >
                <StatPeriodsLines />
              </div>

              <div v-else class="grid gap-4">
                <!-- Total -->
                <div
                  v-if="appNavStore.activeTabStat === 'summary'"
                  class="grid gap-3 lg_px-2 lg_py-2"
                >
                  <div class="flex">
                    <StatTotalWithAverage
                      v-if="total.isShown.value"
                      :item="stat.averages.value.sum"
                      hasBg
                      @click="total.toggle"
                    />
                    <div
                      v-if="!total.isShown.value"
                      class="flex grow items-center px-2 py-2 sm_px-1.5 sm_pt-3"
                    >
                      <UiTitle2
                        @click="total.toggle"
                      >
                        {{ $t(`money.sum`) }}
                      </UiTitle2>
                      <UiIconChevron class="rotate-120 size-4 text-secondary" />
                    </div>
                  </div>

                  <LazyStatChartView
                    v-if="
                      stat.statPrepareAllData.value.summary !== 0
                        && total.isShown.value
                    "
                    :categories="stat.chartCategories.value"
                    :isShowDataLabels="filter.ui.value.isShowDataLabels"
                    :markedArea="chart.markedArea"
                    :periodName="filter.periodNameWithoutAll.value"
                    :series="chart.getSeries(['income', 'expense', 'summary'])"
                    chartType="bar"
                    @click="chart.onClick"
                  />
                </div>

                <!-- Sides -->
                <div class="grid items-start gap-4 md_grid-cols-2 md_gap-6">
                  <div
                    v-for="item in moneyTypes"
                    v-show="stat.isShowGroupByType(item.slug)"
                    :key="item.slug"
                    class="grid gap-3 md_max-w-lg lg_px-2 lg_py-2"
                  >
                    <StatTotalWithAverage
                      :item="stat.averages.value[item.slug]"
                      hasBg
                    />

                    <div>
                      <LazyStatChartView
                        v-if="stat.statPrepareAllData.value.summary !== 0"
                        :markedArea="chart.markedArea"
                        :categories="stat.chartCategories.value"
                        :series="chart.getSeries([item.slug])"
                        :chartType="chart.chartType"
                        :periodName="filter.periodNameWithoutAll.value"
                        :isShowDataLabels="filter.ui.value.isShowDataLabels"
                        class2="bg-item-4 rounded-lg"
                        @click="chart.onClick"
                      />

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
                    </div>

                    <div
                      v-if="statTabs.active.value !== 'empty'"
                      class="_max-w-sm"
                    >
                      <StatGroupRound
                        v-if="statTabs.active.value === 'round'"
                        :categories="stat.totalCategories.value[item.slug]"
                        :moneyTypeSlug="item.slug"
                        :moneyTypeNumber="stat.getMoneyTypeNumber(item.slug)"
                      />

                      <StatGroupHorizontal
                        v-if="statTabs.active.value === 'gLines'"
                        :categories="groupedCategories[item.slug]"
                        :moneyTypeSlug="item.slug"
                        :moneyTypeNumber="stat.getMoneyTypeNumber(item.slug)"
                      />

                      <StatGroupHorizontal
                        v-if="statTabs.active.value === 'lines'"
                        class="sticky top-[100px]"
                        :categories="stat.totalCategories.value[item.slug]"
                        :moneyTypeSlug="item.slug"
                        :moneyTypeNumber="stat.getMoneyTypeNumber(item.slug)"
                      />

                      <TrnsListWithControl
                        v-if="statTabs.active.value === 'trns'"
                        :defaultFilterTrnsPeriod="periodGrouped"
                        :initTrnType="stat.getMoneyTypeNumber(item.slug)"
                        :size="12"
                        :trnsIds="periodGrouped === 'period' ? stat.trnsIds.value : stat.getTrnsIdsWithFilterNoDates()"
                        class="px-2"
                        isShowFilter
                        uiHistory
                        @onChangePeriod="v => periodGrouped = v"
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
  <TrnForm />
</template>

<i18n lang="yaml">
en:
  lines: Lines

ru:
  lines: Lines
</i18n>
