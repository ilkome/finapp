<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useWindowSize } from '@vueuse/core'
import useStatChart from '~/components/stat/useStatChart'
import useStatPage from '~/components/stat/useStatPage'
import useUIView from '~/components/layout/useUIView'
import useWallets from '~/components/wallets/useWallets'
import { getStyles } from '~/components/ui/classes'
import { useAppNav } from '~/components/app/useAppNav'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilter } from '~/components/filter/useFilter'
import { useStat } from '~/components/stat/useStat'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const { walletsCurrencies } = useWallets()
const filterStore = useFilter()
const { statPage } = useStatPage()
const { ui } = useUIView()
const { moneyTypes } = useStat()
const { width } = useWindowSize()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()
const { activeTabStat } = storeToRefs(useAppNav())
const currenciesStore = useCurrenciesStore()

const isMobileView = computed(() => width.value <= 1024)

const { onWatch } = useStatChart()
onWatch()

function isShowGroup(type) {
  const p1 = activeTabStat.value === 'summary'
    || (activeTabStat.value === 'income' && type === 'income')
    || (activeTabStat.value === 'expense' && type === 'expense')

  const p2 = filterStore.period === 'all'
  return p1 || p2
}

const isShowGroupTrns = computed(() => {
  const p1 = activeTabStat.value === 'income' || activeTabStat.value === 'expense'
  const p2 = statPage.average?.sum === 0
  return p1 || p2
})

const combinedTrnsIds = computed(() => {
  const trnsItems = trnsStore.items
  const trnsIds = trnsStore.selectedTrnsIdsWithDate

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
.lg_max-w-4xl.pb-6
  .flex.px-2.items-center.justify-between.gap-4.sticky.top-0.z-20.backdrop-blur(
    class="h-[44px] bg-foreground-4"
  )
    .flex.items-center
      div(
        :class="getStyles('item', ['link', 'rounded'])"
        @click="filterStore.setPeriodNext"
      )
        UiIconChevron.size-8

      div(
        @click="filterStore.setPeriodPrev"
        :class="getStyles('item', ['link', 'rounded'])"
      )
        UiIconChevron.size-8.rotate-180

    StatDate.grow

    template(v-if="isMobileView")
      .cursor-pointer.py-2.px-4.text-xs.text-item-2.rounded-md.hocus_bg-item-5(
        v-if="walletsCurrencies.length > 1"
        @click="currenciesStore.showBaseCurrenciesModal()"
      )
        | {{ currenciesStore.base }}

  template(v-if="!isMobileView")
    .pb-6.px-2(v-if="walletsCurrencies.length > 1")
      WalletsCurrenciesChanger

    .mx-2.mb-4.rounded-lg.bg-item-4
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

  .py-3.px-3(v-if="statPage.filter.isShow")
    LazyStatFilter(v-if="statPage.filter.isShow")

  .px-2.flex.flex-wrap.items-center.justify-between.gap-6.gap-x-6
    .flex.flex-wrap.items-center.gap-5
      StatSumTotal(class="!m-0")
      StatSumGroup(class="!m-0" typeText="expense")
      StatSumGroup(class="!m-0" typeText="income")
    StatViewConfig

  StatMenu

  div(
    class="min-h-[calc(100vh-130px)]"
    data-scroll-ref="stat"
  )
    template(v-if="activeTabStat !== 'trns' && activeTabStat !== 'history'")
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

            template(v-if="activeTabStat !== 'balance'")
              StatGroupVertical(:typeText="item.id")
              StatGroupRound(:typeText="item.id")
              StatGroupHorizontal(:typeText="item.id")

            template(v-if="!isMobileView")
              div(
                v-if="activeTabStat === 'summary' && statPage.current[item.id].total !== 0 && combinedTrnsIds[item.id].length > 0"
              )
                .my-6(class="max-w-[420px]")
                  .pb-2.text-lg.leading-none.font-primary.font-semibold.text-item-base
                    | {{ $t('trns.inPeriodTitle') }}

                  TrnsList(
                    :size="12"
                    :trnsIds="combinedTrnsIds[item.id]"
                    isShowFilter
                    uiHistory
                  )

          //- All
          template
            div(
              v-if="isShowGroupTrns && !isEmptyStat && activeTabStat !== 'summary' && combinedTrnsIds[activeTabStat].length > 0"
            )
              .my-6(class="max-w-[420px]")
                .pb-2.text-lg.leading-none.font-primary.font-semibold.text-item-base
                  | {{ $t('trns.inPeriodTitle') }}

                TrnsList(
                  :size="12"
                  :trnsIds="combinedTrnsIds[activeTabStat]"
                  classes="md_grid-cols-1"
                  isShowFilter
                  uiHistory
                )

    //- Trns
    template(v-if="activeTabStat === 'trns'")
      .my-4.px-2
        TrnsListWithControl(
          :trnsIds="statPage.current.trnsIds"
          isFilterByDay
          defaultFilterTrnsPeriod="period"
        )
</template>
