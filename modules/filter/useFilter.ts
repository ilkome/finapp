import { computed, useContext, useRoute, useRouter } from '@nuxtjs/composition-api'

export default function useFilter () {
  const { store } = useContext()
  const route = useRoute()
  const router = useRouter()
  const filterPeriodNameAllReplacedToYear = computed(() => store.state.filter.period === 'all' ? 'year' : store.state.filter.period)
  const isNeedToRedirect = computed(() => route.value.name !== 'index' && route.value.name !== 'history')

  function scrollTop () {
    const page = document.querySelector('.pageWrapScroll')
    if (page) page.scrollTop = 0
  }

  function setCategoryFilter (id) {
    if (isNeedToRedirect.value)
      router.push('/')

    store.dispatch('filter/handleSetFilterCategory', id)
    scrollTop()
  }

  function setWalletFilter (id) {
    if (isNeedToRedirect.value)
      router.push('/')

    store.dispatch('filter/setFilterWalletId', id)
    scrollTop()
  }

  return {
    scrollTop,
    setCategoryFilter,
    setWalletFilter,
    filterPeriodNameAllReplacedToYear
  }
}
