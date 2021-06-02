import { computed, useContext } from '@nuxtjs/composition-api'

export default function useFilter () {
  const { store } = useContext()
  const filterPeriodNameAllReplacedToYear = computed(() => store.state.filter.period === 'all' ? 'year' : store.state.filter.period)

  function scrollTop () {
    const page = document.querySelector('.pageWrapScroll')
    if (page) page.scrollTop = 0
  }

  function setCategoryFilter (id) {
    store.dispatch('filter/handleSetFilterCategory', id)
    scrollTop()
  }

  function setWalletFilter (id) {
    store.dispatch('filter/setFilterWalletId', id)
    scrollTop()
  }

  return {
    setCategoryFilter,
    setWalletFilter,
    filterPeriodNameAllReplacedToYear
  }
}
