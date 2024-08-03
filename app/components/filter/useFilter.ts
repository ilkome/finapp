import dayjs from 'dayjs'
import localforage from 'localforage'
import { deepUnref } from 'vue-deepunref'
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

type PeriodSchema = {
  date: number
  showedPeriods: number
  type: 'line' | 'bar'
}

export type Periods = {
  day: PeriodSchema
  month: PeriodSchema
  week: PeriodSchema
  year: PeriodSchema
}

// export type PeriodNameWithoutAll = keyof Periods | dayjs.OpUnitType
export type PeriodNameWithoutAll = keyof Periods | dayjs.ManipulateType
export type PeriodNameWithAll = PeriodNameWithoutAll | 'all'

export type PeriodsNames = {
  icon: string
  name: string
  slug: PeriodNameWithoutAll
}[]

export function useFilter() {
  const { $i18n } = useNuxtApp()
  const router = useRouter()
  const route = useRoute()
  const trnsStore = useTrnsStore()
  const categoriesStore = useCategoriesStore()
  const walletsStore = useWalletsStore()

  /**
   * Date
   */
  const date = ref<number>(dayjs().startOf('month').valueOf())
  const periodNameWithAll = ref<PeriodNameWithAll>('month')

  const periodNameWithoutAll = computed(() =>
    periodNameWithAll.value === 'all' ? 'year' : periodNameWithAll.value,
  )

  function setDate(value: number) {
    const newDate = dayjs(value).valueOf()
    date.value = newDate
    periods.value[periodNameWithoutAll.value].date = newDate
  }

  function setDateNow() {
    date.value = dayjs().valueOf()
  }

  /**
   * Period
   */
  const periods = ref<Periods>({
    day: {
      date: dayjs().valueOf(),
      showedPeriods: 14,
      type: 'line',
    },
    month: {
      date: dayjs().valueOf(),
      showedPeriods: 12,
      type: 'line',
    },
    week: {
      date: dayjs().valueOf(),
      showedPeriods: 12,
      type: 'line',
    },
    year: {
      date: dayjs().valueOf(),
      showedPeriods: 6,
      type: 'line',
    },
  })

  // TODO: Move from here
  const periodsNames = computed<PeriodsNames>(() => [
    {
      icon: 'mdi:calendar',
      name: $i18n.t('dates.month.simple'),
      slug: 'month',
    },
    {
      icon: 'mdi:calendar-star',
      name: $i18n.t('dates.year.simple'),
      slug: 'year',
    },
  ])

  const ui = ref({
    expense: true,
    income: true,
    isShowDataLabels: false,
    setUi: (key, value) => (ui.value[key] = value),
    sum: false,
    toggleUi: key => (ui.value[key] = !ui.value[key]),
  })

  // TODO: Move from here
  function setPeriodAndDate(periodName: PeriodNameWithAll) {
    if (periodName !== 'all') {
      if (periodNameWithAll.value === periodName) {
        const newDate = dayjs().startOf(periodName).valueOf()
        date.value = newDate
        periods.value[periodName].date = newDate
      }
      else {
        const savedDate = periods.value[periodName].date
        const newDate = savedDate
          ? dayjs(savedDate).startOf(periodName).valueOf()
          : dayjs().startOf(periodName).valueOf()

        date.value = newDate
        periods.value[periodName].date = newDate
      }
    }

    periodNameWithAll.value = periodName
  }

  function setDayDate(value: number) {
    periodNameWithAll.value = 'day'
    date.value = +value
  }

  function setNextPeriodDate(firstCreatedTrnDate: number) {
    if (periodNameWithAll.value === 'all')
      return

    const newDate = dayjs(date.value)
      .subtract(1, periodNameWithAll.value)
      .startOf(periodNameWithAll.value)
      .valueOf()
    if (
      newDate
      >= dayjs(firstCreatedTrnDate).startOf(periodNameWithAll.value).valueOf()
    ) {
      date.value = newDate
      periods.value[periodNameWithoutAll.value].date = newDate
    }
  }

  function setPrevPeriodDate() {
    if (trnsStore.hasTrns) {
      if (periodNameWithAll.value === 'all')
        return

      const newDate = dayjs(date.value)
        .add(1, periodNameWithAll.value)
        .startOf(periodNameWithAll.value)
        .valueOf()
      if (newDate <= dayjs().valueOf()) {
        date.value = newDate
        periods.value[periodNameWithoutAll.value].date = newDate
      }
    }
  }

  /**
   * Wallets
   */
  const walletsIds = computed<CategoryId[]>(() => Array.isArray(route.query.filterWallets)
    ? (route.query.filterWallets as CategoryId[]).filter(id => walletsStore.items[id])
    : route.query.filterWallets
      ? [route.query.filterWallets]
      : [],
  )

  function setWalletId(walletId: WalletId) {
    if (walletsIds.value.includes(walletId))
      return

    router.push({
      query: {
        ...route.query,
        filterWallets: [...walletsIds.value, walletId],
      },
    })
  }

  function toggleWalletId(walletId: WalletId) {
    if (walletsIds.value.includes(walletId)) {
      removeWalletId(walletId)
      return
    }

    setWalletId(walletId)
  }

  function removeWalletId(walletId: WalletId) {
    router.push({
      query: {
        ...route.query,
        filterWallets: [...walletsIds.value.filter(id => id !== walletId)],
      },
    })
  }

  /**
   * Categories
   */

  const catsIds = computed<CategoryId[]>(() => Array.isArray(route.query.filterCategories)
    ? (route.query.filterCategories as CategoryId[]).filter(id => categoriesStore.items[id])
    : route.query.filterCategories
      ? [route.query.filterCategories]
      : [],
  )

  const transactibleCatsIds = computed(() =>
    categoriesStore.getTransactibleIds(catsIds.value),
  )

  function setCategoryId(categoryId: CategoryId) {
    if (catsIds.value.includes(categoryId))
      return

    router.push({
      query: {
        ...route.query,
        filterCategories: [...catsIds.value, categoryId],
      },
    })
  }

  function removeCategoryId(categoryId: CategoryId) {
    router.push({
      query: {
        ...route.query,
        filterCategories: [...catsIds.value.filter(id => id !== categoryId)],
      },
    })
  }

  function toggleCategoryId(categoryId: CategoryId) {
    if (catsIds.value.includes(categoryId)) {
      removeCategoryId(categoryId)
      return
    }

    setCategoryId(categoryId)
  }

  /**
   * Clear
   */
  function clearFilter() {
    // catsIds.value = []
    // walletsIds.value = []
    router.push({ query: undefined })
  }

  const isShow = computed(
    () => catsIds.value.length > 0 || walletsIds.value.length > 0,
  )

  function addPeriod() {
    periods.value[periodNameWithoutAll.value].showedPeriods
      = periods.value[periodNameWithoutAll.value].showedPeriods + 1
  }

  function removePeriod() {
    periods.value[periodNameWithoutAll.value].showedPeriods
      = periods.value[periodNameWithoutAll.value].showedPeriods - 1
  }

  function setPeriod(number: PeriodSchema['showedPeriods']) {
    periods.value[periodNameWithoutAll.value].showedPeriods = number
  }

  function toggleChartType() {
    periods.value[periodNameWithoutAll.value].type
      = periods.value[periodNameWithoutAll.value].type === 'line'
        ? 'bar'
        : 'line'
  }

  watch(date, value => localforage.setItem('finapp.chart.date', value))
  watch(periods, value => localforage.setItem('finapp.chart.periods', deepUnref(value)), { deep: true })
  watch(periodNameWithAll, value => localforage.setItem('finapp.chart.periodName', value))

  function getTrnsIdsWithFilter() {
    return trnsStore.getStoreTrnsIds({
      categoriesIds: catsIds.value,
      walletsIds: walletsIds.value,
    })
  }

  return {
    addPeriod,
    catsIds,
    clearFilter,
    // Date
    date,
    getTrnsIdsWithFilter,

    // Computed
    isShow,
    periodNameWithAll,
    periodNameWithoutAll,
    periods,
    periodsNames,

    removeCategoryId,

    removePeriod,
    removeWalletId,
    setCategoryId,
    setDate,

    setDateNow,
    setDayDate,
    setNextPeriodDate,
    setPeriod,
    setPeriodAndDate,

    setPrevPeriodDate,

    setWalletId,
    toggleCategoryId,

    toggleChartType,
    toggleWalletId,
    transactibleCatsIds,
    ui,
    walletsIds,
  }
}

export type FilterProvider = ReturnType<typeof useFilter>
