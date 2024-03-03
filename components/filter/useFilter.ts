import dayjs from 'dayjs'
import localforage from 'localforage'
import { storeToRefs } from 'pinia'
import { useAppNav } from '~/components/app/useAppNav'
import type { CategoryId } from '~/components/categories/types'
import type { PeriodName, PeriodNameWithAll } from '~/components/chart/useChart'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { WalletId } from '~/components/wallets/types'

export const useFilter = defineStore('filter', () => {
  const route = useRoute()
  const trnsStore = useTrnsStore()
  const { activeTabStat } = storeToRefs(useAppNav())

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
  }

  function setDateNow() {
    date.value = dayjs().valueOf()
  }

  /**
   * Period
   */
  const period = ref<PeriodNameWithAll>('month')
  const periodWithoutAll = computed<PeriodName>(() => period.value === 'all' ? 'year' : period.value)

  function setPeriod(periodName: PeriodNameWithAll) {
    if (!periodName)
      return

    if (periodName !== 'all')
      date.value = dayjs().startOf(periodName).valueOf()

    period.value = periodName
    localforage.setItem('finapp.filter.period', periodName || 'month')
  }

  function setPeriodNext() {
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

  function setPeriodPrev() {
    if (trnsStore.hasTrns) {
      if (period.value === 'all')
        return

      const nextDate = dayjs(date.value).add(1, period.value).startOf(period.value).valueOf()
      if (nextDate < dayjs().valueOf())
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
    setDateNow()
    activeTabStat.value = 'summary'
    scrollTop()
  }

  function removeWalletId(walletId: WalletId) {
    walletsIds.value = walletsIds.value.filter(id => id !== walletId)
  }

  /**
   * Categories
   */
  const catsIds = ref<CategoryId[]>([])

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

  /**
   * Others
   */
  function setDayDate(value: number) {
    period.value = 'day'
    date.value = +value
    scrollTop()
  }

  /**
   * Clear
   */
  function clearFilter() {
    catsIds.value = []
    walletsIds.value = []
  }

  function setFilterCatStat(catId: CategoryId) {
    setCategoryId(catId)
    setDateNow()
    activeTabStat.value = 'summary'
  }

  function setFilterWalletStat(walletId: WalletId) {
    setWalletId(walletId)
    setDateNow()
    activeTabStat.value = 'summary'
  }

  /**
   * Scroll top
   */
  function scrollTop() {
    const page = document.querySelector('.js_scroll_page')
    if (page)
      page.scrollTop = 0
  }

  /**
   * Computed
   */
  const values = computed<{
    date: number
    walletsIds: WalletId[]
    catsIds: CategoryId[]
    period: PeriodNameWithAll
  }>(() => ({
    date: date.value,
    walletsIds: walletsIds.value,
    catsIds: catsIds.value,
    period: period.value,
  }))

  return {
    // Date
    date,
    setDate,
    setDateNow,
    setPeriodPrev,
    setPeriodNext,

    walletsIds,
    setWalletId,
    removeWalletId,
    toggleWalletId,

    catsIds,
    setCategoryId,
    removeCategoryId,

    period,
    periodWithoutAll,
    setPeriod,

    setDayDate,

    setFilterCatStat,
    setFilterWalletStat,

    clearFilter,

    // Computed
    values,
  }
})
