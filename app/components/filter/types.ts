import type dayjs from 'dayjs'
import type { useFilter } from '~/components/filter/useFilter'

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

export type PeriodNameWithoutAll = keyof Periods | dayjs.ManipulateType
export type PeriodNameWithAll = PeriodNameWithoutAll | 'all'

export type PeriodsNames = {
  icon: string
  name: string
  slug: PeriodNameWithoutAll
}[]

export type FilterProvider = ReturnType<typeof useFilter>
