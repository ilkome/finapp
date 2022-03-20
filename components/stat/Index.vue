<script setup lang="ts">
import useStat from '~/modules/stat/useStat'
import useStatChart from '~/components/stat/useStatChart'
import useStatPage from '~/components/stat/useStatPage'
import useUIView from '~/components/layout/useUIView'
import { getTrnsIds } from '~/components/trns/functions/getTrns'

const { $store } = useNuxtApp()
const { statPage } = useStatPage()
const { ui } = useUIView()
const { moneyTypes, isEmptyStat } = useStat()

const { onWatch } = useStatChart()
onWatch()

const isShowGroup = (type) => {
  const p1 = statPage.activeTab === 'details'
                || (statPage.activeTab === 'incomes' && type === 'incomes')
                || (statPage.activeTab === 'expenses' && type === 'expenses')
  const p2 = statPage.current[type].total > 0
                  || (statPage.average && statPage.average[type] !== 0)
                  || $store.state.filter.period === 'all'
  return p1 && p2
}

const isShowTrns = computed(() => {
  const proceed = statPage.activeTab === 'details'
                      && statPage.average?.incomes !== 0
                      && statPage.average?.expenses !== 0
                      && $store.getters['trns/selectedTrnsIdsWithDate'].length > 0
  return proceed
})

const isShowGroupTrns = computed(() => {
  const p1 = statPage.activeTab === 'incomes' || statPage.activeTab === 'expenses'
  const p2 = statPage.average.total === 0
  return (p1 || p2) && statPage.activeTab !== 'history'
})
</script>

<template lang="pug">
.overflow-y-auto.h-full.pb-8.js_scroll_page
  .max-w-4xl.pb-6
    StatPeriodArrows
    StatDate
    LazyStatChart(v-if="ui.showMainChart && statPage.isHasTrns")
    .pb-3.lg_flex
      StatViewConfig.lg_order-2.lg_ml-auto
      StatPeriods.lg_order-1

    .py-6.px-3(v-if="statPage.filter.isShow")
      LazyStatFilter

    .py-3.px-3
      StatMenu

    .py-3.pb-3.px-3(v-if="statPage.activeTab === 'details'")
      StatSumTotal

    template(v-if="statPage.activeTab !== 'trns'")
      //- Loop throw incomes / expenses
      .py-0.px-3
        .grid.grid-cols-1.gap-y-5(class="md_grid-cols-2 md_gap-x-20")
          div(
            v-for="item in moneyTypes"
            v-show="isShowGroup(item.id)"
            :key="item.id"
            class="max-w-[420px]"
          )
            StatGroupSum(:typeText="item.id")
            StatGroupEmpty(:typeText="item.id")
            StatGroupCatsPie(:typeText="item.id")
            StatGroupCatsVertical(:typeText="item.id")
            StatGroupCatsRound(:typeText="item.id")
            StatGroupCatsHorizontal(:typeText="item.id")

          LazyStatGroupTrns(v-if="isShowGroupTrns && !isEmptyStat")

      .px-3
        StatEmpty
        .grid.md_grid-cols-2.md_gap-x-20
          LazyStatTrns(v-if="isShowTrns && !isEmptyStat")

    //- Trns
    template(v-if="statPage.activeTab === 'trns'")
      .px-3
        .grid.md_grid-cols-2.md_gap-x-20
          TrnsList(
            :size="50"
            classNames="md_grid-cols-1"
          )
</template>
