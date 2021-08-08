import { computed, useContext, useRoute, useRouter } from '@nuxtjs/composition-api'

export default function useFilter () {
  const { store } = useContext()
  const route = useRoute()
  const router = useRouter()
  const filterPeriodNameAllReplacedToYear = computed(() => store.state.filter.period === 'all' ? 'year' : store.state.filter.period)

  function scrollTop () {
    const page = document.querySelector('.pageWrapScroll')
    if (page) page.scrollTop = 0
  }

  function setCategoryFilter (id) {
    if (route.value.name !== 'index')
      router.push('/')

    store.dispatch('filter/handleSetFilterCategory', id)
    scrollTop()
  }

  function setWalletFilter (id) {
    if (route.value.name !== 'index')
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
