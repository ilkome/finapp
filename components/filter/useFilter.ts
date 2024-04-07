import dayjs from 'dayjs'
import localforage from 'localforage'
import { z } from 'zod'
import type { CategoryId } from '~/components/categories/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { WalletId } from '~/components/wallets/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

const periodSchema = z.object({
  type: z.enum(['line', 'bar']),
  showedPeriods: z.number(),
  // date: z.number(),
})

const periodsSchema = z.object({
  day: periodSchema,
  week: periodSchema,
  month: periodSchema,
  year: periodSchema,
})

type Periods = z.infer<typeof periodsSchema>
export type PeriodSchema = z.infer<typeof periodSchema>
export type PeriodNameWithoutAll = keyof Periods
export type PeriodNameWithAll = PeriodNameWithoutAll | 'all'

export function useFilter() {
  const { $i18n } = useNuxtApp()
  const trnsStore = useTrnsStore()
  const categoriesStore = useCategoriesStore()

  /**
   * Date
   */
  const date = ref<number>(dayjs().startOf('month').valueOf())

  function setDate(value: number) {
    const newDate = dayjs(value).valueOf()
    date.value = newDate
    localforage.setItem('finapp.filter.date', unref(date.value))
    periods.value[nameWithoutAll.value].date = date
  }

  function setDateNow() {
    date.value = dayjs().valueOf()
    localforage.setItem('finapp.filter.date', unref(date.value))
  }

  /**
   * Period
   */
  const periods = ref<Periods>({
    day: {
      showedPeriods: 14,
      type: 'line',
      date: dayjs().valueOf(),
    },
    week: {
      showedPeriods: 12,
      type: 'line',
      date: dayjs().valueOf(),
    },
    month: {
      showedPeriods: 12,
      type: 'line',
      date: dayjs().valueOf(),
    },
    year: {
      showedPeriods: 6,
      type: 'line',
      date: dayjs().valueOf(),
    },
  })

  const periodsNames = computed<{
    slug: PeriodNameWithoutAll
    icon: string
    name: string
  }[]>(() => [{
    slug: 'day',
    icon: 'mdi mdi-weather-sunset-up',
    name: $i18n.t('dates.day.simple'),
  }, {
    slug: 'week',
    icon: 'mdi mdi-calendar-week',
    name: $i18n.t('dates.week.simple'),
  }, {
    slug: 'month',
    icon: 'mdi mdi-calendar',
    name: $i18n.t('dates.month.simple'),
  }, {
    slug: 'year',
    icon: 'mdi mdi-calendar-star',
    name: $i18n.t('dates.year.simple'),
  }])

  const ui = ref({
    income: true,
    expense: true,
    sum: false,
    isShowDataLabels: false,
    setUi: (key, value) => ui.value[key] = value,
    toggleUi: key => ui.value[key] = !ui.value[key],
  })

  const periodNameWithAll = ref<PeriodNameWithAll>('month')

  const periodNameWithoutAll = computed<PeriodNameWithoutAll>(() =>
    periodNameWithAll.value === 'all' ? 'year' : periodNameWithAll.value,
  )

  const nameWithAll = ref<PeriodNameWithAll>('month')
  const nameWithoutAll = computed<PeriodNameWithoutAll>(() =>
    periodNameWithAll.value === 'all' ? 'year' : periodNameWithAll.value,
  )

  function setPeriodAndDate(periodName: PeriodNameWithAll) {
    if (periodName !== 'all') {
      if (periodNameWithAll.value === periodName) {
        date.value = dayjs().startOf(periodName).valueOf()
      }
      else {
        const savedDate = periods.value[periodName].date
        savedDate
          ? (date.value = dayjs(savedDate).startOf(periodName).valueOf())
          : (date.value = dayjs().startOf(periodName).valueOf())
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

  function setNextPeriodDate(firstCreatedTrnDate: number) {
    if (periodNameWithAll.value === 'all')
      return

    const nextDate = dayjs(date.value)
      .subtract(1, periodNameWithAll.value)
      .startOf(periodNameWithAll.value)
      .valueOf()
    if (
      nextDate
      >= dayjs(firstCreatedTrnDate).startOf(periodNameWithAll.value).valueOf()
    ) {
      date.value = nextDate
      localforage.setItem('finapp.filter.date', nextDate)
    }
  }

  function setPrevPeriodDate() {
    if (trnsStore.hasTrns) {
      if (periodNameWithAll.value === 'all')
        return

      const nextDate = dayjs(date.value)
        .add(1, periodNameWithAll.value)
        .startOf(periodNameWithAll.value)
        .valueOf()
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
    periods.value[nameWithoutAll.value].showedPeriods = periods.value[nameWithoutAll.value].showedPeriods + 1
  }

  function removePeriod() {
    periods.value[nameWithoutAll.value].showedPeriods = periods.value[nameWithoutAll.value].showedPeriods - 1
  }

  function setPeriod(number: PeriodSchema['showedPeriods']) {
    periods.value[nameWithoutAll.value].showedPeriods = number
  }

  // function setDate(date: number) {
  //   periods.value[nameWithoutAll.value].date = date
  // }

  function toggleChartType() {
    periods.value[nameWithoutAll.value].type = periods.value[nameWithoutAll.value].type === 'line'
      ? 'bar'
      : 'line'
  }

  async function initChart() {
    const localPeriods: Periods | null = await localforage.getItem('finapp.chart.periods')

    if (periodsSchema.safeParse(localPeriods).success === false)
      return false

    for (const periodName in localPeriods) {
      const showedPeriods = +localPeriods[periodName].showedPeriods
        ? localPeriods[periodName].showedPeriods
        : periods.value[periodName].showedPeriods

      const periodValues: Periods = {
        ...localPeriods[periodName],
        showedPeriods,
      }

      setPeriodValues(periodName, periodValues)
    }
  }

  function setPeriodValues(periodName, values) {
    periods.value[periodName] = {
      ...periods.value[periodName],
      ...values,
    }
  }

  return {
    // Date
    date,
    setDate,
    setDateNow,
    setPrevPeriodDate,
    setNextPeriodDate,

    periods,
    periodsNames,
    nameWithAll,
    nameWithoutAll,
    periodNameWithAll,
    periodNameWithoutAll,
    setPeriodAndDate,
    setDayDate,

    ui,

    walletsIds,
    setWalletId,
    removeWalletId,
    toggleWalletId,

    catsIds,
    transactibleCatsIds,
    setCategoryId,
    removeCategoryId,
    toggleCategoryId,

    clearFilter,

    // Computed
    isShow,

    initChart,
    setPeriodValues,
    addPeriod,
    removePeriod,
    setPeriod,
    toggleChartType,
  }
}

export type FilterProvider = ReturnType<typeof useFilter>
