import localforage from 'localforage'
import { deepUnref } from 'vue-deepunref'
import { z } from 'zod'
import { useFilter } from '~/components/filter/useFilter'
import type { MoneyTypeSlugSum } from '~/components/stat/types'

const periodSchema = z.object({
  type: z.enum(['line', 'bar']),
  showedPeriods: z.number(),
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

export const useChartStore = defineStore('chart', () => {
  const { $i18n } = useNuxtApp()

  const isShowDataLabels = ref(false)

  const periods = ref<Periods>({
    day: {
      showedPeriods: 14,
      type: 'line',
    },
    week: {
      showedPeriods: 12,
      type: 'line',
    },
    month: {
      showedPeriods: 12,
      type: 'line',
    },
    year: {
      showedPeriods: 6,
      type: 'line',
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

  const filterStore = useFilter()

  function showDataLabels() {
    isShowDataLabels.value = true
  }
  function hideDataLabels() {
    isShowDataLabels.value = false
  }

  function addElementsToChart() {
    periods.value[filterStore.periodNameWithoutAll].showedPeriods = periods.value[filterStore.periodNameWithoutAll].showedPeriods + 1
  }

  function removeElementsFromChart() {
    periods.value[filterStore.periodNameWithoutAll].showedPeriods = periods.value[filterStore.periodNameWithoutAll].showedPeriods - 1
  }

  function setElementsToChart(number: PeriodSchema['showedPeriods']) {
    periods.value[filterStore.periodNameWithoutAll].showedPeriods = number
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

  watch(periods, (newPeriods) => {
    localforage.setItem('finapp.chart.periods', deepUnref(newPeriods))
  }, { immediate: true, deep: true })

  const chart = ref({
    income: true,
    expense: true,
    sum: false,
  })

  function toggleChartVisibility(type: MoneyTypeSlugSum): void {
    chart.value[type] = !chart.value[type]
  }

  function toggleChartType() {
    periods.value[filterStore.periodNameWithoutAll].type = periods.value[filterStore.periodNameWithoutAll].type === 'line'
      ? 'bar'
      : 'line'
  }

  return {
    isShowDataLabels,

    initChart,
    setPeriodValues,

    addElementsToChart,
    removeElementsFromChart,
    setElementsToChart,

    periods,
    periodsNames,
    showDataLabels,
    hideDataLabels,

    chart,
    toggleChartType,
    toggleChartVisibility,
  }
})
