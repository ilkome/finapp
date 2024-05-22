import dayjs from 'dayjs'
import localforage from 'localforage'
import { deepUnref } from 'vue-deepunref'
import { z } from 'zod'
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'
import { getTrnsIds } from '~/components/trns/getTrns'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const periodSchema = z.object({
  date: z.number(),
  showedPeriods: z.number(),
  type: z.enum(['line', 'bar']),
})

const periodsSchema = z.object({
  day: periodSchema,
  month: periodSchema,
  week: periodSchema,
  year: periodSchema,
})

export type Periods = z.infer<typeof periodsSchema>
export type PeriodSchema = z.infer<typeof periodSchema>
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
  const trnsStore = useTrnsStore()
  const categoriesStore = useCategoriesStore()

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
      icon: 'mdi mdi-weather-sunset-up',
      name: $i18n.t('dates.day.simple'),
      slug: 'day',
    },
    {
      icon: 'mdi mdi-calendar-week',
      name: $i18n.t('dates.week.simple'),
      slug: 'week',
    },
    {
      icon: 'mdi mdi-calendar',
      name: $i18n.t('dates.month.simple'),
      slug: 'month',
    },
    {
      icon: 'mdi mdi-calendar-star',
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
    scrollTop()
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
  const transactibleCatsIds = computed(() =>
    categoriesStore.getTransactibleIds(catsIds.value),
  )

  function setCategoryId(categoryId: CategoryId) {
    if (catsIds.value.includes(categoryId))
      return

    catsIds.value.push(categoryId)
    useRouter().push(`?categories[]=${encodeURIComponent(catsIds.value)}`)
    scrollTop()
  }

  function removeCategoryId(categoryId: CategoryId) {
    catsIds.value = catsIds.value.filter(id => id !== categoryId)
    scrollTop()
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

  async function initChart() {
    const localDate = await localforage.getItem('finapp.chart.date')
    const localPeriodName = await localforage.getItem('finapp.chart.periodName')
    const localPeriods: Periods | null = await localforage.getItem('finapp.chart.periods')

    if (periodsSchema.safeParse(localPeriods)) {
      for (const periodName in periods.value)
        periods.value[periodName] = localPeriods[periodName]
    }

    localDate && setDate(localDate)
    if (localPeriodName)
      periodNameWithAll.value = localPeriodName
  }

  watch(date, value => localforage.setItem('finapp.chart.date', value))
  watch(periods, value => localforage.setItem('finapp.chart.periods', deepUnref(value)), { deep: true })
  watch(periodNameWithAll, value => localforage.setItem('finapp.chart.periodName', value))

  function getTrnsIdsWithFilter() {
    return getTrnsIds({
      categoriesIds: catsIds.value,
      trnsItems: trnsStore.items,
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

    initChart,
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
