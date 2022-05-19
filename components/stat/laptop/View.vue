<script setup lang="ts">
import useStat from '~/modules/stat/useStat'
import useStatChart from '~/components/stat/useStatChart'
import useStatPage from '~/components/stat/useStatPage'
import useUIView from '~/components/layout/useUIView'
import useWallets from '~/components/wallets/useWallets'
const { walletsCurrencies } = useWallets()

const { $store } = useNuxtApp()
const { statPage } = useStatPage()
const { ui } = useUIView()
const { moneyTypes, isEmptyStat } = useStat()

const { onWatch } = useStatChart()
onWatch()

const isShowGroup = (type) => {
  const p1 = statPage.activeTab === 'details'
    || statPage.activeTab === 'balance'
    || (statPage.activeTab === 'income' && type === 'income')
    || (statPage.activeTab === 'expense' && type === 'expense')

  const p2 = statPage.current[type].total > 0
    || (statPage.average && statPage.average[type] !== 0)
    || $store.state.filter.period === 'all'

  return p1 && p2
}

const isShowTrns = computed(() => {
  return statPage.activeTab === 'details'
    && statPage.average?.income !== 0
    && statPage.average?.expense !== 0
    && $store.getters['trns/selectedTrnsIdsWithDate'].length > 0
})

const isShowGroupTrns = computed(() => {
  const p1 = statPage.activeTab === 'income' || statPage.activeTab === 'expense'
  const p2 = statPage.average?.sum === 0
  return (p1 || p2) && statPage.activeTab !== 'history'
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
    .px-2.flex.items-center.justify-between.gap-4.sticky.top-0.z-20.backdrop-blur(
      class="bg-white/70 dark_bg-dark3/70"
    )
      StatDate.grow
      .cursor-pointer.py-2.px-4.text-xs.text-skin-item-base-down.rounded-md.hocus_bg-skin-item-main-hover(
        v-if="walletsCurrencies.length > 1"
        @click="$store.commit('currencies/showBaseCurrenciesModal')"
      )
        | {{ $store.state.currencies.base }}

    .pb-6.px-3(v-if="walletsCurrencies.length > 1")
      WalletsCurrenciesChanger

    .mx-2.mb-4.rounded-lg.bg-skin-item-main-bg.border.dark_border-neutral-800
      LazyStatChartWrap(
        :key="chartKeyDirtyFix"
        v-if="ui.showMainChart && statPage.isHasTrns"
      )
      .sm_flex.justify-between.px-2.pb-2
        StatChartPeriods
        StatChartOptions

    .my-4.mx-2.p-3.rounded-lg.bg-skin-item-main-active(v-if="statPage.filter.isShow")
      LazyStatFilter(v-if="statPage.filter.isShow")

    .px-2.flex.flex-wrap.items-center.justify-between.gap-x-6
      StatSumTotal
      StatViewConfig

    .pb-4.px-2
      StatLaptopMenu

    template(v-if="statPage.activeTab !== 'trns' && statPage.activeTab !== 'history'")
      //- Loop throw income / expense
      .mb-8.md_mb-4.px-2
        .grid.grid-cols-1.gap-y-5(class="md_grid-cols-2 md_gap-x-20")
          div(
            v-for="item in moneyTypes"
            v-show="isShowGroup(item.id)"
            :key="item.id"
            class="max-w-[420px]"
          )
            StatSumGroup(
              :typeText="item.id"
            )

            template(v-if="statPage.activeTab !== 'balance'")
              StatGroupEmpty(:typeText="item.id")
              StatGroupPie(:typeText="item.id")
              StatGroupVertical(:typeText="item.id")
              StatGroupRound(:typeText="item.id")
              StatGroupHorizontal(:typeText="item.id")

            template(v-if="statPage.activeTab === 'balance'")
              StatGroupBudget(:typeText="item.id")

          LazyStatGroupTrns(
            v-if="isShowGroupTrns && !isEmptyStat"
            :isShowExpense="statPage.activeTab === 'expense'"
            :isShowIncome="statPage.activeTab === 'income'"
          )

      .px-2
        StatEmpty
        .grid.md_grid-cols-2.md_gap-x-20
          LazyStatTrns(v-if="isShowTrns && !isEmptyStat")

    //- Trns
    template(v-if="statPage.activeTab === 'trns'")
      .my-4.px-2
        .pb-2.text-lg.leading-none.font-nunito.font-semibold.text-skin-item-base
          | {{ $t('trns.inPeriodTitle') }}

        .grid.md_grid-cols-2.md_gap-x-20
          TrnsList(
            :size="50"
            classNames="md_grid-cols-1"
          )

    //- History
    template(v-if="statPage.activeTab === 'history'")
      .my-4.px-2
        StatHistory
</template>

<style lang="stylus">
.firefoxBackdropFix
  @supports (not (-webkit-backdrop-filter: none)) and (not (backdrop-filter: none))
    background theme('colors.dark3') !important
    /.light &
      background theme('colors.white') !important
</style>
