<script>
import Swiper from 'swiper'
import 'swiper/swiper-bundle.css'
import { ref, computed, watch, onMounted, useContext } from '@nuxtjs/composition-api'

export default {
  name: 'LayoutMobileDatesSlider',

  setup () {
    const { store, $day } = useContext()

    // Periods dates
    const periodDates = computed(() => {
      const { period } = store.state.filter
      const showedPeriodsCount = store.state.chart.periods[period].showedPeriods

      const dates = []
      for (let step = 0; step < showedPeriodsCount; step++) {
        const periodDate = $day().startOf(period).subtract(step, period).valueOf()
        dates.unshift(periodDate)
      }
      return dates
    })

    // Slider
    const periodDatesSliderValue = ref(null)
    const periodDatesSliderRef = ref(null)

    const filterPeriod = computed(() => { return store.state.filter.period })

    const initSlder = () => {
      if (periodDatesSliderRef.value) {
        periodDatesSliderValue.value = new Swiper(periodDatesSliderRef.value, {
          slidesPerView: 'auto',
          initialSlide: periodDates.value.length,
          autoHeight: true,
          centeredSlides: true,
          shortSwipes: false,
          longSwipesRatio: 0.1,
          longSwipesMs: 60,
          on: {
            slideChange: (swiper) => {
              const activeIndex = swiper.activeIndex
              const periodDate = periodDates.value[activeIndex]
              store.dispatch('filter/setDate', periodDate)
            }
          }
        })
      }
    }

    onMounted(initSlder)

    const onClickDatePeriodSliderItem = (slideIdx) => {
      periodDatesSliderValue.value.slideTo(slideIdx)
    }

    return {
      filterPeriod,
      periodDatesSliderValue,
      periodDatesSliderRef,
      onClickDatePeriodSliderItem,
      periodDates
    }
  }
}
</script>

<template lang="pug">
.swiper-container(
  v-if="filterPeriod !== 'all'"
  ref="periodDatesSliderRef"
)
  .swiper-wrapper
    .swiper-slide._widthAuto(
      v-for="(periodDate, slideIdx) in periodDates"
      :key="periodDate"
      @click="onClickDatePeriodSliderItem(slideIdx)"
    )
      .dateItem(
        :class="{ _active: periodDatesSliderValue && periodDatesSliderValue.activeIndex === slideIdx }"
        @click="periodDatesSliderValue && periodDatesSliderValue.activeIndex === slideIdx ? isShowPeriodsNames = true : false"
      )
        .menuDots
          .menuDots__name
            DateFormated(
              :date="periodDate"
              :periodName="$store.state.filter.period"
            )
        .menuDots__dots(v-if="periodDatesSliderValue && periodDatesSliderValue.activeIndex === slideIdx"): .mdi.mdi-dots-vertical
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

._widthAuto
  display flex
  width auto

.dateItem
  cursor pointer
  opacity .3
  display flex
  align-items center
  justify-content center
  height 28px
  padding $m5 $m7
  color var(--c-font-4)
  font-size 14px
  anim()

  &._active
    opacity 1
    padding-right $m6
    color var(--c-font-3)
    font-size 16px
    font-weight bold

.menuDots
  flex-grow 1
  cursor pointer
  display flex
  align-items center
  justify-content center

  &__dots
    padding-top 3px
    padding-left 4px
    color var(--c-font-2)
    font-size 16px
</style>
