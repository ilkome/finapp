// import dayjs from 'dayjs'
// import localforage from 'localforage'
// import { deepUnref } from 'vue-deepunref'
// import { z } from 'zod'
// import { useFilterStore } from '~/components/filter/useFilterStore'

// const periodSchema = z.object({
//   type: z.enum(['line', 'bar']),
//   showedPeriods: z.number(),
//   // date: z.number(),
// })

// const periodsSchema = z.object({
//   day: periodSchema,
//   week: periodSchema,
//   month: periodSchema,
//   year: periodSchema,
// })

// type Periods = z.infer<typeof periodsSchema>
// export type PeriodSchema = z.infer<typeof periodSchema>
// export type PeriodNameWithoutAll = keyof Periods
// export type PeriodNameWithAll = PeriodNameWithoutAll | 'all'

// /**
//  * @deprecated
//  */
// export const useChartStore = defineStore('chart', () => {
//   const { $i18n } = useNuxtApp()

//   const periods = ref<Periods>({
//     day: {
//       showedPeriods: 14,
//       type: 'line',
//       date: dayjs().valueOf(),
//     },
//     week: {
//       showedPeriods: 12,
//       type: 'line',
//       date: dayjs().valueOf(),
//     },
//     month: {
//       showedPeriods: 12,
//       type: 'line',
//       date: dayjs().valueOf(),
//     },
//     year: {
//       showedPeriods: 6,
//       type: 'line',
//       date: dayjs().valueOf(),
//     },
//   })

//   const periodsNames = computed<{
//     slug: PeriodNameWithoutAll
//     icon: string
//     name: string
//   }[]>(() => [{
//     slug: 'day',
//     icon: 'mdi mdi-weather-sunset-up',
//     name: $i18n.t('dates.day.simple'),
//   }, {
//     slug: 'week',
//     icon: 'mdi mdi-calendar-week',
//     name: $i18n.t('dates.week.simple'),
//   }, {
//     slug: 'month',
//     icon: 'mdi mdi-calendar',
//     name: $i18n.t('dates.month.simple'),
//   }, {
//     slug: 'year',
//     icon: 'mdi mdi-calendar-star',
//     name: $i18n.t('dates.year.simple'),
//   }])

//   const filterStore = useFilterStore()

//   function addPeriod() {
//     periods.value[filterStore.periodNameWithoutAll].showedPeriods = periods.value[filterStore.periodNameWithoutAll].showedPeriods + 1
//   }

//   function removePeriod() {
//     periods.value[filterStore.periodNameWithoutAll].showedPeriods = periods.value[filterStore.periodNameWithoutAll].showedPeriods - 1
//   }

//   function setPeriod(number: PeriodSchema['showedPeriods']) {
//     periods.value[filterStore.periodNameWithoutAll].showedPeriods = number
//   }

//   function setDate(date: number) {
//     periods.value[filterStore.periodNameWithoutAll].date = date
//   }

//   function toggleChartType() {
//     periods.value[filterStore.periodNameWithoutAll].type = periods.value[filterStore.periodNameWithoutAll].type === 'line'
//       ? 'bar'
//       : 'line'
//   }

//   async function initChart() {
//     const localPeriods: Periods | null = await localforage.getItem('finapp.chart.periods')

//     if (periodsSchema.safeParse(localPeriods).success === false)
//       return false

//     for (const periodName in localPeriods) {
//       const showedPeriods = +localPeriods[periodName].showedPeriods
//         ? localPeriods[periodName].showedPeriods
//         : periods.value[periodName].showedPeriods

//       const periodValues: Periods = {
//         ...localPeriods[periodName],
//         showedPeriods,
//       }

//       setPeriodValues(periodName, periodValues)
//     }
//   }

//   function setPeriodValues(periodName, values) {
//     periods.value[periodName] = {
//       ...periods.value[periodName],
//       ...values,
//     }
//   }

//   watch(periods, (newPeriods) => {
//     localforage.setItem('finapp.chart.periods', deepUnref(newPeriods))
//   }, { immediate: true, deep: true })

//   const ui = ref({
//     income: true,
//     expense: true,
//     sum: false,
//     isShowDataLabels: false,
//   })

//   function setUi(key, value) {
//     ui.value[key] = value
//   }

//   function toggleUi(key) {
//     ui.value[key] = !ui.value[key]
//   }

//   return {
//     initChart,
//     setPeriodValues,

//     addPeriod,
//     removePeriod,
//     setPeriod,

//     setDate,

//     periods,
//     periodsNames,

//     ui,
//     setUi,
//     toggleUi,
//     toggleChartType,
//   }
// })
