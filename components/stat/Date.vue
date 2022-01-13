<script>
import { ref, computed, useNuxtApp } from '#app'
import useFilter from '~/modules/filter/useFilter'
import usePeriods from '~/components/periods/usePeriods'

export default {
  setup () {
    const { $store } = useNuxtApp()
    const { periodsNames } = usePeriods()
    const { filterPeriodNameAllReplacedToYear } = useFilter()
    const filterPeriod = computed(() => $store.state.filter.period)

    const visiblePeriodMenu = ref(false)

    const onSelectPeriod = (period) => {
      $store.dispatch('filter/setPeriod', period)
    }

    const periodCounts = {
      items: [1, 3, 6, 7, 12, 14, 16, 24, 30, 36, 48, 60],
      onSelect: (value) => {
        $store.commit('chart/setElementsToChart', {
          period: filterPeriod.value,
          value
        })
      }
    }

    return {
      periodsNames,
      filterPeriodNameAllReplacedToYear,
      filterPeriod,
      visiblePeriodMenu,
      onSelectPeriod,
      periodCounts
    }
  }
}
</script>

<template lang="pug">
.z-10.bg-white(class="dark:bg-dark3")
  //- Date
  .menuDots.flex.items-center.p-4.cursor-pointer(
    @click="visiblePeriodMenu = true"
  )
    SharedDate
    .menuDots__dots: .mdi.mdi-dots-vertical

  //- Modal
  Portal(to="modal")
    LazyBaseBottomSheet(
      v-if="visiblePeriodMenu"
      @closed="visiblePeriodMenu = false"
    )
      template(#handler="{ close }")
        .handler
        BaseBottomSheetClose(@onClick="close")

      template(#default="{ close }")
        .title {{ $t('dates.period') }}

        .content
          //- Periods
          .modalLinks
            ModalButton(
              v-for="periodItem in periodsNames"
              :key="periodItem.slug"
              :icon="periodItem.icon"
              :isActive="filterPeriod === periodItem.slug"
              :name="$t(`dates.${periodItem.slug}.simple`)"
              @onClick="onSelectPeriod(periodItem.slug)"
            )

            ModalButton(
              :isActive="filterPeriod === 'all'"
              :name="$t('dates.all.simple')"
              icon="mdi mdi-database"
              @onClick="onSelectPeriod('all')"
            )

          //- Counts
          .title {{ $t('dates.count') }}
          .counts.flex.items-center.justify-center
            .countsItem(
              v-for="periodCount in periodCounts.items"
              :key="periodCount"
              :class="{ _active: periodCount === $store.state.chart.periods[filterPeriodNameAllReplacedToYear].showedPeriods }"
              @click="periodCounts.onSelect(periodCount)"
            ) {{ periodCount }}

          .flex.py-3.px-3
            .button(
              @click="close()"
            ) {{ $t('close') }}
</template>

<style lang="stylus" scoped>
.counts
  flex-flow row wrap
  gap $m7
  padding $m6 $m9

  &Item
    cursor pointer
    display flex
    align-items center
    justify-content center
    width 48px
    height 48px
    padding $m8 $m7
    font-secondary()
    font-size 18px
    text-align center
    background #1c1c1c
    border 1px solid transparent
    border-radius 50%

    +media-hover()
      &:not(._active)
        color var(--c-text-1)
        background var(--c-item-bg-hover)
        border-color var(--c-item-bd-hover)

    &._active
      background var(--c-item-bg-active)
      border-color var(--c-item-bd-main)

.handler
  z-index 2
  position absolute
  top 0
  left 0
  display flex
  align-items center
  justify-content center
  width 100%
  height 16px

  &:after
    content ''
    display block
    width 32px
    height 4px
    background var(--c-bg-8)
    border-radius 4px

.content
  +media(600px)
    border-radius 0 0 $m7 $m7

.menuDots
  color var(--c-font-3)
  font-size 22px
  font-weight 500
  border-radius $m8
  anim()

  +media(600px)
    font-size 26px
    font-weight 600
    fontFamilyNunito()
    background none

  +media-hover()
    color var(--c-blue-1)

  &__dots
    margin-top -2px
    margin-right -5px
    padding-top 3px
    padding-left 4px
    color var(--c-font-2)
    font-size 16px

    +media(600px)
      padding-left 6px
      font-size 22px

.button
  button-base-1()

.title
  padding $m9
  padding-bottom $m6
  color var(--c-font-2)
  fontFamilyNunito()
  font-size 28px
  font-weight 700
  text-align center
  background var(--c-bg-3)
  border-radius $m7 $m7 0 0
</style>
