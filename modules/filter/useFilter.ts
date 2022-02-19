export default function useFilter() {
  const { $store } = useNuxtApp()
  const route = useRoute()
  const router = useRouter()
  const filterPeriodNameAllReplacedToYear = computed(() => $store.state.filter.period === 'all' ? 'year' : $store.state.filter.period)
  const isNeedToRedirect = computed(() => route.name !== 'index' && route.name !== 'history')

  function scrollTop() {
    const page = document.querySelector('.js_scroll_page')
    if (page) page.scrollTop = 0
  }

  function setCategoryFilter(id) {
    if (isNeedToRedirect.value)
      router.push('/')

    $store.dispatch('filter/handleSetFilterCategory', id)
    scrollTop()
  }

  function setWalletFilter(id) {
    if (isNeedToRedirect.value)
      router.push('/')

    $store.dispatch('filter/setFilterWalletId', id)
    scrollTop()
  }

  return {
    scrollTop,
    setCategoryFilter,
    setWalletFilter,
    filterPeriodNameAllReplacedToYear,
  }
}
