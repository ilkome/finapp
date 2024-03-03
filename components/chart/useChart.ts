import localforage from 'localforage'
import { deepUnref } from 'vue-deepunref'
import { z } from 'zod'
import { useFilter } from '~/components/filter/useFilter'

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
export type PeriodName = keyof Periods
export type PeriodNameWithAll = PeriodName | 'all'

const isShowDataLabels = ref(false)

// TODO: Move to stat store
export const periods = ref<Periods>({
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

export function useChart() {
  const filterStore = useFilter()

  function showDataLabels() {
    isShowDataLabels.value = true
  }
  function hideDataLabels() {
    isShowDataLabels.value = false
  }

  function toggleChartType() {
    periods.value[filterStore.periodWithoutAll].type = periods.value[filterStore.periodWithoutAll].type === 'line'
      ? 'bar'
      : 'line'
  }

  function addElementsToChart() {
    periods.value[filterStore.periodWithoutAll].showedPeriods = periods.value[filterStore.periodWithoutAll].showedPeriods + 1
  }

  function removeElementsFromChart() {
    periods.value[filterStore.periodWithoutAll].showedPeriods = periods.value[filterStore.periodWithoutAll].showedPeriods - 1
  }

  function setElementsToChart(number: PeriodSchema['showedPeriods']) {
    periods.value[filterStore.periodWithoutAll].showedPeriods = number
  }

  async function initChart() {
    const localPeriods: Periods | null = await localforage.getItem('finapp.chart.periods')

    if (periodsSchema.safeParse(localPeriods).success === false)
      return false

    let showedPeriods
    for (const periodName in localPeriods) {
      showedPeriods = +localPeriods[periodName].showedPeriods
        ? localPeriods[periodName].showedPeriods
        : periods.value[periodName].showedPeriods

      const periodValues = {
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

  return {
    isShowDataLabels,

    initChart,
    setPeriodValues,

    addElementsToChart,
    removeElementsFromChart,
    setElementsToChart,

    showDataLabels,
    hideDataLabels,
    toggleChartType,
    periods,
  }
}
