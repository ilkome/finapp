<script lang="ts">
import { computed, useContext } from '@nuxtjs/composition-api'
import useStat from '~/modules/stat/useStat'
import useStatChart from '~/components/stat/useStatChart'
import useStatPage from '~/components/stat/useStatPage'
import useUIView from '~/components/layout/useUIView'

export default {
  setup () {
    const { store } = useContext()
    const { statPage } = useStatPage()
    const { ui } = useUIView()
    const { moneyTypes } = useStat()

    const { onWatch } = useStatChart()
    onWatch()

    const isShowGroup = (type) => {
      const p1 = statPage.activeTab === 'details' ||
                (statPage.activeTab === 'incomes' && type === 'incomes') ||
                (statPage.activeTab === 'expenses' && type === 'expenses')
      const p2 = statPage.current[type].total > 0 ||
                  (statPage.average && statPage.average[type] !== 0) ||
                  store.state.filter.period === 'all'
      return p1 && p2
    }

    const isShowTrns = computed(() => {
      const proceed = statPage.activeTab === 'details' &&
                      statPage.average?.incomes !== 0 &&
                      statPage.average?.expenses !== 0 &&
                      store.getters['trns/selectedTrnsIdsWithDate'].length > 0
      return proceed
    })

    const isShowGroupTrns = computed(() => {
      const p1 = statPage.activeTab === 'incomes' || statPage.activeTab === 'expenses'
      const p2 = statPage.average.total === 0
      return p1 || p2
    })

    return {
      isShowGroup,
      isShowGroupTrns,
      isShowTrns,
      moneyTypes,
      statPage,
      ui
    }
  }
}
</script>

<template lang="pug">
.overflow-hidden.overflow-y-auto.scrollbar.pb-8.js_scroll_page
  StatPeriodArrows
  StatDate
  StatViewConfig
  LazyStatChart(v-if="ui.showMainChart && statPage.isHasTrns")
  StatPeriods
  .pt-3.px-3(v-if="statPage.filter.isShow")
    LazyStatFilter(v-if="statPage.filter.isShow")

  StatSumTotal
  StatMenu

  //- Loop throw incomes / expenses
  .w-100
    .py-2.px-3
      .grid.grid-cols-1.gap-y-5(class="md:grid-cols-2 md:gap-x-20")
        div(
          v-for="item in moneyTypes"
          v-if="isShowGroup(item.id)"
          :key="item.id"
        )

          StatGroupSum(:typeText="item.id")
          StatGroupEmpty(:typeText="item.id")
          StatGroupCatsPie(:typeText="item.id")
          StatGroupCatsVertical(:typeText="item.id")
          StatGroupCatsRound(:typeText="item.id")
          StatGroupCatsHorizontal(:typeText="item.id")

        LazyStatGroupTrns(v-if="isShowGroupTrns")

  StatEmpty
  LazyStatTrns(v-if="isShowTrns")
</template>
