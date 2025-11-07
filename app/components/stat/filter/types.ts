import type { useFilter } from '~/components/stat/filter/useFilter'

export type PeriodSchema = {
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

export type PeriodNameWithAll = keyof Periods | 'all'

export type FilterProvider = ReturnType<typeof useFilter>
