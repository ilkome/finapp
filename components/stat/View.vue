<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import useStat from '~/components/stat/useStat'
import useStatChart from '~/components/stat/useStatChart'
import useStatPage from '~/components/stat/useStatPage'
import useUIView from '~/components/layout/useUIView'
import useWallets from '~/components/wallets/useWallets'

const { $store } = useNuxtApp()
const { walletsCurrencies } = useWallets()
const { statPage } = useStatPage()
const { ui } = useUIView()
const { moneyTypes } = useStat()
const { width } = useWindowSize()

const isMobileView = computed(() => width.value <= 1024)

const { onWatch } = useStatChart()
onWatch()

const isShowGroup = (type) => {
  const p1 = statPage.activeTab === 'details'
    || statPage.activeTab === 'balance'
    || (statPage.activeTab === 'income' && type === 'income')
    || (statPage.activeTab === 'expense' && type === 'expense')

  const p2 = $store.state.filter.period === 'all'
  return p1 || p2
}

const isShowGroupTrns = computed(() => {
  const p1 = statPage.activeTab === 'income' || statPage.activeTab === 'expense'
  const p2 = statPage.average?.sum === 0
  return (p1 || p2) && statPage.activeTab !== 'history'
})

const combinedTrnsIds = computed(() => {
  const trnsItems = $store.state.trns.items
  const trnsIds = $store.getters['trns/selectedTrnsIdsWithDate']

  return {
    all: trnsIds,
    income: trnsIds.filter(id => trnsItems[id].type === 1),
    expense: trnsIds.filter(id => trnsItems[id].type === 0),
  }
})

const chartKeyDirtyFix = ref('show')
onActivated(async () => {
  await nextTick()
  chartKeyDirtyFix.value = 'hide'
})
onDeactivated(async () => {
  await nextTick()
  chartKeyDirtyFix.value = 'show'
})
</script>

<template lang="pug">
.overflow-y-auto.h-full.pb-8.js_scroll_page
  .max-w-4xl.pb-6
    .flex.items-center.justify-between.gap-4.sticky.top-0.z-20.backdrop-blur(
      class="h-[44px] bg-white/70 dark_bg-dark3/70"
    )
      StatDate.grow

      template(v-if="isMobileView")
        .cursor-pointer.py-2.px-4.text-xs.text-skin-item-base-down.rounded-md.hocus_bg-skin-item-main-hover(
          v-if="walletsCurrencies.length > 1"
          @click="$store.commit('currencies/showBaseCurrenciesModal')"
        )
          | {{ $store.state.currencies.base }}

    template(v-if="!isMobileView")
      .pb-6.px-2(v-if="walletsCurrencies.length > 1")
        WalletsCurrenciesChanger

      .mx-2.mb-4.rounded-lg.bg-skin-item-main-bg.border.dark_border-neutral-800
        LazyStatChartWrap(
          v-if="ui.showMainChart"
          :key="chartKeyDirtyFix"
        )
        .sm_flex.justify-between.px-2.pb-2
          StatChartPeriods
          StatChartOptions

    template(v-if="isMobileView")
      .-mt-1
        StatChartOptions
      .px-2.border-t.border-b.dark_border-neutral-800
        LazyStatChartWrap(
          v-if="ui.showMainChart"
          :key="chartKeyDirtyFix"
        )

      .pt-1
        StatChartPeriods

    .my-4.mx-2.p-3.rounded-lg.bg-skin-item-main-active(
      v-if="statPage.filter.isShow"
    )
      LazyStatFilter(v-if="statPage.filter.isShow")

    template(v-if="!isMobileView")
      .px-2.flex.flex-wrap.items-center.justify-between.gap-x-6
        StatSumTotal
        StatViewConfig

    StatMenu

    div(
      class="min-h-[calc(100vh-130px)]"
      data-scroll-ref="stat"
    )
      template(v-if="statPage.activeTab !== 'trns' && statPage.activeTab !== 'history'")
        template(v-if="isMobileView")
          .my-6.px-2(v-if="statPage.activeTab === 'details'")
            StatViewConfig
            StatSumTotal(v-if="(statPage.average.income !== 0 && statPage.average.expense !== 0) || (statPage.current.income.total !== 0 && statPage.current.expense.total !== 0)")

        //- Loop throw income / expense
        .mb-8.md_mb-4.px-2
          .grid.grid-cols-1.gap-y-5.md_grid-cols-2.md_gap-x-20
            div(
              v-for="item in moneyTypes"
              v-show="isShowGroup(item.id)"
              :key="item.id"
              class="max-w-[420px]"
            )
              StatSumGroup(:typeText="item.id")

              template(v-if="statPage.activeTab !== 'balance'")
                StatGroupPie(:typeText="item.id")
                StatGroupVertical(:typeText="item.id")
                StatGroupRound(:typeText="item.id")
                StatGroupHorizontal(:typeText="item.id")

              template(v-if="statPage.activeTab === 'balance'")
                StatGroupBudget(:typeText="item.id")

              template(v-if="!isMobileView")
                div(
                  v-if="statPage.activeTab === 'details' && statPage.current[item.id].total !== 0 && combinedTrnsIds[item.id].length > 0"
                )
                  .my-6(class="max-w-[420px]")
                    .pb-2.text-lg.leading-none.font-nunito.font-semibold.text-skin-item-base
                      | {{ $t('trns.inPeriodTitle') }}

                    TrnsList(
                      :size="12"
                      :trnsIds="combinedTrnsIds[item.id]"
                      isShowFilter
                      uiHistory
                    )

          //- All
          template(v-if="!isMobileView")
            div(
              v-if="isShowGroupTrns && !isEmptyStat && statPage.activeTab !== 'details' && combinedTrnsIds[statPage.activeTab].length > 0"
            )
              .my-6(class="max-w-[420px]")
                .pb-2.text-lg.leading-none.font-nunito.font-semibold.text-skin-item-base
                  | {{ $t('trns.inPeriodTitle') }}

                TrnsList(
                  :size="12"
                  :trnsIds="combinedTrnsIds[statPage.activeTab]"
                  classNames="md_grid-cols-1"
                  isShowFilter
                  uiHistory
                )

      //- Trns
      template(v-if="statPage.activeTab === 'trns'")
        .my-4.px-2
          TrnsListWithControl(
            :trnsIds="statPage.current.trnsIds"
            isFilterByDay
            defaultFilterTrnsPeriod="period"
          )
</template>
