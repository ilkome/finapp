export default function useStatPage() {
  const { $store } = useNuxtApp()

  const activeTabStat = computed(() => $store.state.ui.activeTabStat)
  const statCurrentPeriod = computed(() => $store.getters['stat/statCurrentPeriod'])
  const statAverage = computed(() => $store.getters['stat/statAverage'])
  const filterPeriod = computed(() => $store.state.filter.period)
  const filter = computed(() => $store.state.filter)
  const filterDate = computed(() => $store.state.filter.date)
  const isShowFilter = computed(() => $store.state.filter.catsIds.length > 0 || $store.state.filter.walletsIds.length > 0)
  const isHasTrns = computed(() => $store.getters['trns/hasTrns'])

  return {
    statPage: reactive({
      activeTab: activeTabStat,
      average: statAverage,
      current: statCurrentPeriod,

      filter: {
        ...filter.value,
        isShow: isShowFilter,
        period: filterPeriod,
        date: filterDate,
      },

      isHasTrns,
    }),
  }
}
