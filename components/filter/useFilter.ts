import type { CategoryID } from '~/components/categories/types'
import type { WalletID } from '~/components/wallets/types'

export default function useFilter() {
  const { $store } = useNuxtApp()
  const route = useRoute()
  const router = useRouter()
  const filterPeriodNameAllReplacedToYear = computed(() =>
    $store.state.filter.period === 'all'
      ? 'year'
      : $store.state.filter.period)

  const isNeedToRedirect = computed(() => route.name !== 'index' && route.name !== 'history')

  function scrollTop() {
    const page = document.querySelector('.js_scroll_page')
    if (page)
      page.scrollTop = 0
  }

  function setFilterCatsId(categoryId) {
    if (isNeedToRedirect.value)
      router.push('/')

    $store.commit('filter/setFilterCatsId', categoryId)
    scrollTop()
  }

  function setFilterWalletsId(walletId: WalletID) {
    if (isNeedToRedirect.value)
      router.push('/')

    $store.commit('filter/setFilterWalletsId', walletId)
    scrollTop()
  }

  function toggleWalletFilter(walletId: WalletID) {
    if ($store.state.filter.walletsIds.includes(walletId)) {
      $store.commit('filter/removeFilterWalletId', walletId)
      scrollTop()
      return
    }

    setFilterWalletsId(walletId)
    $store.commit('filter/setFilterDateNow')
    $store.dispatch('ui/setActiveTabStat', 'details')
    scrollTop()
  }

  function setDayDate(date) {
    $store.dispatch('filter/setPeriod', 'day')
    $store.dispatch('filter/setDate', parseInt(date))
    scrollTop()
  }

  /**
   * Removes
   *
   */
  function removeFilterCategoryId(id: CategoryID) {
    $store.commit('filter/removeFilterCategoryId', id)
  }

  /**
   * Clear
   */
  function clearFilter() {
    $store.commit('filter/clearFilterCatsIds')
    $store.commit('filter/clearFilterWalletsIds')
  }

  return {
    clearFilter,
    filterPeriodNameAllReplacedToYear,
    removeFilterCategoryId,
    scrollTop,
    setDayDate,
    setFilterCatsId,
    setFilterWalletsId,
    toggleWalletFilter,
  }
}
