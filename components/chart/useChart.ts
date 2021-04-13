import { ref, useContext } from '@nuxtjs/composition-api'

const isShowDataLabels = ref(false)

export default function useMobileLayout () {
  const { store } = useContext()

  function showDataLabels() {
    isShowDataLabels.value = true
  }
  function hideDataLabels() {
    isShowDataLabels.value = false
  }

  function toogleChartsView () {
    store.commit('chart/toogleChartPeriodView', {
      periodName: store.state.filter.period
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
