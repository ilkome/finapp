import dayjs from 'dayjs'
import localforage from 'localforage'
import type { CategoryId } from '~/components/categories/types'
import type { PeriodNameWithAll, PeriodNameWithoutAll } from '~/components/stat/chart/useChartStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { WalletId } from '~/components/wallets/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useChartStore } from '~/components/stat/chart/useChartStore'

export const useFilterStore = defineStore('filter', () => {
  const trnsStore = useTrnsStore()
  const categoriesStore = useCategoriesStore()
  const chartStore = useChartStore()

  /**
   * Date
   */
  const date = ref<number>(dayjs().startOf('month').valueOf())

  function setDate(value: number) {
    const newDate = dayjs(value).valueOf()
    date.value = newDate
    localforage.setItem('finapp.filter.date', unref(date.value))
    chartStore.setDate(newDate)
  }

  function setDateNow() {
    date.value = dayjs().valueOf()
    localforage.setItem('finapp.filter.date', unref(date.value))
  }

  /**
   * Period
   */
  const periodNameWithAll = ref<PeriodNameWithAll>('month')
  const periodNameWithoutAll = computed<PeriodNameWithoutAll>(() => periodNameWithAll.value === 'all' ? 'year' : periodNameWithAll.value)

  function setPeriodAndDate(periodName: PeriodNameWithAll) {
    if (periodName !== 'all') {
      if (periodNameWithAll.value === periodName) {
        date.value = dayjs().startOf(periodName).valueOf()
      }
      else {
        const savedDate = chartStore.periods[periodName].date
        savedDate
          ? date.value = savedDate
          : date.value = dayjs().startOf(periodName).valueOf()
      }
    }

    periodNameWithAll.value = periodName
    localforage.setItem('finapp.filter.period', periodName || 'month')
    localforage.setItem('finapp.filter.date', unref(date.value))
  }

  function setDayDate(value: number) {
    periodNameWithAll.value = 'day'
    date.value = +value
    scrollTop()
  }

  function setNextPeriodDate() {
    if (periodNameWithAll.value === 'all')
      return

    if (trnsStore.hasTrns) {
      const trns = trnsStore.items
      const firstCreatedTrn = trns[trnsStore.firstCreatedTrnIdFromSelectedTrns]
      if (!firstCreatedTrn)
        return

      const firstCreatedTrnDate = dayjs(firstCreatedTrn.date).startOf(periodNameWithAll.value).valueOf()
      const nextDate = dayjs(date.value).subtract(1, periodNameWithAll.value).startOf(periodNameWithAll.value).valueOf()
      if (nextDate > firstCreatedTrnDate) {
        date.value = nextDate
        localforage.setItem('finapp.filter.date', nextDate)
      }
    }
  }

  function setPrevPeriodDate() {
    if (trnsStore.hasTrns) {
      if (periodNameWithAll.value === 'all')
        return

      const nextDate = dayjs(date.value).add(1, periodNameWithAll.value).startOf(periodNameWithAll.value).valueOf()
      if (nextDate <= dayjs().valueOf()) {
        date.value = nextDate
        localforage.setItem('finapp.filter.date', nextDate)
      }
    }
  }

  /**
   * Wallets
   */
  const walletsIds = ref<WalletId[]>([])

  function setWalletId(walletId: WalletId) {
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

    periodNameWithAll,
    periodNameWithoutAll,
    setPeriodAndDate,
    setDayDate,

    clearFilter,

    // Computed
    isShow,
  }
})
