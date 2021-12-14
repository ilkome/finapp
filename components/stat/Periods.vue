<script>
import { useContext } from '@nuxtjs/composition-api'
import useFilter from '~/modules/filter/useFilter'
import usePeriods from '~/components/periods/usePeriods'

export default {
  setup () {
    const { store } = useContext()

    // Filter
    const { filterPeriodNameAllReplacedToYear } = useFilter()

    function saveChartsPeriodsToLocalStorage () {
      store.dispatch('ui/saveUiView')
    }

    function addPeriodOrGroup () {
      store.commit('chart/addElementsToChart', {
        periodName: filterPeriodNameAllReplacedToYear.value,
        periodType: 'showedPeriods'
      })
      saveChartsPeriodsToLocalStorage()
    }

    function removePeriodOrGroup () {
      if (store.state.chart.periods[filterPeriodNameAllReplacedToYear.value].showedPeriods <= 2)
        return

      store.commit('chart/removeElementsFromChart', {
        periodName: filterPeriodNameAllReplacedToYear.value,
        periodType: 'showedPeriods'
      })
      saveChartsPeriodsToLocalStorage()
    }

    // Periods
    const { periodsNames } = usePeriods()

    return {
      addPeriodOrGroup,
      removePeriodOrGroup,
      filterPeriodNameAllReplacedToYear,
      periodsNames
    }
  }
}
</script>

<template lang="pug">
.py-2.px-3
  .flex.justify-between
    .overflow-hidden.inline-flex.items-center.bg-4.rounded
      .barItem.px-4.py-2.font5.text-xs(
        v-for="periodItem in periodsNames"
        :key="periodItem.slug"
        :class="{ _active: periodItem.slug === filterPeriodNameAllReplacedToYear }"
        @click="$store.dispatch('filter/setPeriod', periodItem.slug)"
      ) {{ periodItem.name }}

      //- .barItem.px-4.py-2.font5.text-xs(
      //-   @click="$store.dispatch('filter/setPeriod', { custom: true, name: 'days', num: 7 })"
      //- ) 7days

    .bar.overflow-hidden.flex.rounded-md
      .bar__btn.flex-grow.flex.items-center.justify-center.w-8(
        @click="removePeriodOrGroup"
      ): .mdi.mdi-minus
      .flex.items-center.text-sm.font5 {{ $store.state.chart.periods[filterPeriodNameAllReplacedToYear].showedPeriods }}
      .bar__btn.flex.items-center.justify-center.w-8(
        @click="addPeriodOrGroup"
      ): .mdi.mdi-plus
</template>

<style lang="stylus" scoped>
.bar
  color var(--c-font-3)
  background var(--c-bg-4)

  &__btn
    background var(--c-bg-4)
    +media-hover()
      &:not(._active)
        cursor pointer
        background var(--c-bg-6)
    .mdi
      font-size 16px
</style>
