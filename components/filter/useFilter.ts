export default function useFilter() {
  const { $store } = useNuxtApp()
  const route = useRoute()
  const router = useRouter()
  const filterPeriodNameAllReplacedToYear = computed(() => $store.state.filter.period === 'all' ? 'year' : $store.state.filter.period)
  const isNeedToRedirect = computed(() => route.name !== 'index' && route.name !== 'history')

  function scrollTop() {
    const page = document.querySelector('.js_scroll_page')
    if (page)
      page.scrollTop = 0
  }

  function setFilterCatsId(catId) {
    if (isNeedToRedirect.value)
      router.push('/')

    $store.commit('filter/setFilterCatsId', catId)
    scrollTop()
  }

  function setFilterWalletsId(walletId) {
    if (isNeedToRedirect.value)
      router.push('/')

    $store.commit('filter/setFilterWalletsId', walletId)
    scrollTop()
  }

  function setDayDate(date) {
    $store.dispatch('filter/setPeriod', 'day')
    $store.dispatch('filter/setDate', parseInt(date))
    scrollTop()
  }

  return {
    scrollTop,
    setFilterCatsId,
    setFilterWalletsId,
    filterPeriodNameAllReplacedToYear,
    setDayDate,
  }
}
