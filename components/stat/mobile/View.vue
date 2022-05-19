<script setup lang="ts">
import SwiperCore from 'swiper'
import 'swiper/swiper-bundle.css'
import useStat from '~/modules/stat/useStat'
import useStatChart from '~/components/stat/useStatChart'
import useStatPage from '~/components/stat/useStatPage'
import useUIView from '~/components/layout/useUIView'
import useWallets from '~/components/wallets/useWallets'

const { walletsCurrencies } = useWallets()

const { $store } = useNuxtApp()
const { statPage } = useStatPage()
const { ui } = useUIView()
const { isEmptyStat } = useStat()

const sliderRef = ref(null)
const sliderObject = ref(null)
const chartKeyDirtyFix = ref(null)

onMounted(() => {
  sliderObject.value = new SwiperCore(sliderRef.value, {
    observer: true,
    slidesPerView: 1,
    touchStartPreventDefault: false,
    autoHeight: false,
    initialSlide: 1,
    shortSwipes: false,
    longSwipesRatio: 0.1,
    longSwipesMs: 60,
  })
  sliderObject.value.on('slideChangeTransitionEnd', (slider) => {
    if (slider.activeIndex === 0)
      chartKeyDirtyFix.value = `hide${sliderObject.value.activeIndex}`
  })
})

const { onWatch } = useStatChart()
onWatch()

onActivated(async () => {
  await nextTick()
  chartKeyDirtyFix.value = `hide${sliderObject.value.activeIndex}`
})
onDeactivated(async () => {
  await nextTick()
  chartKeyDirtyFix.value = `show${sliderObject.value.activeIndex}`
})
</script>

<template lang="pug">
.overflow-y-auto.h-full.js_scroll_page
  .fixed.top-0.left-0.w-full.z-20.backdrop-blur(
    class="bg-white/70 dark_bg-dark3/70"
  )
    .px-0.flex.items-center.justify-between.gap-4
      StatDate.grow(
        wrapClasses="px-0"
        dateClasses="text-base"
      )
      .cursor-pointer.py-2.px-4.text-xs.text-skin-item-base-down.rounded-md.hocus_bg-skin-item-main-hover(
        v-if="walletsCurrencies.length > 1"
        @click="$store.commit('currencies/showBaseCurrenciesModal')"
      )
        | {{ $store.state.currencies.base }}

    StatMobileMenu(:slider="sliderObject")

  .swiper-container.overflow-hidden.h-full(ref="sliderRef")
    .swiper-wrapper
      //- Summary
      StatMobileSlide
        .my-4.px-2
          StatSumGroup(typeText="income")
          StatSumGroup(typeText="expense")
          StatSumTotal

        .my-6.mx-2.rounded-lg.bg-skin-item-main-bg.border.dark_border-neutral-800
          LazyStatChartWrap(
            :key="chartKeyDirtyFix"
            v-if="ui.showMainChart && statPage.isHasTrns"
          )
          .sm_flex.justify-between.px-2.pb-2
            StatChartPeriods
            StatChartOptions

      //- Expense
      StatMobileSlide
        .px-2
          StatGroupItem(typeText="expense")
          LazyStatGroupTrns(isShowExpense)

      //- Income
      StatMobileSlide
        .px-2
          StatGroupItem(typeText="income")
          LazyStatGroupTrns(isShowIncome)

      //- Transactions
      StatMobileSlide
        .px-2
          LazyStatTrns(v-if="!isEmptyStat")

      //- History
      StatMobileSlide
        .px-2
          StatHistory
</template>

<style lang="stylus">
.firefoxBackdropFix
  @supports (not (-webkit-backdrop-filter: none)) and (not (backdrop-filter: none))
    background theme('colors.dark3') !important
    /.light &
      background theme('colors.white') !important
</style>
