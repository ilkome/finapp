export default function useStatPage() {
  const { $store } = useNuxtApp()

  const activeTabStat = computed(() => $store.state.ui.activeTabStat)
  const statCurrentPeriod = computed(() => $store.getters['stat/statCurrentPeriod'])
  const statAverage = computed(() => $store.getters['stat/statAverage'])
  const filterPeriod = computed(() => $store.state.filter.period)
  const filter = computed(() => $store.state.filter)
  const filterDate = computed(() => $store.state.filter.date)
  const isShowFilter = computed(() => !!$store.state.filter.categoryId || !!$store.state.filter.walletId)
  // const periods = computed(() => $store.state.chart.periods)
  const isHasTrns = computed(() => $store.getters['trns/hasTrns'])

  return {
    statPage: reactive({
      activeTab: activeTabStat,
      average: statAverage,
      current: statCurrentPeriod,

      filter: {
        ...filter,
        isShow: isShowFilter,
        period: filterPeriod,
        date: filterDate,
      },

      isHasTrns,
    }),
  }
}
