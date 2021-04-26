import { ref, useContext } from '@nuxtjs/composition-api'
import useFilter from '~/modules/filter/useFilter'

const isShowDataLabels = ref(false)

export default function useMobileLayout () {
  const { store } = useContext()
  const { filterPeriodNameAllReplacedToYear } = useFilter()

  function showDataLabels () {
    isShowDataLabels.value = true
  }
  function hideDataLabels () {
    isShowDataLabels.value = false
  }

  function toogleChartsView () {
    store.commit('chart/toogleChartPeriodView', {
      periodName: filterPeriodNameAllReplacedToYear.value
    })
    store.dispatch('ui/saveUiView')
  }

  return {
    isShowDataLabels,

    toogleChartsView,
    showDataLabels,
    hideDataLabels
  }
}
