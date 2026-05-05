import type { useFilter } from '~/components/stat/filter/useFilter'

type PeriodSchema = {
  date: number
  showedPeriods: number
  type: 'line' | 'bar'
}

type Periods = {
  day: PeriodSchema
  month: PeriodSchema
  week: PeriodSchema
  year: PeriodSchema
}

export type PeriodNameWithAll = keyof Periods | 'all'

export type FilterProvider = ReturnType<typeof useFilter>
