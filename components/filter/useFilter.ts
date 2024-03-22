import dayjs from 'dayjs'
import localforage from 'localforage'
import type { CategoryId } from '~/components/categories/types'
import type { PeriodName, PeriodNameWithAll } from '~/components/stat/chart/useChartStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { WalletId } from '~/components/wallets/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

export const useFilter = defineStore('filter', () => {
  const route = useRoute()
  const trnsStore = useTrnsStore()
  const categoriesStore = useCategoriesStore()

  /**
   * Redirect
   */
  const isNeedToRedirect = computed(() => route.name !== 'dashboard' && route.name !== 'history')

  /**
   * Date
   */
  const date = ref<number>(dayjs().startOf('month').valueOf())

  function setDate(value: number) {
    date.value = dayjs(value).valueOf()
    localforage.setItem('finapp.filter.date', unref(date.value))
  }

  function setDateNow() {
    date.value = dayjs().valueOf()
    localforage.setItem('finapp.filter.date', unref(date.value))
  }

  /**
   * Period
   */
  const period = ref<PeriodNameWithAll>('month')
  const periodWithoutAll = computed<PeriodName>(() => period.value === 'all' ? 'year' : period.value)

  function setPeriodAndDate(periodName: PeriodNameWithAll) {
    if (periodName !== 'all')
      date.value = dayjs().startOf(periodName).valueOf()

    period.value = periodName
    localforage.setItem('finapp.filter.period', periodName || 'month')
    localforage.setItem('finapp.filter.date', unref(date.value))
  }

  function setDayDate(value: number) {
    period.value = 'day'
    date.value = +value
    scrollTop()
  }

  function setNextPeriodDate() {
    if (period.value === 'all')
      return

    if (trnsStore.hasTrns) {
      const trns = trnsStore.items
      const firstCreatedTrn = trns[trnsStore.firstCreatedTrnIdFromSelectedTrns]
      if (!firstCreatedTrn)
        return

      const firstCreatedTrnDate = dayjs(firstCreatedTrn.date).startOf(period.value).valueOf()
      const nextDate = dayjs(date.value).subtract(1, period.value).startOf(period.value).valueOf()
      if (nextDate >= firstCreatedTrnDate)
        date.value = nextDate
    }
  }

  function setPrevPeriodDate() {
    if (trnsStore.hasTrns) {
      if (period.value === 'all')
        return

      const nextDate = dayjs(date.value).add(1, period.value).startOf(period.value).valueOf()
      if (nextDate <= dayjs().valueOf())
        date.value = nextDate
    }
  }

  /**
   * Wallets
   */
  const walletsIds = ref<WalletId[]>([])

  function setWalletId(walletId: WalletId) {
    if (isNeedToRedirect.value)
      navigateTo('/dashboard')

    if (walletsIds.value.includes(walletId))
      return

    walletsIds.value.push(walletId)
    scrollTop()
  }

  function toggleWalletId(walletId: WalletId) {
    if (walletsIds.value.includes(walletId)) {
      removeWalletId(walletId)
      scrollTop()
      return
    }

    setWalletId(walletId)
    scrollTop()
  }

  function removeWalletId(walletId: WalletId) {
    walletsIds.value = walletsIds.value.filter(id => id !== walletId)
  }

  /**
   * Categories
   */
  const catsIds = ref<CategoryId[]>([])
  const transactibleCatsIds = computed(() => categoriesStore.getTransactibleIds(catsIds.value))

  function setCategoryId(categoryId: CategoryId) {
    if (isNeedToRedirect.value)
      navigateTo('/dashboard')

    if (catsIds.value.includes(categoryId))
      return

    catsIds.value.push(categoryId)
    scrollTop()
  }

  function removeCategoryId(categoryId: CategoryId) {
    catsIds.value = catsIds.value.filter(id => id !== categoryId)
  }

  function toggleCategoryId(categoryId: CategoryId) {
    if (catsIds.value.includes(categoryId)) {
      removeCategoryId(categoryId)
      scrollTop()
      return
    }

    setCategoryId(categoryId)
    scrollTop()
  }

  /**
   * Clear
   */
  function clearFilter() {
    catsIds.value = []
    walletsIds.value = []
  }

  /**
   * Scroll top
   */
  function scrollTop() {
    const page = document.querySelector('.js_scroll_page')
    if (page)
      page.scrollTop = 0
  }

  const isShow = computed(() => catsIds.value.length > 0 || walletsIds.value.length > 0)

  return {
    // Date
    date,
    setDate,
    setDateNow,
    setPrevPeriodDate,
    setNextPeriodDate,

    walletsIds,
    setWalletId,
    removeWalletId,
    toggleWalletId,

    catsIds,
    transactibleCatsIds,
    setCategoryId,
    removeCategoryId,
    toggleCategoryId,

    period,
    periodWithoutAll,
    setPeriodAndDate,
    setDayDate,

    clearFilter,

    // Computed
    isShow,
  }
})
