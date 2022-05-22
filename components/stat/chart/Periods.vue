<script>
import useFilter from '~/modules/filter/useFilter'
import usePeriods from '~/components/periods/usePeriods'

export default {
  setup() {
    const { $store } = useNuxtApp()

    // Filter
    const { filterPeriodNameAllReplacedToYear } = useFilter()

    function saveChartsPeriodsToLocalStorage() {
      $store.dispatch('ui/saveUiView')
    }

    function addPeriodOrGroup() {
      $store.commit('chart/addElementsToChart', {
        periodName: filterPeriodNameAllReplacedToYear.value,
        periodType: 'showedPeriods',
      })
      saveChartsPeriodsToLocalStorage()
    }

    function removePeriodOrGroup() {
      if ($store.state.chart.periods[filterPeriodNameAllReplacedToYear.value].showedPeriods <= 2)
        return

      $store.commit('chart/removeElementsFromChart', {
        periodName: filterPeriodNameAllReplacedToYear.value,
        periodType: 'showedPeriods',
      })
      saveChartsPeriodsToLocalStorage()
    }

    // Periods
    const { periodsNames } = usePeriods()

    return {
      addPeriodOrGroup,
      removePeriodOrGroup,
      filterPeriodNameAllReplacedToYear,
      periodsNames,
    }
  },
}
</script>

<template lang="pug">
.flex-center
  .overflow-hidden.flex.items-center.text-xs
    .cursor-pointer.w-10.py-2.px-3.flex-center.rounded-md.hocus_bg-skin-item-main-hover(
      @click="removePeriodOrGroup"
    ): .mdi.mdi-minus

    .cursor-pointer.py-2.px-3.rounded-md.hocus_bg-skin-item-main-hover(
      v-for="periodItem in periodsNames"
      :key="periodItem.slug"
      :class="{ 'cursor-default text-skin-item-base-up': periodItem.slug === filterPeriodNameAllReplacedToYear }"
      @click="$store.dispatch('filter/setPeriod', periodItem.slug)"
    )
      span.pr-1(v-if="periodItem.slug === filterPeriodNameAllReplacedToYear")
        | {{ $store.state.chart.periods[filterPeriodNameAllReplacedToYear].showedPeriods }}
      | {{ periodItem.name }}

    .cursor-pointer.w-10.py-2.px-3.flex-center.rounded-md.hocus_bg-skin-item-main-hover(
      @click="addPeriodOrGroup"
    ): .mdi.mdi-plus
</template>
