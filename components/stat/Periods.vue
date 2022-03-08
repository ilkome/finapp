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
.pt-2.px-3.lg_pt-1
  .flex.justify-between
    .overflow-hidden.flex.items-center.rounded-md.text-xs.bg-gray-50.dark_bg-dark4.dark_shadow
      .cursor-pointer.px-3.md_px-4.py-3.grow.hocus_bg-gray-200.dark_hocus_bg-neutral-800(
        v-for="periodItem in periodsNames"
        :key="periodItem.slug"
        :class="{ '_active cursor-default text-blue3 dark_text-blue1 bg-gray-100 dark_bg-232323': periodItem.slug === filterPeriodNameAllReplacedToYear }"
        @click="$store.dispatch('filter/setPeriod', periodItem.slug)"
      ) {{ periodItem.name }}

    .overflow-hidden.ml-2.flex.items-center.rounded-md.bg-gray-50.dark_bg-dark4.dark_shadow
      .cursor-pointer.px-3.md_px-4.py-3.flex-center.hocus_bg-gray-200.dark_hocus_bg-neutral-800.w-8(
        @click="removePeriodOrGroup"
      ): .mdi.mdi-minus

      .flex.items-center.text-sm {{ $store.state.chart.periods[filterPeriodNameAllReplacedToYear].showedPeriods }}

      .cursor-pointer.px-3.md_px-4.py-3.flex-center.hocus_bg-gray-200.dark_hocus_bg-neutral-800.w-8(
        @click="addPeriodOrGroup"
      ): .mdi.mdi-plus
</template>
