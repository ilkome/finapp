import useFilter from '~/components/filter/useFilter'

const isShowDataLabels = ref(false)

export default function useChart() {
  const { $store } = useNuxtApp()
  const { filterPeriodNameAllReplacedToYear } = useFilter()

  function showDataLabels() {
    isShowDataLabels.value = true
  }
  function hideDataLabels() {
    isShowDataLabels.value = false
  }

  function toggleChartsView() {
    $store.commit('chart/toggleChartPeriodView', {
      periodName: filterPeriodNameAllReplacedToYear.value,
    })
    $store.dispatch('ui/saveUiView')
  }

  return {
    isShowDataLabels,

    toggleChartsView,
    showDataLabels,
    hideDataLabels,
  }
}
