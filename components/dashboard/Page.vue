<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useWindowSize } from '@vueuse/core'
import type { MoneyTypeSlugSum } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import useUIView from '~/components/layout/useUIView'
import { useAppNav } from '~/components/app/useAppNav'
import { useFilter } from '~/components/filter/useFilter'
import { useStat } from '~/components/stat/useStat'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const filterStore = useFilter()
const { ui } = useUIView()
const { statCurrentPeriod, statAverage, moneyTypes } = useStat()
const { width } = useWindowSize()
const trnsStore = useTrnsStore()
const { activeTabStat } = storeToRefs(useAppNav())

const isMobileView = computed(() => width.value <= 1024)

function isShowGroupByType(type: MoneyTypeSlugSum) {
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
  const p2 = statAverage.value?.sum === 0
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
      <StatDate />
    </div>

    <!-- Sum All -->
    <div class="mx-2 mb-2 rounded-xl bg-item-4">
      <div
        class="flex flex-wrap items-center gap-3 gap-x-6 rounded-lg bg-item-4 p-2 sm_justify-start sm_bg-transparent sm_p-3 sm_pt-4"
      >
        <StatTotalWithAverage moneyTypeSlugSum="expense" />
        <StatTotalWithAverage moneyTypeSlugSum="income" />
        <StatTotalWithAverage moneyTypeSlugSum="sum" />
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
      <template v-if="activeTabStat !== 'trns'">
        <div class="mb-8 px-2 md_mb-4 lg_px-0">
          <div class="grid items-start gap-6 md_grid-cols-2 md_gap-8">
            <div
              v-for="item in moneyTypes"
              v-show="isShowGroupByType(item.id)"
              :key="item.id"
              class="grid gap-3 rounded-lg py-2 lg_px-2 xl_max-w-[420px]"
            >
              <StatTotalWithAverage :moneyTypeSlugSum="item.id" hasBg />
              <StatGroupVertical :moneyTypeSlug="item.id" />
              <StatGroupRound :moneyTypeSlug="item.id" />
              <StatGroupHorizontal :moneyTypeSlug="item.id" />

              <template v-if="!isMobileView">
                <div
                  v-if="
                    activeTabStat === 'summary'
                      && statCurrentPeriod[item.id].total !== 0
                      && combinedTrnsIds[item.id].length > 0
                  "
                  class="grid max-w-[420px] gap-2 pt-4"
                >
                  <UiTitle>{{ $t("trns.inPeriodTitle") }}</UiTitle>
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
              <UiTitle2 class="pb-3">
                {{ $t("trns.inPeriodTitle") }}
              </UiTitle2>
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
      <template v-else>
        <div class="mb-4 px-2">
          <TrnsListWithControl
            :trnsIds="statCurrentPeriod.trnsIds"
            isFilterByDay
            defaultFilterTrnsPeriod="period"
          />
        </div>
      </template>
    </div>
  </div>
</template>
