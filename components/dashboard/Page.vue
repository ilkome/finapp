<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useWindowSize } from '@vueuse/core'
import type { PeriodNameWithAll } from '../chart/useChart'
import type { MoneyTypeSlug } from '~/components/stat/types'
import useStatChart from '~/components/stat/useStatChart'
import useStatPage from '~/components/stat/useStatPage'
import useUIView from '~/components/layout/useUIView'
import { useAppNav } from '~/components/app/useAppNav'
import { useFilter } from '~/components/filter/useFilter'
import { useStat } from '~/components/stat/useStat'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { TrnId } from '~/components/trns/types'

const filterStore = useFilter()
const { statPage } = useStatPage()
const { ui } = useUIView()
const { moneyTypes } = useStat()
const { width } = useWindowSize()
const trnsStore = useTrnsStore()
const { activeTabStat } = storeToRefs(useAppNav())

const isMobileView = computed(() => width.value <= 1024)

const { onWatch } = useStatChart()
onWatch()

function isShowGroupByType(type: MoneyTypeSlug) {
  const p1
    = activeTabStat.value === 'summary'
    || (activeTabStat.value === 'income' && type === 'income')
    || (activeTabStat.value === 'expense' && type === 'expense')

  const p2 = filterStore.period === 'all'
  return p1 || p2
}

const isShowGroupTrns = computed(() => {
  const p1
    = activeTabStat.value === 'income' || activeTabStat.value === 'expense'
  const p2 = statPage.average?.sum === 0
  return p1 || p2
})

const combinedTrnsIds = computed(() => {
  const trnsItems = trnsStore.items
  const trnsIds = trnsStore.selectedTrnsIdsWithDate

  return {
    all: trnsIds,
    income: trnsIds.filter((id: TrnId) => trnsItems[id].type === 1),
    expense: trnsIds.filter((id: TrnId) => trnsItems[id].type === 0),
  }
})

// Date Selector
const { isShowDateSelector, openDateSelector, closeDateSelector }
  = useDateSelector()

function useDateSelector() {
  const isShowDateSelector = ref(false)

  function openDateSelector() {
    isShowDateSelector.value = true
  }
  function closeDateSelector() {
    isShowDateSelector.value = false
  }

  return {
    isShowDateSelector,
    openDateSelector,
    closeDateSelector,
  }
}

provide('date', computed(() => filterStore.date))
provide('isShowDateSelector', isShowDateSelector)
provide('setDate', filterStore.setDate)
provide('closeDateSelector', closeDateSelector)
provide('openDateSelector', openDateSelector)

provide('period', computed(() => filterStore.period))
provide('periodWithoutAll', computed(() => filterStore.periodWithoutAll))
provide('setNextPeriodDate', filterStore.setNextPeriodDate)
provide('setPeriodAndDate', filterStore.setPeriodAndDate)
provide('setPrevPeriodDate', filterStore.setPrevPeriodDate)
</script>

<template>
  <div class="pb-6 pt-3 lg_max-w-4xl">
    <div class="sticky top-0 z-20 h-[44px] bg-foreground-4 backdrop-blur">
      <StatDate />
    </div>

    <LazyStatChartWrap
      v-if="ui.showMainChart"
      :trnsIds="Object.keys(trnsStore.items ?? {})"
    />

    <LazyStatFilter v-if="statPage.filter.isShow" />

    <StatMenu />

    <div class="min-h-[calc(100vh-130px)]" data-scroll-ref="stat">
      <template v-if="activeTabStat !== 'trns'">
        <StatSumAll v-if="activeTabStat === 'summary'" />

        <div class="mb-8 px-2 md_mb-4">
          <div class="grid items-start gap-6 md_grid-cols-2 md_gap-8">
            <div
              v-for="item in moneyTypes"
              v-show="isShowGroupByType(item.id)"
              :key="item.id"
              class="grid gap-3 rounded-lg bg-item-4 lg_p-2 xl_max-w-[420px]"
            >
              <StatSumGroup :typeText="item.id" />
              <StatGroupVertical :typeText="item.id" />
              <StatGroupRound :typeText="item.id" />
              <StatGroupHorizontal :typeText="item.id" />

              <template v-if="!isMobileView">
                <div
                  v-if="
                    activeTabStat === 'summary'
                      && statPage.current[item.id].total !== 0
                      && combinedTrnsIds[item.id].length > 0
                  "
                  class="max-w-[420px] pt-4"
                >
                  <div
                    class="text-item-base pb-2 font-primary text-lg font-semibold leading-none"
                  >
                    {{ $t("trns.inPeriodTitle") }}
                  </div>
                  <TrnsList
                    :size="12"
                    :trnsIds="combinedTrnsIds[item.id]"
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
                  && activeTabStat !== 'summary'
                  && combinedTrnsIds[activeTabStat].length > 0
              "
              class="max-w-[420px]"
            >
              <UiTitle2>{{ $t("trns.inPeriodTitle") }}</UiTitle2>
              <TrnsList
                :size="12"
                :trnsIds="combinedTrnsIds[activeTabStat]"
                classes="md_grid-cols-1"
                isShowFilter
                uiHistory
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Trns -->
      <template v-if="activeTabStat === 'trns'">
        <div class="my-4 px-2">
          <TrnsListWithControl
            :trnsIds="statPage.current.trnsIds"
            isFilterByDay
            defaultFilterTrnsPeriod="period"
          />
        </div>
      </template>

      <StatViewConfig />
    </div>
  </div>
</template>
